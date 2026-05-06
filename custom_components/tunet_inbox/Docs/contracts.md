# Tunet Inbox Contracts

This document is the explicit contract authority for `tunet_inbox`.

## 0. Runtime Ownership And Setup Model

- `tunet_inbox` runtime is owned by one config entry.
- YAML bootstrap is import-only:
  - YAML may declare the backend defaults
  - runtime ownership must still converge on the single config entry
  - for import-sourced entries, a new YAML import must replace overlapping stale options rather than letting older options silently override the imported defaults
  - non-overlapping options remain operator-owned and must survive import-backed restarts when YAML does not specify those keys
- services and event listeners are integration-global, but they must resolve the currently loaded config-entry-owned manager at call time
- diagnostics must redact queue-sensitive fields such as message text, context payloads, notification routing metadata, and actor identifiers
- malformed persisted queue payloads must be logged, quarantined, and surfaced through supportability mechanisms; they must not be silently discarded
- restore-time quarantine state must be mirrored into Home Assistant Repairs

## 1. Public Services

### `tunet_inbox.post`

Required:
- `key`
- `title`
- `message`
- `actions`

Optional:
- `subtitle`
- `context`
- `family`
- `room`
- `icon`
- `badge`
- `priority`
- `severity`
- `expires_at`
- `dedupe_policy`
- `privacy`
- `send_mobile`
- `mobile`
- `source`

Return payload:
- `accepted`
- `item_id`
- `key`
- `result`
- `reason`
- `mobile_send_status`

### `tunet_inbox.respond`

Required:
- exactly one of:
  - `item_id`
  - `key`
- `action_id`
- `source`

Optional:
- `client_id`

Return payload:
- `accepted`
- `item_id`
- `action_id`
- `reason`

### `tunet_inbox.resolve`

Required:
- exactly one of:
  - `item_id`
  - `key`
- `reason`

Optional:
- `result`
- `clear_mobile`

Return payload:
- `accepted`
- `item_id`
- `reason`
- `mobile_clear_status`

### `tunet_inbox.fail`

Required:
- exactly one of:
  - `item_id`
  - `key`
- `reason`

Optional:
- `details`
- `return_to_pending`

Return payload:
- `accepted`
- `item_id`
- `status`

### `tunet_inbox.dismiss`

Required:
- exactly one of:
  - `item_id`
  - `key`
- `reason`

Return payload:
- `accepted`
- `item_id`
- `status`

Behavior:
- dismiss removes the active queue item without performing a domain action
- dismiss clears the matching mobile notification when `mobile.clear_on_resolve` is enabled

### `tunet_inbox.list_items`

Optional:
- `statuses`
- `families`
- `rooms`
- `privacy_mode`
- `limit`

Return payload:
- `items`
- `meta.total`
- `meta.generated_at`
- `meta.highest_priority`

## 2. Public Events

### `tunet_inbox_action`

Fields:
- `item_id`
- `key`
- `action_id`
- `family`
- `source`
- `surface`
- `actor`
- `context`
- `mobile`
- `timestamps.received_at`

Rules:
- emitted only after validation and lock acquisition
- emitted exactly once for each accepted response

### `tunet_inbox_updated`

Fields:
- `reason`
- `item_id`
- `key`
- `status`

Rules:
- emitted whenever queue state changes in a way the dashboard should refresh

## 3. Queue Item Schema

Required fields:
- `schema_version`
- `item_id`
- `key`
- `status`
- `title`
- `message`
- `actions`
- `context`
- `mobile`
- `priority`
- `severity`
- `family`
- `created_at`
- `updated_at`
- `source`

Optional fields:
- `subtitle`
- `room`
- `icon`
- `badge`
- `privacy`
- `expires_at`
- `last_actor`
- `last_error`
- `response_started_at`
- `resolution_reason`

### `mobile`

Required when `send_mobile != false`:
- `tag`

Optional:
- `notify_service`
- `url`
- `clear_on_resolve`

Rules:
- if `mobile.notify_service` is omitted, the integration resolves the delivery target from configured backend defaults
- the configured backend default may be either:
  - a helper entity such as `input_text.notify_target_device_id`
  - a direct `notify.*` service such as `notify.tunet_inbox_all_devices`
