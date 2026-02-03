# Claude Enforcement Guide

## The Problem

Claude reads the CLAUDE.md files but doesn't reliably follow them. The files are guidance, not enforcement. **You** are the enforcement mechanism.

---

## Enforcement Phrases

Copy-paste these when needed:

### When Claude skips Context Loaded block

```
Stop. Context Loaded block first.
```

### When Claude proposes solutions too early

```
What phase are we in?
```

### When Claude claims to have read something

```
What file and line numbers?
```

### When Claude says "simple change"

```
Show me the impact analysis.
```

### When you're ready to proceed

```
proceed
```

### When you approve a design

```
approved
```

---

## Red Flags (Claude is skipping protocol)

| You see | What's happening |
|---------|------------------|
| First response has recommendations | Skipped Context Loaded |
| "I'll just..." or "Let me quickly..." | Underestimating scope |
| No file reads before code changes | Working from memory, not reality |
| "This should be straightforward" | One-Line Fix anti-pattern |
| Editing code in first response | Skipped all phases |
| "Based on my understanding..." | No artifacts consulted |

---

## Healthy Session Flow

```
You: [task request]

Claude:
## Context Loaded
**Goal:** ...
**User said:** ...
**I read:** ...
**I don't know:** ...
Waiting for "proceed"

You: proceed

Claude:
## Impact
**Changing:** ...
**Upstream:** ...
**Downstream:** ...

You: proceed

Claude:
## Plan
**Changes:** ...
**Validation:** ...

You: approved

Claude: [implements and validates]
```

---

## Quick Tasks Exception

For genuinely quick lookups, you can bypass:

```
You: quick - what's the entity ID for sleep mode?
Claude: input_select.oal_active_configuration set to "Sleep"
```

The word "quick" signals no Context Loaded needed.

---

## When to Push Back

**Push back if Claude:**
- Lists zero unknowns (always suspicious)
- Claims "I read" but can't cite line numbers
- Skips impact analysis for "simple" changes
- Proposes code before you said "approved"

**Don't push back if:**
- You said "quick"
- It's a pure information request
- Claude genuinely has no unknowns after thorough search

---

## Deployment Checkpoint

For any OAL package changes:

```
You: Did you deploy?
```

If Claude edited YAML but didn't call `ha-package-deployer`, the change isn't live.

---

## Recovery Phrases

If a session goes off track:

```
Let's reset. Start with Context Loaded for: [restate goal]
```

```
What phase should we be in right now?
```

```
Show me your unknowns before continuing.
```
