# Sonos Snooze Refactor — Plan for Review

**Status:** Plan only. Not yet implemented. Awaiting Mac's review and explicit go.
**Created:** 2026-05-22, by Claude Opus 4.7 in collaboration with Mac
**Scope:** `packages/sonos_package.yaml` — `script.sonos_snooze_next_alarm`,
`script.sonos_dismiss_alarm`, `automation.sonos_reset_snoozed_after_play`,
plus one new automation. No changes to other packages, dashboards, or
custom_components.

---

## 1. The Bug, Stated Cleanly

The current Sonos snooze/dismiss design uses the *Sonos cloud's per-alarm
time field* as the storage medium for snooze state. Every snooze mutates
the alarm's `time` attribute via `sonos.update_alarm(alarm_id, time=new)`.
This call resets Sonos's internal per-alarm tracking — dismiss flags,
native-snooze offsets, fire history — because Sonos cloud treats any
write to the time field as "this is a new schedule, forget the old one."

The HA scripts and the Sonos cloud are racing to own the same field.
Whichever writes last wins, and the loser's state is silently discarded.

This is not a single failing line of code. It's a category of design
mismatch: HA is using one variable (`switch.sonos_alarm_X.time`) for
two purposes (recurring schedule + snooze offset), and the Sonos cloud
uses the same variable for a third purpose (per-day fire-state tracking).

---

## 2. Symptoms (everything Mac observed this session)

| Symptom | When observed | Mechanism |
|---|---|---|
| Alarm fires at wrong time | Thu 5/21 05:40 (expected 05:30); Fri 5/22 05:40 | Sonos cloud's time field drifted +10 min from last interaction |
| HA dashboard shows wrong time | Until Fri 5/22 11:35 MDT | HA polls Sonos cloud lazily; cached time was 05:30 while Sonos cloud held 05:40 |
| Alarm sounds "very quiet at all levels" | Thu/Fri mornings | Sonos's "Increase volume while alarm rings" soft-wake ramp produces audibly quieter output than `media_player.volume_set` at the same numeric level |
| `play_media` of same URI is audible | T1 test Fri 5/22 17:06 MDT | `media_player.play_media` uses a different speaker pipeline than alarm-fire mode |
| No HA traces explain the time drift | Wed 5/20 06:30 → Thu 5/21 05:40 window | The mutation was Sonos-side, triggered by physical play button on Play:3 top → Sonos's native ~9 min snooze |
| `sensor.sonos_alarms_for_tomorrow` storm | Continuous | `debug_processing_time_utc` attribute updates on every sensor re-evaluation → state trigger on shadow_resolver fires ~14/min |

The storm is a separate pre-existing bug; already fixed and deployed today
via `attribute: alarm_count` filter. Listed here only for completeness.

---

## 3. Root Cause

Three writers, one variable.

```
WRITERS to switch.sonos_alarm_bedroom.time (alarm_id 42)
├─ A. script.sonos_snooze_next_alarm
│      → sonos.update_alarm(42, time=original+N) on every snooze tap
│      → wipes Sonos cloud's per-alarm tracking for alarm 42
│
├─ B. script.sonos_reset_snoozed_alarm (called from reset-after-play
│      automation)
│      → sonos.update_alarm(42, time=original_from_helper) on restore
│      → also wipes Sonos cloud's per-alarm tracking
│
├─ C. Sonos cloud itself (when user presses physical play button on
│      Play:3 top during alarm-fire)
│      → applies native ~9 min snooze; mutates time field
│      → not visible in HA automation/script traces

READERS of the same field
├─ X. switch.sonos_alarm_bedroom entity (HA-visible "time" attribute)
├─ Y. sensor.sonos_alarms_for_tomorrow (computes tomorrow's schedule)
├─ Z. sensor.sonos_alarm_playing (cross-references against alarm time
│      to detect alarms by music URI in time window)
└─ The Sonos device itself, which fires the alarm at this time

USER-PERCEPTIBLE EFFECT
└─ The time field is constantly being rewritten, and Sonos cloud's
   per-alarm tracking (which is keyed off whether this field has been
   touched recently) keeps getting reset. Behaviour becomes
   non-deterministic across days because we never know which writer
   touched it last or what Sonos remembers.
```