- the governed default notification-body tap target is resolved from integration settings:
  - `mobile_tap_url` when configured in the config entry or options flow
  - otherwise the fallback route `/tunet-inbox-yaml/inbox`
- when the configured default is a helper entity such as `input_text.notify_target_device_id`, the helper state is mapped to `notify.mobile_app_<device_id>`
- when the configured default is a direct `notify.*` service, it is used unchanged
- a blank target is invalid; `tunet_inbox` does not treat blank routing as implicit broadcast
- if multi-device delivery is required, the recommended pattern is a Home Assistant notify group rather than `notify.notify`
- current live compatibility surface:
  - when `mobile.url` is present, it is accepted only when it equals the effective governed tap route for the current integration settings
  - `TI2B` closed parity between the public service schema, model validation, queue persistence, and runtime mobile delivery for the original fallback `mobile.url` field
  - `TI2C` closed the durable tap contract by moving default tap ownership into backend code and config-entry settings
  - local config-flow regression now covers preservation of non-overlapping options such as `mobile_tap_url` across import-backed YAML updates
  - live browser-reload proof exists for the configured-route canonical path, matching legacy compatibility path, and mismatched-route rejection path
- control note:
  - raw `mobile.url` is a temporary compatibility surface rather than the preferred public contract for new callers
- the current fallback governed inbox dashboard route is:
  - `/tunet-inbox-yaml/inbox`

Paste-ready multi-device example:

```yaml
notify:
  - platform: group
    name: tunet_inbox_all_devices
    services:
      - action: mobile_app_iphone
      - action: mobile_app_ipad
      - action: mobile_app_macs_work_phone
```

Then point the integration default or per-item mobile target at:

```yaml
notify.tunet_inbox_all_devices
```

### `actions[]`

Required:
- `id`
- `title`

Optional:
- `icon`
- `destructive`
- `requires_confirm`
- `style`
- `disabled_reason`

Rules:
- action objects contain identifiers and presentation metadata only
- action objects must not contain raw service definitions or arbitrary scripts
- `title`, `message`, `subtitle`, and `actions[].title` are user-facing render text and may contain spaces or punctuation
- identifier-safe validation is reserved for fields such as `key`, `item_id`, `family`, `mobile.tag`, and `actions[].id`

## 4. Identity Rules

- `key` = logical notification identity
- `item_id` = active occurrence identity

### Dedupe policies

- `replace`
  - archive prior pending item for the same `key`
  - create a new `item_id`
- `refresh`
  - keep the same `item_id`
  - update metadata in place
- `ignore`
  - leave current pending item untouched
- `append`
  - allowed only when `key` is already unique for the new occurrence

## 5. State Machine

Valid states:
- `pending`
- `responding`
- `resolved`
- `expired`
- `failed`
- `dismissed`
- `replaced`

Transitions:
- `post` -> `pending`
- `respond` -> `responding`
- `resolve` -> `resolved`
- `fail(return_to_pending=false)` -> `failed`
- `fail(return_to_pending=true)` -> `pending`
- expiry -> `expired`
- dismiss -> `dismissed`
- dedupe replacement -> `replaced`

Rules:
- only one accepted `pending -> responding` transition per `item_id`
- terminal states are never re-opened
- stale second responses must be rejected

## 6. Governance Controls

- schema validation is mandatory on every service ingress
- action allowlisting is mandatory against the current item payload
- mobile raw actions must parse to `TINBOX|<item_id>|<action_id>`
- actor/source attribution is mandatory on accepted response paths
- queue mutations must record audit metadata
- malformed items must be quarantined and logged, not silently discarded

## 7. Failure Reasons

Canonical failure reasons:
- `queue_full`
- `invalid_payload`
- `item_not_found`
- `not_pending`
- `expired`
- `invalid_action`
- `lock_conflict`
- `stale_action`
- `invalid_mobile_mapping`
- `mobile_send_failed`
- `mobile_clear_failed`
- `domain_state_invalid`
- `handler_timeout`
