# Bedroom Sonos Silent-Fire — Staging Document

**Created:** 2026-05-22 ~17:35 MDT by Claude Opus 4.7 during autonomous investigation.
**Purpose:** Stage the defense-in-depth automation and the alarm
delete+recreate procedure WITHOUT deploying. Mac reviews and chooses
when to apply.

This file is documentation only — nothing here changes live HA until
Mac runs a deploy step. The active runtime alarm 42 was restored to
05:30 WEEKDAYS during the investigation session (T3); that's the only
state change made.

---

## Problem statement (one paragraph)

Bedroom Sonos (Play:3, sw_version 17.2.5) reports a complete 60-min
alarm playback sequence in HA telemetry on Thu 5/21 and Fri 5/22
mornings — including the standard 0.02→0.7 volume fade-in over 28
seconds — but the speaker amplifier produced no audible output, per
direct user observation. Manual `media_player.play_media` of the
same `x-rincon-buzzer:0` URI on the same speaker DOES produce audio
(verified T1 2026-05-22 17:06 MDT at volume 0.5). The alarm time also
silently drifted from 05:30 to 05:40 between Wed evening and Thu
morning with no HA-side automation/script trace. Both symptoms started
together, coinciding with a brief speaker unavailable event Tue 5/19
21:13–21:16 MDT. Hypothesis: degraded Play:3 firmware/audio-pipeline
state. Primary remediation: physical power-cycle of the speaker.

See `~/.claude/projects/-home-mac-HA-implementation-10/memory/project_bedroom_sonos_alarm_silent_fire_pattern.md`
for the full diagnostic record.

---

## Section A — Power-cycle procedure (Mac executes)

1. Unplug the bedroom Sonos Play:3 from power.
2. Wait 30 seconds.
3. Plug back in. The speaker boots in ~30–60 seconds.
4. Wait an additional 60 seconds for full Sonos cloud reconnect.
5. Reply to the session — Claude will rerun the buzzer test (T1
   redux) on the bedroom speaker via `media_player.play_media`.
6. Claude will also re-pull `switch.sonos_alarm_bedroom` attributes
   to confirm `time: "05:30:00"` and `alarm_id: 42` are unchanged
   post-reboot. If the time drifts back to 05:40 on reboot, the
   cloud-side state for alarm 42 is itself corrupted — proceed to
   Section B (delete+recreate).

---

## Section B — If alarm 42 is cloud-side corrupted: delete + recreate

Skip this section unless Section A produces a post-reboot time other
than 05:30, OR Monday's 05:30 fire (Section C) is again silent
despite a successful power-cycle.

### B.1 Delete alarm 42 (Sonos app side — Mac executes)

Sonos's `sonos.update_alarm` HA service can disable but not delete.
Deletion must happen in the Sonos S2 (or S1) app:
1. Open the Sonos app → Settings → System → Bedroom → Alarms.
2. Long-press "Bedroom Alarm Weekdays" (alarm_id 42) → Delete.
3. The HA entity `switch.sonos_alarm_bedroom` will become
   unavailable shortly after.

### B.2 Create a fresh weekday alarm

In the Sonos app:
1. Settings → System → Bedroom → Alarms → Add Alarm.
2. Configure: time 05:30, Bedroom Sonos, recurrence Weekdays,
   sound Sonos Chime (or your preferred), volume 70%, duration 60 min.
3. Save.

HA will re-discover a new switch.sonos_alarm_<id> entity with the
new alarm_id. To keep the existing `switch.sonos_alarm_bedroom`
canonical name working, the alarm entity might need to be renamed
in HA's entity registry (or the package's references updated).

This step has follow-on work in the codebase if the new alarm_id
is not 42. Specifically, these hardcoded references in
`packages/sonos_package.yaml` would need updating:

```
Line 2452: alarm_id: 42 (sonos_enable_weekday_alarms)
Line 2483: alarm_id: 42 (sonos_enable_all_alarms)
Line 2513: alarm_id: 42 (retry block)
Line 2544: alarm_id: 42 (sonos_disable_all_alarms)
Line 2574: alarm_id: 42 (retry block)
```

If Mac decides on the recreate path, the safe sequence is:
  (i)   Mac creates new alarm in Sonos app, notes new alarm_id
  (ii)  Claude greps the package for `42` references, produces
        a single-commit patch updating them to the new id
  (iii) Mac reviews + deploys via `bash deploy_packages.sh`
  (iv)  Validation via `ha_check_config`

---

## Section C — Monday 5/25 05:30 validation

This is the proof. Tomorrow (Sat 5/23) and Sunday: WEEKDAYS recurrence
skips — no expected fire. Monday 05:30 is the first weekday after the
power-cycle.

If audible at 05:30 → power-cycle held → close out.
If silent → escalate to Section B (delete+recreate alarm 42).
If silent again after recreate → Play:3 hardware end-of-life;
replace the speaker.

---

## Section D — Optional: HA-side defense-in-depth automation

Add a backup buzzer automation to `packages/sonos_package.yaml`.
**This does not fix the silent-fire problem on its own** (if Sonos
mutes the speaker, our play_media call hits the same speaker
amplifier). It only catches the "alarm fails to fire at all" case.
Including it because the staging session evaluated Option 2 and Mac
may still want it as belt-and-suspenders.

### D.1 Proposed YAML (additive, not yet in package)

Add this to the `automation:` section of `packages/sonos_package.yaml`:

```yaml
  # Bedroom alarm safety net (2026-05-22 staging)
  # Fires a backup buzzer at 05:33 weekdays if the Sonos alarm did
  # not start by then. Catches: time drift, alarm-doesn't-fire,
  # accidentally-disabled-switch scenarios. Does NOT catch: speaker
  # reports playing but amp is silent (that's a hardware issue —
  # see staging doc Section A).
  - id: bedroom_sonos_alarm_safety_net
    alias: "Sonos - Bedroom Alarm Safety Net"
    description: "Backup buzzer if Sonos alarm fails to start by 05:33 weekdays"
    mode: single
    trigger:
      - platform: time
        at: "05:33:00"
    condition:
      - condition: time
        weekday: [mon, tue, wed, thu, fri]
      - condition: state
        entity_id: switch.sonos_alarm_bedroom
        state: 'on'
      - condition: state
        entity_id: sensor.sonos_alarm_playing
        state: 'False'
    action:
      - service: system_log.write
        data:
          message: "Sonos Bedroom Safety Net: Sonos alarm did not fire by 05:33, firing backup buzzer."
          level: warning
      - service: media_player.volume_set
        target:
          entity_id: media_player.bedroom
        data:
          volume_level: 0.7
      - service: media_player.play_media
        target:
          entity_id: media_player.bedroom
        data:
          media_content_id: "x-rincon-buzzer:0"
          media_content_type: "music"
```

### D.2 Insertion point

Locate the `automation:` line in `packages/sonos_package.yaml`
(around line 2894 as of 2026-05-22). Add the safety-net block at
the end of the automation list, just before any final close-of-file
content. Use existing automations as formatting references (e.g.
`- id: sonos_evening_alarm_check_shadow_resolver` at line 2972).

### D.3 Deploy command

```bash
cd /home/mac/HA/implementation_10
bash deploy_packages.sh
# Verifies config + creates timestamped backup before SCP-ing
# and reloads HA.
```

### D.4 Rollback

```bash
git revert <commit-hash>
bash deploy_packages.sh
```

---

## Section E — Alternative defense: enable bath alarm 10

Bath alarm 10 ("Bath Weekdays alarm 05:40") is currently disabled but
configured for 05:40 WEEKDAYS at volume 0.64. Enabling it via the
Sonos integration provides a SECOND speaker fallback in case the
bedroom Sonos remains silent. The bath alarm fires 10 minutes after
the bedroom alarm at 05:30, providing a delayed but audible wake-up.