The clean architectural rule: *the canonical recurring schedule should
be immutable; snooze state should live in a separate variable that the
Sonos cloud doesn't read.* That separate variable can be a HA helper
because we control HA.

---

## 4. Conditions Under Which the Bug Manifests

The system enters a degraded state whenever any of these happen:

| Trigger | Result |
|---|---|
| User taps Snooze 5/10/15 in the phone notification | `sonos_snooze_next_alarm` runs → time mutation A → Sonos state reset |
| User dismisses on the phone notification while alarm is ringing | `sonos_dismiss_alarm` runs (clean) → BUT reset-after-play then fires → reset script time mutation B → Sonos state reset |
| User presses physical play button on Play:3 during alarm | Sonos native snooze C → Sonos state mutated outside HA's view |
| User edits alarm in Sonos app | Sonos creates new alarm_id (per Mac's prior observation); old alarm_id may still exist disabled. Adds alarm proliferation. |

In the last 7 days the alarm has experienced at least 3 mutations today
alone (T3 reset, this session's test +2-min, restore back to 05:30).
Each mutation is a fresh roll of the dice on what Sonos's per-alarm
internal state holds.

The reason Wed 5/20 fired correctly at 05:30 but Thu 5/21 fired at
05:40: between Wed 06:30 (alarm ended) and Thu 05:30 (next expected
fire), Mac presumably pressed the play button on the speaker top to
dismiss — triggering native +9-10 min snooze — and Sonos remembered
that snooze offset for the next-day fire.

---

## 5. How to Replicate (and why we mostly can't)

Pure replication of the bug requires the user to interact with the
alarm during fire (physical button OR phone notification snooze) AND
then wait for the next-day scheduled fire to observe the drift.

Faster replication strategies, each with caveats:

**Strategy A — Synthetic alarm-time mutation, observe drift on
next-day fire**
1. Note current alarm.time
2. Call `sonos.update_alarm(alarm_id, time=now+2min)`
3. Wait for fire (HA buzzer at the new time)
4. Snooze via phone notification → time mutates +5
5. Re-fire at original+7
6. Dismiss via phone → reset-after-play restores to original+2
7. Manually restore to canonical 05:30 (this is *another* mutation)
8. Wait 24h for next scheduled fire to observe whether it fires at 05:30

**Why this is imperfect:** every step from 1-7 mutates the alarm time.
By the time we reach step 8, Sonos's cloud-side state has been wiped 4+
times in the test. The fact that the alarm fires at 05:30 on day 2
doesn't prove the original bug is fixed; it just proves Sonos's cloud
*currently* believes the alarm is at 05:30.

**Strategy B — Don't replicate. Use the diagnosis as proof.**
We have indirect evidence sufficient for confidence:
- The time field IS the field Sonos uses for next-day scheduling (HA
  entity attribute confirms)
- Sonos's cloud reset of dismiss flags on time mutation is documented
  Sonos behavior (per Mac's domain knowledge)
- The +10 min drift observed Wed→Thu coincides with the known Sonos
  native-snooze interval (~9-10 min)
- The behavior is consistent across the two affected mornings

We accept the architectural diagnosis without a clean repro and
implement the refactor.

---

## 6. The Solution

### 6.1 Design principles

1. **Sonos alarm time is immutable from HA.** No HA script or
   automation ever calls `sonos.update_alarm(time=...)` on a recurring
   alarm. Enabled-flag updates are still permitted (for the
   `sonos_enable_*` / `sonos_disable_*` quick-action scripts; those
   don't touch time).

2. **Snooze state lives in HA helpers, not in Sonos cloud.** The
   existing `input_text.sonos_snoozed_alarm_<room>` helpers are
   repurposed to store *when to re-fire*, not the original time.
   Format: `<alarm_entity>|<ISO_timestamp>`.

3. **Re-fire is HA-triggered.** A new automation `sonos_snooze_refire`
   runs once per minute, scans the helpers, and if any room's helper
   has a `snooze_until` ≤ now(), fires `play_media x-rincon-buzzer:0`
   on the corresponding speaker. The buzzer URI makes
   `sensor.sonos_alarm_playing` go True, which:
     - Reuses existing alarm-playing notification path (no change)
     - Triggers the existing volume-override automation
       (deployed today; no change)
     - Lets the dismiss/snooze cycle work for the re-fire too

4. **Dismiss is unchanged in intent; cleaned in implementation.**
   `sonos_dismiss_alarm` still calls `media_player.media_stop` on the
   playing speaker. It additionally clears the room's helper so the
   refire automation doesn't fire after dismiss. No `sonos.update_alarm`
   call; no time mutation.

5. **Reset-after-play becomes a safety-net helper-clear, not a
   time-restore.** Since the time was never changed in the first place,
   there's nothing to restore. The automation's only remaining purpose
   is to clear any stale helpers if an alarm fired and ended naturally
   without dismiss.

### 6.2 File-level changes (scoped to `packages/sonos_package.yaml`)

#### Change 6.2.A — Rewrite `script.sonos_snooze_next_alarm`

**Before (current, lines 2603–2686 in current file):** reads
alarm_id and current time, computes new_time, stores original time in
helper, calls `media_stop`, calls `sonos.update_alarm(alarm_id, new_time)`.

**After:**
```yaml
sonos_snooze_next_alarm:
  alias: "Sonos - Snooze Next Alarm (HA-side, no cloud mutation)"
  description: >
    Snooze a ringing alarm without modifying the Sonos cloud's alarm
    time field. Stores snooze_until_ISO in input_text helper; the
    sonos_snooze_refire automation replays the buzzer at that time.
  icon: mdi:alarm-snooze
  mode: single
  fields:
    minutes:
      description: "Number of minutes to snooze (default: 15)"
      required: false
      default: 15
      selector:
        number: { min: 1, max: 60 }
    stop_playback:
      description: "Stop alarm audio before snoozing (default: false)"
      required: false
      default: false
      selector:
        boolean:
  sequence:
    - variables:
        snooze_mins: "{{ minutes | default(15) | int }}"
        playing_speaker: "{{ state_attr('sensor.sonos_alarm_playing', 'speaker') | default('') | trim }}"
        playing_alarm: "{{ state_attr('sensor.sonos_alarm_playing', 'alarm_entity') | default('') | trim }}"
        target_alarm: >
          {% if playing_alarm != '' %}
            {{ playing_alarm }}
          {% else %}
            {{ state_attr('sensor.sonos_next_alarm', 'next_alarm_entity') | default('') }}
          {% endif %}

    - condition: template
      value_template: "{{ target_alarm != '' }}"

    - variables:
        snooze_until: "{{ (now() + timedelta(minutes=snooze_mins)).strftime('%Y-%m-%dT%H:%M:%S') }}"
        speaker: >
          {% set name = state_attr(target_alarm, 'friendly_name') | default('') %}
          {% if 'Bedroom' in name %}media_player.bedroom
          {% elif 'Bath' in name %}media_player.bath
          {% elif 'Kitchen' in name %}media_player.kitchen
          {% elif 'Living' in name %}media_player.living_room
          {% else %}media_player.dining_room{% endif %}
        room_key: >
          {% set name = state_attr(target_alarm, 'friendly_name') | default('') %}
          {% if 'Bedroom' in name %}bedroom
          {% elif 'Bath' in name %}bath
          {% elif 'Kitchen' in name %}kitchen
          {% elif 'Living' in name %}living_room
          {% else %}dining_room{% endif %}
        snoozed_helper: "input_text.sonos_snoozed_alarm_{{ room_key }}"
        target_speaker: "{{ playing_speaker if playing_speaker else speaker }}"

    # Latest snooze wins on repeated taps (replace, not append)
    - action: input_text.set_value
      target:
        entity_id: "{{ snoozed_helper }}"
      data:
        value: "{{ target_alarm }}|{{ snooze_until }}"

    - if: "{{ stop_playback | default(false) }}"
      then:
        - action: media_player.media_stop
          target:
            entity_id: "{{ target_speaker }}"

    - action: system_log.write
      data:
        message: >
          Sonos Snooze (HA-side): {{ target_alarm }} snooze_until={{ snooze_until }}
          ({{ snooze_mins }} min). Speaker: {{ target_speaker }}. Sonos cloud alarm NOT modified.
        level: info
```

#### Change 6.2.B — Extend `script.sonos_dismiss_alarm`

**Before (current, lines 2691–2704):** reads playing_speaker, calls
`media_stop` on it.

**After:** same as current, plus clear the room's helper so refire
doesn't fire after dismiss.

```yaml
sonos_dismiss_alarm:
  alias: "Sonos - Dismiss Alarm"
  description: "Stop alarm audio and cancel any pending HA-side snooze"
  icon: mdi:alarm-off
  mode: single
  sequence:
    - variables:
        playing_speaker: "{{ state_attr('sensor.sonos_alarm_playing', 'speaker') | default('', true) | trim }}"
        room_key: >
          {% if playing_speaker == 'media_player.bedroom' %}bedroom
          {% elif playing_speaker == 'media_player.bath' %}bath
          {% elif playing_speaker == 'media_player.kitchen' %}kitchen
          {% elif playing_speaker == 'media_player.living_room' %}living_room
          {% elif playing_speaker == 'media_player.dining_room' %}dining_room
          {% else %}{% endif %}
        helper_entity: "input_text.sonos_snoozed_alarm_{{ room_key }}"
    - condition: template
      value_template: "{{ playing_speaker != '' and states('sensor.sonos_alarm_playing') == 'True' }}"
    - action: media_player.media_stop
      target:
        entity_id: "{{ playing_speaker }}"
    - if: "{{ room_key != '' }}"
      then:
        - action: input_text.set_value
          target:
            entity_id: "{{ helper_entity }}"
          data:
            value: ""
    - action: system_log.write
      data:
        message: >
          Sonos Dismiss (HA-side): {{ playing_speaker }} silenced; snooze helper
          cleared for room={{ room_key }}. Sonos cloud alarm NOT modified.
        level: info
```

#### Change 6.2.C — Add new `automation.sonos_snooze_refire`

```yaml
- id: sonos_snooze_refire
  alias: "Sonos - Snooze Refire (HA-side)"
  description: >
    Every minute, scan input_text.sonos_snoozed_alarm_<room> helpers.
    Any helper whose snooze_until ISO timestamp is ≤ now() triggers a
    play_media of the Sonos buzzer URI on the corresponding speaker,
    then clears the helper. The buzzer playback makes
    sensor.sonos_alarm_playing go True, which reuses the existing
    notification and volume-override paths.
  mode: parallel
  max: 5
  trigger:
    - platform: time_pattern
      minutes: "/1"
  action:
    - variables:
        rooms: ['bedroom', 'bath', 'kitchen', 'living_room', 'dining_room']
    - repeat:
        for_each: "{{ rooms }}"
        sequence:
          - variables:
              current_room: "{{ repeat.item }}"
              helper_entity: "input_text.sonos_snoozed_alarm_{{ current_room }}"
              helper_value: "{{ states(helper_entity) }}"
              has_snooze: "{{ helper_value not in ['', 'unknown', 'unavailable'] and '|' in helper_value }}"
          - if: "{{ has_snooze }}"
            then:
              - variables:
                  parts: "{{ helper_value.split('|') }}"
                  alarm_entity: "{{ parts[0] }}"
                  snooze_until_str: "{{ parts[1] }}"
                  snooze_until_ts: "{{ as_timestamp(snooze_until_str) | int(0) }}"
                  now_ts: "{{ now().timestamp() | int }}"
                  should_fire: "{{ snooze_until_ts > 0 and now_ts >= snooze_until_ts }}"
                  speaker: >
                    {% if current_room == 'bedroom' %}media_player.bedroom
                    {% elif current_room == 'bath' %}media_player.bath
                    {% elif current_room == 'kitchen' %}media_player.kitchen
                    {% elif current_room == 'living_room' %}media_player.living_room
                    {% else %}media_player.dining_room{% endif %}
                  volume: "{{ state_attr(alarm_entity, 'volume') | float(0.7) }}"
              - if: "{{ should_fire }}"
                then:
                  # Clear helper FIRST (idempotency: prevents re-fire on next minute
                  # if play_media is slow)
                  - action: input_text.set_value
                    target:
                      entity_id: "{{ helper_entity }}"
                    data:
                      value: ""
                  - action: media_player.volume_set
                    target:
                      entity_id: "{{ speaker }}"
                    data:
                      volume_level: "{{ volume }}"
                  - action: media_player.play_media
                    target:
                      entity_id: "{{ speaker }}"
                    data:
                      media_content_id: "x-rincon-buzzer:0"
                      media_content_type: "music"
                  - action: system_log.write
                    data:
                      message: >
                        Sonos Snooze Refire (HA-side): {{ alarm_entity }} re-fired on
                        {{ speaker }} at {{ snooze_until_str }}. Helper cleared.
                      level: info
```

#### Change 6.2.D — Repurpose `automation.sonos_reset_snoozed_after_play`

**Before (current, lines 3013–3045):** calls `script.sonos_reset_snoozed_alarm`
which mutates the alarm time via `sonos.update_alarm`. This was the
original snooze-time-restore mechanism.

**After:** since time is never changed, nothing to restore. Replace
the body to be a helper-clearing safety-net only — useful for the edge
case where an alarm rang to natural end without dismiss (e.g., the
phone was off). Don't call the reset script anymore.

```yaml
- id: sonos_reset_snoozed_after_play
  alias: "Sonos - Clear Helper After Alarm Stops (safety net)"
  description: >
    When sensor.sonos_alarm_playing goes True→False, clear the room's
    snooze helper as a safety net. Under the new design, the helper
    should already be empty (dismiss clears it; refire clears it before
    playing). This catches the natural-end case (alarm ran to its full
    duration without user dismiss) where the helper would otherwise
    persist a stale snooze_until that's now in the past.
  mode: single
  trigger:
    - platform: state
      entity_id: sensor.sonos_alarm_playing
      from: "True"
      to: "False"
  action:
    - variables:
        last_speaker: "{{ trigger.from_state.attributes.speaker | default('') }}"
        room_key: >
          {% if last_speaker == 'media_player.bedroom' %}bedroom
          {% elif last_speaker == 'media_player.bath' %}bath
          {% elif last_speaker == 'media_player.kitchen' %}kitchen
          {% elif last_speaker == 'media_player.living_room' %}living_room
          {% elif last_speaker == 'media_player.dining_room' %}dining_room
          {% else %}{% endif %}
        helper_entity: "input_text.sonos_snoozed_alarm_{{ room_key }}"
    - condition: template
      value_template: "{{ room_key != '' }}"
    - delay:
        seconds: 5
    - action: input_text.set_value
      target:
        entity_id: "{{ helper_entity }}"
      data:
        value: ""
```

Note: the SA5 60-second discriminator on `script.sonos_snooze_next_alarm.last_triggered`
is no longer needed because the action is just helper-clear and is
idempotent. We can drop that condition.

#### Change 6.2.E — Demote `script.sonos_reset_snoozed_alarm`

Keep the script body present (for backward compatibility with any
external caller) but make it a no-op that just logs a warning. This
preserves the entity_id `script.sonos_reset_snoozed_alarm` if any
dashboard / external automation references it.

```yaml
sonos_reset_snoozed_alarm:
  alias: "Sonos - Reset Snoozed Alarm (DEPRECATED no-op)"
  description: >
    DEPRECATED 2026-05-22. Under the HA-side snooze design, the Sonos
    cloud alarm time is never mutated, so there is nothing to restore.
    This script is preserved as a no-op for backward compatibility.
  mode: queued
  fields:
    room:
      required: false
      selector:
        select:
          options: [bedroom, bath, kitchen, living_room, dining_room]
  sequence:
    - action: system_log.write
      data:
        message: >
          script.sonos_reset_snoozed_alarm called (room={{ room | default('all') }})
          — no-op under HA-side snooze design. Time field is immutable.
        level: warning
```

### 6.3 What stays unchanged

These were already updated in this session and remain correct under
the new design:

- `automation.sonos_evening_alarm_check_shadow_resolver` (storm fix
  already deployed)
- `automation.sonos_bedroom_alarm_safety_net` (already deployed; still
  useful as a 05:33 backup when Sonos fails entirely)
- `automation.sonos_bedroom_alarm_volume_override` (already deployed;
  works the same way for HA-triggered refire as it does for Sonos's
  native alarm-fire — both make `sensor.sonos_alarm_playing` go True
  with `speaker=media_player.bedroom`, which is the override's trigger)
- `automation.sonos_alarm_playing_notification` (existing; sends phone
  push when alarm starts; works the same for HA-triggered refire)
- `automation.sonos_midnight_snoozed_reset` (existing daily cleanup;
  still useful as deep safety net)
- All `sonos_enable_*` / `sonos_disable_*` scripts (these touch
  `enabled` not `time`; safe)
- The reset-after-play SA5 60-sec discriminator on
  `script.sonos_snooze_next_alarm.last_triggered` — becomes redundant
  but doesn't hurt; can drop or keep

### 6.4 What the user experiences after the refactor

**Morning at 05:30 (Sonos's native alarm fire, unchanged):**
1. Sonos cloud fires alarm 42 at 05:30
2. `sensor.sonos_alarm_playing` goes True
3. `automation.sonos_bedroom_alarm_volume_override` fires; sets
   volume to 0.7 every 2 sec for 30 sec, overriding Sonos's ramp
4. `automation.sonos_alarm_playing_notification` sends phone push
5. User hears full-volume alarm. Same as today.

**User taps Snooze 5 in the phone notification (new flow):**
1. `sonos_alarm_notification_action_handler` calls
   `script.sonos_snooze_next_alarm` with minutes=5, stop_playback=true
2. The new snooze script:
   - Computes snooze_until = now() + 5 min
   - Stores `switch.sonos_alarm_bedroom|<ISO>` in
     `input_text.sonos_snoozed_alarm_bedroom`
   - Calls `media_stop` on bedroom (silence)
   - **Does NOT call** `sonos.update_alarm`. Sonos cloud's alarm 42 is
     untouched.
3. `sensor.sonos_alarm_playing` goes False
4. `automation.sonos_reset_snoozed_after_play` fires, 5-sec delay,
   clears the helper. **PROBLEM:** this clears the snooze we just set.
   See §6.5 race condition.

**5 minutes later (HA-triggered refire):**
1. `automation.sonos_snooze_refire` (time_pattern minutes='/1') ticks
2. Reads `input_text.sonos_snoozed_alarm_bedroom`; finds
   `switch.sonos_alarm_bedroom|<ISO 5 min ago>`
3. snooze_until ≤ now, so should_fire = true
4. Clears the helper (idempotency)
5. Sets bedroom volume to 0.7
6. Calls `play_media x-rincon-buzzer:0` on bedroom
7. `sensor.sonos_alarm_playing` goes True (URI match)
8. Volume override fires (re-asserts 0.7)
9. Notification action handler is triggered again (because sensor went
   True → repeat alarm-playing notification path)
10. User hears full-volume alarm. Can snooze or dismiss again.

**User dismisses on phone notification:**
1. `script.sonos_dismiss_alarm` runs
2. Calls `media_stop` on bedroom
3. Clears `input_text.sonos_snoozed_alarm_bedroom`
4. Done. No refire. No time mutation. Sonos cloud's alarm 42 is
   untouched and unchanged.

**Next day 05:30:**
1. Sonos cloud fires alarm 42 at its canonical 05:30 (we never
   modified it)
2. Same as previous morning.

### 6.5 Known race condition to resolve before deploy

After the snooze script sets the helper, the `media_stop` causes
`sensor.sonos_alarm_playing` to go True → False. The
`sonos_reset_snoozed_after_play` automation (repurposed to clear
helpers) fires after a 5-sec delay and would clear the snooze we just
set, defeating the refire.

**Mitigation options (pick one before deploy):**

- **R1 — Skip-if-snooze-just-ran discriminator.** Add a condition to
  `sonos_reset_snoozed_after_play` analogous to the existing SA5
  60-second guard, but on `script.sonos_snooze_next_alarm.last_triggered`.
  If snooze ran in the last 60 sec, skip the helper clear.

- **R2 — Remove the reset-after-play helper clear entirely.** Rely on
  the refire automation's own helper-clear (which fires before
  play_media) and dismiss's helper-clear. The natural-end edge case
  (alarm runs to full duration without dismiss) leaves a stale helper
  with snooze_until in the past — the refire automation would then
  immediately fire on its next minute tick, which is *not what we
  want* if the user just let the alarm play through naturally.

  Mitigation for R2: refire automation could check whether the
  alarm-original-time has just passed (within last X minutes) and skip
  refire in that case. Adds complexity.

- **R3 — Use a sentinel value in the helper during snooze.** Snooze
  sets `switch.sonos_alarm_<room>|<ISO_snooze_until>` WITH a sentinel
  prefix like `SNOOZE:switch.sonos_alarm_<room>|<ISO>`. Reset-after-play
  only clears helpers that don't start with `SNOOZE:`. Refire clears
  the sentinel after firing. Cleaner separation of states.

**My recommendation: R1.** It's the minimum change consistent with the
SA5 fix pattern already deployed (the 60-sec discriminator approach is
proven, just for a different code path). R3 is more elegant but
introduces a new format that the dashboard or any other reader of the
helper would need to handle.

This is the one decision Mac should weigh in on before deploy.

---

## 7. Risks & Migration

**Risk 1 — Existing snoozed helpers may carry the old format.**
If `input_text.sonos_snoozed_alarm_<room>` currently contains an entry
in the old format (`<alarm_entity>|<HH:MM:SS>`), the refire automation
would try to parse it as ISO and fail (or interpret HH:MM:SS as a
1970-01-01 epoch timestamp, fire immediately, which is wrong).

Mitigation: pre-deploy step that clears all current helpers. We can
verify state via MCP first (`input_text.sonos_snoozed_alarm_*` should
all be empty currently per my earlier checks — confirmed at session
start). If empty, no migration needed. If not, we set them to empty
via input_text.set_value before deploy.

**Risk 2 — External callers of `script.sonos_reset_snoozed_alarm`.**
The script becomes a no-op. We need to verify nothing depends on its
side-effect of mutating the alarm time. Grep results from earlier
session confirm only:
- `automation.sonos_reset_snoozed_after_play` (we're repurposing)
- `automation.sonos_midnight_snoozed_reset` (calls
  `sonos_reset_snoozed_alarm` with no args; was a backstop; now a
  no-op which is fine)
- Possible dashboard/script call we haven't found — quick grep
  pre-deploy to confirm.

**Risk 3 — `sensor.sonos_alarm_playing` may not detect the HA-triggered
refire fast enough.**
The sensor template (lines 763–819) checks for `x-rincon-buzzer` in
media_content_id. When we call `play_media x-rincon-buzzer:0`, the
content_id is set immediately (verified in T1 + T5). The sensor's
template re-evaluation should pick it up within HA's state-update
latency (sub-second). The
`sonos_alarm_playing_notification` automation has a 3-second
`for:` filter, so the notification might fire slightly later than a
native Sonos fire — but that's already the case today and not a
regression.

**Risk 4 — Two refire firings if a snooze is interrupted by Sonos's
own next-day fire.**
If the user snoozes at 05:32 for 30 min (snooze_until = 06:02), and
Sonos's alarm 42 happens to fire again at 06:00 (next-day boundary —
shouldn't happen on the same day, but worth considering), the
sensor.sonos_alarm_playing would go True again from Sonos's fire,
notification would fire, AND at 06:02 the refire automation would
ALSO play the buzzer. Double-fire annoyance.

Mitigation: refire automation could add a condition
`sensor.sonos_alarm_playing == False` before firing — i.e., only
refire if no alarm is currently playing. Cheap to add.

**Risk 5 — Reload race.**
Deploy + reload affects automation states. Existing in-flight snoozes
(helpers with snooze_until in the future) would survive the reload.
Refire automation re-arms after reload and would correctly fire at the
scheduled time.

**Risk 6 — User opens Sonos app and edits the alarm.**
This still creates a new alarm_id (Sonos's behavior, not ours). HA's
`switch.sonos_alarm_bedroom` entity rebinds via integration discovery.
Snooze code uses `state_attr(target_alarm, 'alarm_id')` at execution
time so it picks up the current alarm_id. No regression.

---

## 8. Validation Plan (post-deploy, before declaring success)

Test these IN ORDER. Stop at first failure.

| # | Step | Expected result |
|---|---|---|
| V1 | Reload HA. Pull `switch.sonos_alarm_bedroom`. Confirm time=05:30, alarm_id=42, on, WEEKDAYS. | Pass |
| V2 | Confirm 3 new/changed automations registered: `sonos_snooze_refire` (new), `sonos_reset_snoozed_after_play` (repurposed), `sonos_alarm_playing_notification` (unchanged). All ON. | Pass |
| V3 | Play `x-rincon-buzzer:0` on bedroom via play_media at vol 0.3. Confirm `sensor.sonos_alarm_playing` goes True. Confirm `volume_override` fires (volume jumps to 0.7). | Pass |
| V4 | While sensor=True, call `script.sonos_snooze_next_alarm` with minutes=2. Confirm: (a) helper set to `switch.sonos_alarm_bedroom\|<ISO 2-min-future>`, (b) `media_stop` ran (sensor goes False), (c) `switch.sonos_alarm_bedroom.time` UNCHANGED at 05:30. | Pass |
| V5 | Wait 2 min. Confirm refire automation fires, helper clears, play_media buzzer starts, sensor goes True, volume override fires. | Pass |
| V6 | Call `script.sonos_dismiss_alarm`. Confirm: (a) `media_stop` ran, (b) helper cleared, (c) `switch.sonos_alarm_bedroom.time` STILL UNCHANGED. | Pass |
| V7 | Pull final state. Confirm alarm time = 05:30, helper empty, no automation traces in last minute. | Pass |

**V8 — Real Monday morning fire.** This is the ground truth. If V1–V7
all pass, Monday 5:30 MDT alarm should fire at 05:30 (Sonos cloud
untouched) and the volume override should make it audible.

If V8 fails, the diagnosis is wrong and we need to keep digging.

---

## 9. Rollback Plan

Single-commit revert: `git revert <refactor-commit-sha>` then
`bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh` to
re-push. The deploy script's auto-backup gives us a server-side YAML
backup as well.

If V1–V7 fail in a way that leaves the system in a broken state
(e.g., snooze stuck, helpers populated), manual cleanup steps:

```
# Clear all snooze helpers
for room in bedroom bath kitchen living_room dining_room; do
  call input_text.set_value entity=input_text.sonos_snoozed_alarm_$room value=""
done
# Confirm alarm time canonical
call sonos.update_alarm alarm_id=42 time=05:30:00 entity=media_player.bedroom
```

Note: that last call IS a time mutation — but if we're rolling back,
the bug is on the table again and one more mutation doesn't hurt.

---

## 10. Decision Points for Mac

Before I implement:

1. **§6.5 race condition mitigation:** R1 (snooze-recent-discriminator),
   R2 (drop reset-after-play helper clear), or R3 (sentinel prefix)?
   My recommendation: R1.

2. **Risk 4 mitigation:** add `sensor.sonos_alarm_playing == False`
   condition to refire automation? Cheap insurance, my recommendation: yes.

3. **Scope:** apply to all 5 rooms (bedroom/bath/kitchen/living_room/dining_room)
   in one commit, or just bedroom first and roll out per-room?
   My recommendation: all 5 at once. The existing code already operates
   on all 5; consistent refactor.

4. **Deploy timing:** deploy tonight (before Monday morning's natural
   test) or wait until after Monday's observation? Deploying tonight
   means Monday tests *the new design*, not the old design with
   symptom-level fixes. Mac chose the symptom-level mitigations as a
   safety net regardless.
   My recommendation: deploy tonight; the volume override + safety net
   already deployed remain a safety net even if the refactor has
   surprises.

5. **`script.sonos_reset_snoozed_alarm` demotion:** keep as a logging
   no-op, or remove entirely?
   My recommendation: keep as logging no-op for backward compat
   safety.

Mac's call on each. I won't proceed to implementation until Mac
acknowledges the plan and any modifications.

---

## 11. Open questions I cannot resolve from inside HA

- Is there a way to query Sonos cloud's per-alarm internal state
  (dismiss flags, native snooze offset) directly? If yes, we could
  validate the diagnosis empirically. Probably requires Sonos app
  diagnostics or Sonos support.
- Does disabling "Increase volume while alarm rings" in the Sonos app
  also disable the soft-wake ramp for HA-triggered play_media? If yes,
  we could remove the volume-override automation as redundant. Worth
  checking later but not blocking.

---

End of plan. Awaiting Mac's review and explicit go (or modifications).
