# Tranche M.1 — Sonos+Spotify Transport Routing (MA shadow entity)

**Created**: 2026-05-26 3:36pm MDT
**Parent**: `docs/plans/next-tranche-rollup-2026-05-26.md` (Tranche M — Media Reliability)
**Source defect**: Plan F §8 + memory observation #12575 (Sonos+Spotify Transport Fix Root Cause Confirmed: Route to MA Entity) — confirmed 2026-05-23 2:14am
**Authority**: this is a focused implementation plan; passes through adversarial review before stamp.

---

## Phase 1: Context

### Memory + prior work
- #12575 (2026-05-23 2:14am): Root cause confirmed — native Sonos integration rejects `media_next_track` / `media_previous_track` when Spotify owns the queue. MA shadow entity has queue ownership and accepts the skip.
- #12460 (2026-05-23 12:28am): Volume debounce defect (M.2) — adjacent, not in this tranche
- #13334 (2026-05-24 2:06am): T8.1 popup content card revisions committed — baseline state for this work
- #13270 (2026-05-24 12:24a): Sonos card .player-header has 4 children — informs CSS impact, but no transport-layer impact

### Files read
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js` (1414 lines) — `_callTransport` at line 794-797, single-line implementation
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js` (1747 lines) — `_callTransport` at line 913-916, single-line implementation
- `Dashboard/Tunet/Cards/v3/tunet_base.js` — confirmed no existing Spotify detection or transport routing helpers

### Live state validation (deferred to Phase 2 — DOM/state probe)
- **Unknown**: actual MA shadow entity naming on Mac's HA. Common pattern is `<coordinator>_2` suffix but not guaranteed. Must verify before hardcoding.
- **Unknown**: whether `app_name` or `source` attribute reliably indicates Spotify on the native Sonos entity. Empirical probe required.

### Gaps
- No existing helper in tunet_base.js for entity-shadow resolution; must add one OR inline
- MA entity discovery convention not yet verified — Plan F §8 referenced `_2` suffix but that was an assumption pending Mac's instance verification

---

## Phase 2: Pre-implementation probe (COMPLETED 2026-05-26 3:53pm MDT)

### Probe results — confirmed via `mcp__home-assistant__ha_get_states` + `ha_get_entity` while Spotify playing on living_room

**Spotify detection on coordinator (`media_player.living_room`)**:
- `source: "Spotify Connect"` ✓ (primary signal — set when Spotify Connect is active)
- `app_name`: **NOT PRESENT** on native Sonos integration
- `app_id`: **NOT PRESENT** on native Sonos integration
- `media_content_id`: contains `spotify:` prefix (secondary signal)
- **Conclusion**: simplify helper to check `source` attribute only on coordinator. `app_name`/`app_id` checks for coordinator can be removed.

**MA shadow inventory** (all `platform: music_assistant` in entity registry):
| Native coordinator | MA shadow entity_id | Friendly name | `_2` suffix? |
|---|---|---|---|
| `media_player.living_room` ("Living Room TV Sonos Soundbar") | `media_player.living_room_2` ("Living Room") | yes | ✓ |
| `media_player.kitchen` ("Kitchen Sonos") | `media_player.kitchen_3` ("Kitchen") | **NO** (uses `_3`) | ✗ |
| `media_player.bath` ("Bathroom Sonos") | `media_player.bath_2` ("Bath") | ✓ |
| `media_player.dining_room` ("Dining Room Credenza Speaker") | `media_player.dining_room_2` ("Dining Room") | ✓ |
| `media_player.bedroom` ("Bedroom Sonos") | `media_player.office` ("Bedroom") | **NO** (the documented naming bug) | ✗ |