To enable from HA (single tool call, fully reversible):

```yaml
service: switch.turn_on
target:
  entity_id: switch.sonos_alarm_10
```

Or, equivalently:

```yaml
service: sonos.update_alarm
data:
  alarm_id: 10
  enabled: true
target:
  entity_id: media_player.bath
```

Trade-offs:
- Pro: Independent hardware path, almost certain audible backup.
- Pro: Already configured (no need to set up time/recurrence).
- Con: 10 min late.
- Con: Bath speaker location may be louder/closer than expected.
- Con: If the bath speaker has its own silent-fire bug, no help.

---

## Decision tree

```
1. Power-cycle the bedroom Play:3 (Section A)
   |
   +-- Speaker comes back, alarm 42 time = 05:30
   |   |
   |   +-- Section D? Optional safety net (low effort, high value)
   |   +-- Wait until Monday 5/25 05:30 (Section C)
   |       |
   |       +-- Audible at 05:30 → DONE, close out
   |       +-- Still silent → Section B (delete+recreate)
   |           |
   |           +-- Audible Tue 5/26 → DONE, close out
   |           +-- Still silent → Play:3 hardware EOL, replace
   |
   +-- Speaker comes back, alarm 42 time = 05:40
       |
       +-- Cloud-side corruption confirmed → Section B
```

---

## Section F — Side discovery: shadow_resolver automation storm

While instrumenting the alarm fire window, I discovered a separate
pre-existing issue. `automation.sonos_evening_alarm_check_shadow_resolver`
is firing at **~14 times per minute** (126 invocations in a 9-minute
sample at 06:00–06:09 MDT today). That's >70x the next noisiest
automation in the same window.

**Root cause:** The automation's trigger is:

```yaml
trigger:
  - platform: state
    entity_id: sensor.sonos_alarms_for_tomorrow
  - platform: time
    at: "22:31:00"
```

The state trigger has no `to:`, `from:`, or `attribute:` filter, so it
fires on every state-or-attribute change of the sensor. The sensor
itself (`sensor.sonos_alarms_for_tomorrow`, defined in the same file)
has an attribute `debug_processing_time_utc` derived from `now()`,
which changes on every re-evaluation. Combined, this produces a state
report every ~4–5 seconds even when no Sonos alarm data has actually
changed.

**Is this the silent-alarm cause?** Probably not — the storm is a
constant background event, not something that started Wed/Thu. T1
also confirmed the speaker hardware works during a storm window
(the test fired audibly at 17:06 MDT while the storm was active).
But the storm is real ambient noise in the HA event loop, may be
masking other diagnostic signals, and is worth fixing.

**Proposed fix (additive, requires Mac's edit consent):**

In `packages/sonos_package.yaml` around line 2977, narrow the trigger:

```yaml
trigger:
  - platform: state
    entity_id: sensor.sonos_alarms_for_tomorrow
    attribute: alarm_count   # only fire on meaningful state change
  - platform: time
    at: "22:31:00"
```

Or, less invasively, remove `debug_processing_time_utc` from the
sensor's tracked attributes (so it doesn't trigger state changes).
Both fixes are one-line modifications.

**Validation after fix:** logbook for a 9-minute window should show
< 5 `sonos_evening_alarm_check_shadow_resolver` triggers (was 126).

---

## Closing notes

The agent (Claude) made no edits to `packages/sonos_package.yaml`
during this investigation other than the reverted Option C draft.
The runtime state change at T3 (restoring alarm 42 to 05:30) used
the existing `script.sonos_reset_snoozed_alarm` and is the same
operation snooze-dismiss would perform routinely. No new code
deployed; no HA restart; no commits.

For agent-driven continuation after the power-cycle: reply with any
indication you've completed Section A and Claude will resume T6 (run
buzzer test + verify post-reboot alarm state) immediately.
