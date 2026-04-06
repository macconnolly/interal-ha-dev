# Research Prompt: Dynamic Notification Response Surface for Home Assistant

Feed this prompt to Claude (claude.ai) for independent research. Copy everything below the line.

---

## Purpose

I run a sophisticated Home Assistant instance with two major YAML packages that send actionable push notifications to my phone:

1. **OAL (Optimized Adaptive Lighting)** — a ~5000-line lighting automation package that manages 7 zones of adaptive lighting across my home. It sends notifications for: TV Mode prompts ("Apple TV is playing, switch to TV lighting?"), TV Bridge expiring warnings, manual override reminders at sunset, zone override expiring alerts, and unified timer expiring alerts.

2. **Sonos alarm package** — manages 29 Sonos alarm entities across 5 speakers. Sends notifications for: alarm playing (with snooze 5/10/15 + dismiss), evening alarm check (disable tomorrow's alarms?), and Apple TV auto-off.

Every notification uses the same pattern: `notify.mobile_app_*` sends an iOS push with action buttons (e.g., "Snooze 5min", "Enter TV Mode", "Reset to Adaptive", "Extend 1 Hour"). An automation listens for `mobile_app_notification_action` events and handles the response.

## The Problem

**If I accidentally dismiss a notification on my phone, the context and action buttons are gone forever.** There is no way to recover. Examples:

- I get "OAL Mode Expiring — returning to Adaptive in 5 minutes. [Extend Mode] [Return Adaptive] [Let Expire]" — I swipe to dismiss by accident. Now I can't extend the mode without manually navigating to the right HA entity and changing it.
- I get "Alarm ringing — [Snooze 5] [Snooze 10] [Dismiss]" while my hands are wet. I can't get to my phone. The notification times out.
- I get "Lights Still Manual — 3 zones overridden. [Reset to Adaptive] [Keep Manual]" — I'm on a different screen and miss it.

The notifications are ephemeral. They exist only on my phone. HA has no memory of what it sent or what actions were available.

## What I Want

A **dashboard surface** (a custom Lovelace card or page) that acts as a persistent notification inbox. It should:

1. **Show all currently-active/pending notification contexts** — not a history log, but a live view of "things that need your attention right now"
2. **Render the action buttons dynamically** — the same buttons that were on the phone notification should appear as tappable controls on the dashboard
3. **Clear automatically** when the underlying condition resolves (e.g., the timer expires, the alarm stops, the mode changes)
4. **Work alongside mobile notifications**, not replace them — both surfaces should show the same actions, and responding on either surface should clear both
5. **Not require hardcoding every notification type** — if I add a new notification flow to my automations, the dashboard should handle it with minimal wiring

## My Current Notification Inventory

Here are the 12 notification flows currently in the system. Each one has a `tag` for grouping and defined `actions`:

| # | Notification | Tag | Actions | Package |
|---|-------------|-----|---------|---------|
| 1 | Alarm playing | `sonos_alarm_playing` | Snooze 5/10/15, Dismiss | sonos |
| 2 | Evening alarm check | (dynamic) | Disable tomorrow / Keep | sonos |
| 3 | Apple TV auto-off | (dynamic) | Confirm / Dismiss | sonos |
| 4 | TV Mode activated | `oal_tv_mode_activated` | Cancel | OAL |
| 5 | TV Mode prompt | `oal_tv_mode_prompt` | Enter TV Mode / Not Now | OAL |
| 6 | TV Bridge expiring | `oal_bridge_expiring` | Extend / Return Adaptive / Keep | OAL |
| 7 | TV Presence loss | `oal_tv_presence_prompt` | Keep TV Mode / Return Adaptive | OAL |
| 8 | Override reminder | `oal_override_reminder` | Reset to Adaptive / Keep Manual | OAL |
| 9 | Override expiring | `oal_override_expiring` | Extend 1 Hour / Let Expire | OAL |
| 10 | Unified timer expiring | `oal_timer_expiring` | Extend Mode/Zone/Both / Return / Let Expire | OAL |
| 11 | Alarm notification clear | `sonos_alarm_playing` | (clears #1) | sonos |
| 12 | OAL learning log | (file) | (not user-facing) | OAL |

## Important: Current Notification Architecture

**I am NOT currently using `persistent_notification` at all.** Every notification in the system today is a mobile-only push via `notify.mobile_app_*`. There are zero persistent notifications active on the instance. The HA sidebar notification bell is empty.

This means:
- `persistent_notification` is not "already in use" — adopting it would be net-new infrastructure
- All 12 notification flows would need to be modified to also write to whatever queue backend we choose
- The existing handler automations that listen for `mobile_app_notification_action` events are the only response mechanism today
- There is no dashboard-side notification state whatsoever — the dashboard has zero awareness of what notifications have been sent or what actions are pending

This is the core problem: **notifications are fire-and-forget to the phone, and the phone is the only place they exist.**

## Technical Constraints

- **Home Assistant 2026.3** on a dedicated server
- **Custom Lovelace card suite (Tunet)** — 13 cards, all vanilla `HTMLElement` + Shadow DOM (no LitElement, no React). Cards connect to HA via the `hass` object which provides WebSocket access.
- **Browser Mod** is installed and used for popups
- **HACS** is available
- **No Node-RED** — all automations are native HA YAML
- The notification action handler automations already exist and listen for `mobile_app_notification_action` events. They work correctly when triggered from the phone.

## What I Need You to Research

### 1. Backend: Where should the notification queue live?

Evaluate these options for storing "pending actionable notifications" in HA:

**Option A: `persistent_notification` entities**
- Create a persistent_notification when sending each mobile push
- Embed structured data (actions, context) in the message body
- Custom card reads via `persistent_notification/get` WebSocket call
- Dismiss via `persistent_notification.dismiss`
- Pros: built-in, survives restarts, has WebSocket subscription for real-time updates
- Cons: persistent_notification entities may no longer work as queryable entities in recent HA versions (research this — the API may have changed in 2024/2025)

**Option B: `todo` list items**
- Create a dedicated todo list (e.g., `todo.notification_inbox`)
- `todo.add_item` with structured JSON in the description field
- Custom card reads via `todo` WebSocket API
- Complete/remove item to dismiss
- Pros: built-in, persistent, has a native card (though we'd use custom rendering)
- Cons: description field size limits? Can a custom card read todo items via WebSocket?

**Option C: Template sensor with trigger platform**
- A trigger-based template sensor that accumulates notifications in its attributes
- Automations fire a custom event; the sensor template captures it and appends to a list
- Pros: no extra integrations needed
- Cons: loses state on restart unless using `restore` (and restored template sensors may not keep complex attributes)

**Option D: `input_text` helpers with JSON**
- Multiple `input_text` entities as notification slots
- Each holds a JSON payload: `{"tag": "...", "title": "...", "message": "...", "actions": [...]}`
- Pros: simple, persistent, queryable
- Cons: 255-char limit per entity, need multiple slots, manual queue management

**Option E: File-based**
- Write notification queue to a JSON file via `notify.file` or shell_command
- Custom card reads via fetch
- Pros: unlimited size, full JSON support
- Cons: not reactive (no WebSocket subscription), needs polling or manual refresh

**Option F: Something I haven't thought of**
- Is there a HACS integration that provides a proper notification/event queue?
- Has HA added any new primitives in 2025-2026 for this?
- Could `logbook.log` entries be queried from a custom card?

### 2. Frontend: How should a custom Lovelace card consume the queue?

For each backend option above, explain:
- How does the card initially load the current notifications?
- How does the card receive real-time updates (new notification, dismissed notification)?
- How does the card fire actions back? (Should it fire `mobile_app_notification_action` events to reuse existing handlers, or call services directly?)

### 3. Synchronization: Mobile dismiss ↔ Dashboard dismiss

When the user responds to a notification on their phone:
- The `mobile_app_notification_action` event fires in HA
- The existing handler automation runs
- **How does the dashboard card know the notification was handled?**

When the user responds on the dashboard:
- The card calls a service or fires an event
- **How does the phone notification get cleared?** (HA can clear mobile notifications by sending a push with `clear_notification` and the same `tag`)

### 4. Auto-clear on condition resolution

Some notifications should auto-clear when the underlying condition resolves:
- Alarm stops playing → clear alarm notification
- Timer expires → clear timer notification
- Mode changes → clear mode prompt

**How should the queue handle this?** Should the notification senders also be responsible for clearing queue entries? Or should the card poll entity states?

### 5. Prior Art

Search for:
- Any existing HACS cards or integrations that solve this exact problem
- Community implementations of "notification inbox" patterns
- The `persistent_notification` WebSocket API — has it changed in HA 2024-2026?
- The `todo` WebSocket API — can custom cards query todo items?
- Any HA core feature requests or blueprints for dashboard-based notification response

## Deliverable

Provide a **recommended architecture** with:
1. Which backend option (A-F or hybrid) and why
2. The notification lifecycle: create → display → respond → clear
3. What changes are needed in the existing notification automations (the "write" side)
4. What the custom card needs to implement (the "read" side)
5. How mobile ↔ dashboard sync works
6. A rough YAML example showing one notification flow end-to-end (e.g., the OAL override reminder) from automation → queue → card → response → clear

Focus on **practicality over elegance**. I'd rather have something working with 80% coverage than a perfect architecture that takes months. The system has ~12 notification types and I'm the only user.