**Critical implications**:
1. The `_2` suffix-first lookup matches 3 of 5 rooms; the fallback via registry is **essential** for the other 2 (Kitchen and Bedroom). Without the fallback, skip would still fail on those 2 rooms.
2. The bedroom naming bug (`media_player.office` is actually the MA-shadow-for-bedroom) is well-handled by friendly_name pairing: native "Bedroom Sonos" starts-with "Bedroom" → matches MA shadow. (Friendly-name bidirectional `startsWith` handles all 5 rooms despite the divergent naming.)
3. `hass.entities` has `platform` field — confirmed via `ha_get_entity` returning `"platform":"music_assistant"` for all 5 MA shadows. This is the bulletproof MA detection.
4. **Unique_id is shared** between native+MA pairs (e.g., both `media_player.living_room` and `media_player.living_room_2` have `unique_id: RINCON_949F3E65DEB801400`). This would be a perfect pairing key, BUT `hass.entities` in custom-card context typically does NOT include `unique_id` (only `platform`, `device_id`, `area_id`, etc.). Friendly-name pairing is the practical fallback.

**MA shadow `app_id` in paused state**: all MA shadows have `app_id: "Spotify"` even while paused (queue retained). This indicates the v2 plan's "app_id is empty when idle" concern (H2) was correct only for truly-fresh state — once a session has played, app_id sticks. Registry-based detection still wins for reliability.

**Probe artifact saved**: this section captures the full evidence; raw responses are in the MCP tool result history.

### Closed risks after probe
- **H1 (architectural)**: helper is coordinator-rooted ✓
- **H2 (silent-fail on idle)**: registry `platform` field confirmed available + reliable ✓
- **MA shadow naming-bug** (`media_player.office` is bedroom shadow): handled by friendly-name `startsWith` pairing ✓

---

## Phase 2.5: Original probe spec (now redundant — kept for plan-history continuity)

Run a one-shot Playwright script that:
1. Captures the state + attributes of `media_player.living_room` in three scenarios:
   - (a) Spotify playing
   - (b) Idle / nothing playing
   - (c) Non-Spotify source playing (TV / Sonos Radio if available)
2. For each scenario, captures attributes: `source`, `app_name`, `app_id`, `media_content_id`, `media_title`
3. **Captures MA shadow attributes in BOTH idle and playing states** (H2 fix — verifies whether `app_id` is empty when idle, confirming the registry-based detection is the right path)
4. Verifies `hass.entities` is exposed in the WebSocket connection's `lovelace.entities` data (the custom-card context). If not, plan falls back to state-based MA detection only (acceptable but lower reliability when idle).
5. Lists ALL `media_player.*` entities with their `platform` (from registry) + state + key attributes; identifies MA shadow candidates by `platform === 'music_assistant'`.

Reports `/tmp/m1-ma-shadow-probe.json` with:
- (a) Which attribute reliably indicates Spotify on the coordinator (typically `app_name === 'Spotify'`)
- (b) The actual MA shadow entity_id for `media_player.living_room` (may be `_2` suffix or different naming)
- (c) Whether `hass.entities` is available + whether `platform` field reads `music_assistant` for MA shadow entities
- (d) Empty/populated state of `app_id` on MA shadow during idle (confirming H2's concern)

This resolves the two HIGH adversarial findings:
- **H1** is closed by the v2 design choice (coordinator-rooted, not transport-target-rooted)
- **H2** is closed empirically by the idle-state probe of MA shadow attributes

**Mac participation required**: Mac plays Spotify on living room briefly during the probe so the Spotify-source scenario is captured live.

---

## Phase 3: Analysis

### Component: `_callTransport` in tunet-media-card AND tunet-sonos-card

**Upstream**:
- `this._transportTarget` (computed property at media-card:762 and sonos-card:904) → returns `_activeEntity || _coordinator`
- `this._hass.states[<entity>]` → the live state object including `attributes.source` / `attributes.app_name`

**Downstream**:
- `_hass.callService('media_player', service, { entity_id })` → HA service call
- Currently fails silently when Spotify is the source (logbook records rejection, UI doesn't surface)

**Invariants at risk**:
- Selected-target volume model (#11507): volume routes to `_activeEntity` independently of transport. This tranche does NOT touch volume routing.
- Speaker-tile contract: unaffected
- Group coordinator semantics: when speakers are grouped, all transport routes to coordinator. MA shadow lookup must respect this — if `_transportTarget` is coordinator, route to coordinator's MA shadow.

**Change classification**: Type A (Isolated) — touches `_callTransport` in 2 files via a shared helper in tunet_base.js. No downstream consumers beyond the direct callers (lines 794-797 in media, 913-916 in sonos).

---

## Phase 4: Design — line-level changes

### Change Set 1 (v2 — H1+H2+L1 corrections): Add shared helper to tunet_base.js

**File**: `Dashboard/Tunet/Cards/v3/tunet_base.js`
**Insert location**: near `compactSpeakerName` at line 1631

**Key corrections from v1**:
- **H1**: Helper is now COORDINATOR-rooted, NOT transport-target-rooted. Spotify queue ownership lives on the coordinator regardless of which speaker the user selected in the dropdown. Helper takes coordinator entity_id, returns MA shadow OR null.
- **H2**: MA shadow detection prefers `hass.entities[id]?.platform === 'music_assistant'` (entity registry) over `app_id` because `app_id` is empty when MA is idle. Falls through to `app_id` only if `hass.entities` is unavailable (defensive).
- **L1**: Guards reject both `'unavailable'` AND `'unknown'` states.

**Proposed function** (v3 — probe-simplified, ~30 lines):
```js
/**
 * If a Sonos coordinator currently has Spotify as the active source, locate the
 * Music Assistant shadow entity that owns the queue and can accept skip/prev
 * service calls. Returns the MA shadow entity_id, OR null when:
 *   - Coordinator entity is missing or active source is not Spotify
 *   - No MA shadow entity is found
 *   - MA shadow exists but is unavailable/unknown
 *
 * Caller responsibility: fall back to the original entity_id (coordinator or
 * transport target) when this returns null.
 *
 * Architectural note: queue ownership lives on the COORDINATOR, not on
 * selected-speaker dropdown choices. Pass `this._coordinator`, not
 * `this._transportTarget`.
 *
 * Probe-verified 2026-05-26 (see plan Phase 2):
 * - Native Sonos coordinator carries `source: "Spotify Connect"` when Spotify
 *   is active. `app_name`/`app_id` are NOT set on native Sonos — only `source`
 *   is the reliable signal for coordinator-side detection.
 * - MA shadow entities all have `hass.entities[id].platform === 'music_assistant'`.
 * - Naming on Mac's instance: 3 of 5 rooms use `_2` suffix; Kitchen uses `_3`
 *   suffix; Bedroom MA shadow is `media_player.office` (legacy naming bug).
 *   Fallback via registry + friendly_name is essential.
 * - native+MA pair share `unique_id` (RINCON_*) but `hass.entities` in custom-card
 *   context doesn't expose unique_id — friendly_name `startsWith` pairing used.
 *
 * @param {string} coordinatorId - The Sonos coordinator entity_id
 * @param {object} hass - The Home Assistant context (`.states` required, `.entities` preferred)
 * @returns {string|null}
 */
export function resolveSpotifyMAShadow(coordinatorId, hass) {
  if (!coordinatorId || !hass?.states) return null;
  const coord = hass.states[coordinatorId];
  if (!coord) return null;

  // Detect Spotify on the coordinator. Probe confirms only `source` is reliable
  // on native Sonos (app_name/app_id are not populated by the native integration).
  const source = String(coord.attributes?.source || '').toLowerCase();
  if (!source.includes('spotify')) return null;

  const isUsable = (id) => {
    const s = hass.states[id];
    return s && s.state !== 'unavailable' && s.state !== 'unknown';
  };

  // Try the standard MA shadow naming convention first (`_2` suffix).
  // Probe-confirmed match for Living/Bath/Dining; misses Kitchen + Bedroom.
  const standardCandidate = `${coordinatorId}_2`;
  if (isUsable(standardCandidate)) return standardCandidate;

  // Fallback: entity registry scan. Required to handle Kitchen (`_3` suffix)
  // and Bedroom (`media_player.office` naming bug). Friendly_name bidirectional
  // `startsWith` correctly pairs "Living Room TV Sonos Soundbar" ↔ "Living Room",
  // "Bedroom Sonos" ↔ "Bedroom", "Kitchen Sonos" ↔ "Kitchen", etc.
  const baseName = String(coord.attributes?.friendly_name || '').toLowerCase();
  if (hass.entities && baseName) {
    for (const id of Object.keys(hass.entities)) {
      if (!id.startsWith('media_player.')) continue;
      if (id === coordinatorId) continue;
      const reg = hass.entities[id];
      if (reg?.platform !== 'music_assistant') continue;
      if (!isUsable(id)) continue;
      const candName = String(hass.states[id]?.attributes?.friendly_name || '').toLowerCase();
      if (candName && (candName.startsWith(baseName) || baseName.startsWith(candName))) {
        return id;
      }
    }
  }

  return null;
}
```

### Change Set 2: Wire into tunet_media_card.js

**File**: `Dashboard/Tunet/Cards/v3/tunet_media_card.js`

**Import addition** (existing import block at lines 10-19):
```js
import {
  // existing imports...
  resolveSpotifyMAShadow,
} from './tunet_base.js?v=20260309g7';
```

**Edit line 794-797**:
```js
// Before:
_callTransport(service) {
  if (!this._hass) return;
  this._hass.callService('media_player', service, { entity_id: this._transportTarget });
}

// After:
_callTransport(service) {
  if (!this._hass) return;
  // M.1 — route transport to coordinator's MA shadow when Spotify owns
  // the queue. Native Sonos rejects skip/prev under Spotify ownership;
  // MA shadow accepts. Coordinator-rooted (not _transportTarget) because
  // queue ownership lives on the coordinator regardless of dropdown
  // selection. See docs/plans/M1-sonos-spotify-transport-routing-2026-05-26.md
  const maShadow = resolveSpotifyMAShadow(this._coordinator, this._hass);
  const target = maShadow || this._transportTarget;
  this._hass.callService('media_player', service, { entity_id: target });
}
```

**CARD_VERSION bump**: line 21 `'3.2.2'` → `'3.2.3'`. (Verified via grep 2026-05-26 3:38pm.)

### Change Set 3: Wire into tunet_sonos_card.js

**File**: `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`

**Import addition** (existing import block):
```js
import {
  // existing imports...
  resolveSpotifyMAShadow,
} from './tunet_base.js?v=20260309g7';
```

**Edit line 913-916**:
```js
// Before:
_callTransport(service) {
  if (!this._hass) return;
  this._hass.callService('media_player', service, { entity_id: this._transportTarget });
}

// After:
_callTransport(service) {
  if (!this._hass) return;
  // M.1 — route transport to coordinator's MA shadow when Spotify owns
  // the queue. Same logic as tunet_media_card._callTransport.
  const maShadow = resolveSpotifyMAShadow(this._coordinator, this._hass);
  const target = maShadow || this._transportTarget;
  this._hass.callService('media_player', service, { entity_id: target });
}
```

**CARD_VERSION bump**: line 34 `'1.1.1'` → `'1.1.2'`. (Verified via grep 2026-05-26 3:38pm.)

### Decision: route ALL transport or skip-only?

**Routes ALL transport (play, pause, play_pause, next, prev, seek) when Spotify is active**, not just next/prev.

Reasoning (revised after v1 adversarial review M1):
- **Call-site consistency, NOT state divergence avoidance.** Hardware-level state on the speaker syncs between native Sonos and MA shadow automatically (both reflect the same physical playback); the speakers don't actually diverge. The real argument for routing-ALL is consistency at the call site — branching by service name (next/prev → MA, play/pause → native) creates two routing paths to maintain and reason about. One path is simpler.
- The defect surfaces visibly on next/prev (the confirmed rejection vector per memory #12575). Routing play/pause to MA introduces no known regression since MA accepts those calls fully.
- **External controller risk acknowledged**: if Mac uses an external Spotify Connect controller (phone Spotify app) AND the dashboard simultaneously, dashboard play/pause goes to MA while the external app talks to the native Sonos. Hardware syncs both, but the source-of-truth flickers between integrations briefly. Acceptable — the live test in Phase 5 includes this scenario.
- Volume routing stays on `_activeEntity` (unchanged) — per-speaker, works on either entity.

### Expected outcome

When Spotify is the active source on a Sonos coordinator:
- Tap next-track → call routes to `media_player.living_room_2` (or whatever MA shadow exists) → Spotify queue advances → next track plays
- Tap prev-track → same routing → previous track plays
- Tap play-pause → also routes to MA → state syncs with playback

When Spotify is NOT the active source (TV input, Sonos Radio, line-in, AirPlay):
- All transport calls flow through `_transportTarget` unchanged — no routing change, no regression

---

## Phase 5: Validation

### Live test sequence (Mac participation required)

1. **Pre-fix baseline**: with Spotify playing on living room Sonos, tap next-track on the media card. Note the current behavior (likely: no change OR brief flicker; logbook entry shows service rejected).
2. **Post-deploy**: with Spotify still playing, tap next-track. Expected: track advances within 1-2 seconds.
3. **Negative test**: switch source to Sonos Radio. Tap next-track. Expected: still works (route unchanged, native entity handles it).
4. **Group test**: group living-room + kitchen via Sonos app. Resume Spotify on group. Tap next-track on dashboard. Expected: advances; both speakers stay in sync.

### Logbook verification

After deploy, check Home Assistant logbook for `media_player.living_room` vs `media_player.living_room_2` service calls during step 2. Confirm the call went to the MA shadow, not the native Sonos.

### Validation criteria

- [ ] Pre-implementation probe confirms MA shadow entity exists in idle AND playing states; captures the attribute that reliably indicates Spotify (source vs app_name vs app_id) and the discriminator that identifies MA shadow when idle (entity registry `platform === 'music_assistant'` confirmed)
- [ ] With Spotify source on coordinator, transport routes to coordinator's MA shadow (verified via HA logbook)
- [ ] With non-Spotify source, transport routes to native Sonos (no regression)
- [ ] Group transport: coordinator + members grouped, Spotify playing, skip works
- [ ] Seek scrubber works on Spotify+Sonos session (per M2 — routing-ALL includes seek)
- [ ] Volume slider unchanged (no impact on volume routing path)
- [ ] External Spotify Connect controller scenario: dashboard play/pause + phone Spotify simultaneous use does not lose state irrecoverably (acceptable flicker)
- [ ] CARD_VERSION bumped for both cards + Lovelace `?v=` cache-bust
- [ ] Mac confirms via live test that next/prev/seek/play_pause all work on Spotify+Sonos session

### Unit test (M3 from adversarial review)

Add `tests/resolve_spotify_ma_shadow.test.js` (or extend existing `tunet_base.test.js` if present) covering 5 paths of `resolveSpotifyMAShadow`:

1. **Non-Spotify source** → returns null (source: "TV", no routing)
2. **Spotify + `_2` candidate present and usable** → returns `<coordinator>_2`
3. **Spotify + `_2` candidate unavailable** → falls through, finds via registry → returns MA-platform entity id
4. **Spotify + registry has MA-platform entity with matching friendly_name** → returns that id (covers idle MA shadow case where app_id is empty)
5. **Spotify + no MA shadow anywhere** → returns null (caller falls back to coordinator native)

Mock `hass.states` and `hass.entities` accordingly. Pure function, no DOM, no async. Estimated ~50-80 lines of test code; prevents silent regression of the routing logic.

---

## Phase 6: Rollback

If anything regresses:
- Revert tunet_base.js helper function addition (~20 lines)
- Revert `_callTransport` edits in both cards (single-line restore each)
- Revert CARD_VERSION bumps
- Rebuild + redeploy

Total revert: ~5 lines of code change reverted, ~5 minutes.

---

## Known risks

- **R1 — MA shadow naming convention**: if Mac's MA entity uses a non-`_2` suffix and the fallback friendly_name+app_id scan doesn't match either, the helper returns the original entity_id and the original defect persists. The pre-implementation probe (Phase 2) closes this risk by verifying the actual entity name before coding.
- **R2 — Performance**: the fallback scan iterates `hass.states` keys (~100-500 entries typically). Only runs when standard `_2` candidate fails. Constant-time per call in the common case; linear-time per call in the fallback. Both acceptable for tap-frequency operations.
- **R3 — Spotify-on-Apple-Music edge case**: if Apple Music sets `app_name: "Spotify Connect"` for some routing reason, we'd false-positive. Empirically very unlikely; the probe in Phase 2 should surface if this is a real concern.
- **R4 — State divergence on rapid taps**: if user taps next while routing decision is mid-fetch (race), one call could go to native and the next to MA. Both calls land on Sonos eventually; final state matches last command. Acceptable race.

---

## Awaiting

Mac's stamp on:
- (a) coordinator-rooted helper design (revised after v1 adversarial review H1)
- (b) routing scope ALL transport (revised justification: call-site consistency, not state divergence avoidance — per M1 review finding)
- (c) `Proceed to probe` to run the live state probe before implementation. Probe needs Mac to briefly play Spotify on living room during the run.

Once probe lands, plan re-verifies the registry-vs-state detection path is correct, then seeks `Proceed to implementation`.

---

## Appendix A — Adversarial Review v1 Findings + Disposition

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| H1 | High | Helper resolved `_transportTarget`, but skip needs the COORDINATOR's MA shadow (queue ownership lives on coordinator) | **FIXED v2** — helper takes `coordinatorId`, not transport target; renamed `resolveTransportEntity` → `resolveSpotifyMAShadow`; caller falls back to `_transportTarget` when helper returns null |
| H2 | High | `app_id` discriminator is empty when MA shadow is idle → fallback scan misses → silent failure | **FIXED v2** — primary fallback now uses `hass.entities[id]?.platform === 'music_assistant'` (entity registry, populated when idle); state-based `app_id` scan retained as defensive secondary fallback. Probe verifies `hass.entities` availability in custom-card context |
| M1 | Med | "State divergence" justification was incorrect (hardware syncs both entities) | **FIXED v2** — reasoning restated as "call-site consistency"; external-controller flicker risk acknowledged in test plan |
| M2 | Med | Media-card CARD_VERSION value ambiguous | **FIXED v2** — pre-populated: `'3.2.2'` → `'3.2.3'` line 21 (grep-verified 2026-05-26 3:38pm) |
| M3 | Med | No unit test for pure function | **FIXED v2** — added test plan covering 5 paths; estimated 50-80 LOC; added to validation criteria |
| L1 | Low | Guards rejected `'unavailable'` but not `'unknown'` | **FIXED v2** — `isUsable()` helper rejects both states |
| L2 | Low | Live test didn't cover seek | **FIXED v2** — seek scrubber added to validation criteria |
| L3 | Low | `?v=` import query string concern | **DISMISSED** — reviewer confirmed current value is correct |
| L4 | Low | Apple Music false-positive concern | **DISMISSED** — empirically implausible; probe surfaces if real |

---

## Plan version history

- v1 (3:36pm 2026-05-26): initial plan with `_transportTarget`-rooted helper, `app_id`-based fallback, state-divergence rationale
- v2 (3:45pm 2026-05-26): v1 adversarial review resolved — coordinator-rooted helper, registry-based detection, call-site-consistency rationale, pre-populated CARD_VERSION values, unit test plan added, seek validation added, idle-state probe added
- **v3 (3:55pm 2026-05-26)**: probe complete — helper simplified to source-only coordinator detection (`app_name`/`app_id` not present on native Sonos), defensive secondary fallback removed (registry path is bulletproof), confirmed naming-bug handling (Kitchen `_3`, Bedroom `media_player.office`) via friendly-name `startsWith` pairing, MA shadow inventory + native↔MA pairing recorded
