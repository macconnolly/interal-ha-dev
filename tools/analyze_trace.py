#!/usr/bin/env python3
"""
OAL Engine Trace Analyzer
Parses Home Assistant automation traces and produces detailed timing analysis.

Usage:
    python3 analyze_trace.py <trace_file.json> [output_file.txt]
    python3 analyze_trace.py logs/*.json  # Analyzes most recent trace
"""

import json
import sys
import glob
import os
from datetime import datetime
from pathlib import Path


def parse_timestamp(ts_str):
    """Parse ISO timestamp string to datetime object."""
    if not ts_str:
        return None
    # Handle various ISO formats
    ts_str = ts_str.replace('+00:00', 'Z').replace('Z', '+00:00')
    try:
        return datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
    except:
        return None


def format_duration(seconds):
    """Format duration in human-readable format."""
    if seconds < 0.001:
        return f"{seconds*1000000:.0f}µs"
    elif seconds < 1:
        return f"{seconds*1000:.1f}ms"
    elif seconds < 60:
        return f"{seconds:.2f}s"
    else:
        return f"{seconds/60:.1f}min"


def extract_action_info(action_data):
    """Extract meaningful info from action data."""
    if not action_data:
        return "unknown"

    result = action_data.get('result', {})
    params = result.get('params', {})

    if params:
        domain = params.get('domain', '')
        service = params.get('service', '')
        target = params.get('target', {})
        entity_id = target.get('entity_id', [])
        if isinstance(entity_id, list) and entity_id:
            entity_id = entity_id[0]
        return f"{domain}.{service} → {entity_id}"

    return "action"


def analyze_trace(trace_data):
    """Analyze a trace and return structured timing data."""
    trace_info = trace_data.get('trace', {})

    # Basic info
    start_ts = parse_timestamp(trace_info.get('timestamp', {}).get('start'))
    finish_ts = parse_timestamp(trace_info.get('timestamp', {}).get('finish'))
    trigger = trace_info.get('trigger', 'unknown')
    run_id = trace_info.get('run_id', 'unknown')

    # Parse all trace steps
    trace_steps = trace_info.get('trace', {})

    events = []
    for path, step_list in trace_steps.items():
        for step in step_list:
            ts = parse_timestamp(step.get('timestamp'))
            if ts:
                events.append({
                    'path': path,
                    'timestamp': ts,
                    'data': step
                })

    # Sort by timestamp
    events.sort(key=lambda x: x['timestamp'])

    return {
        'run_id': run_id,
        'trigger': trigger,
        'start': start_ts,
        'finish': finish_ts,
        'total_duration': (finish_ts - start_ts).total_seconds() if start_ts and finish_ts else 0,
        'events': events
    }


def generate_report(analysis):
    """Generate a human-readable report from the analysis."""
    lines = []

    lines.append("=" * 80)
    lines.append("OAL ENGINE TRACE ANALYSIS REPORT")
    lines.append("=" * 80)
    lines.append("")
    lines.append(f"Run ID:         {analysis['run_id']}")
    lines.append(f"Trigger:        {analysis['trigger']}")
    lines.append(f"Start:          {analysis['start']}")
    lines.append(f"Finish:         {analysis['finish']}")
    lines.append(f"Total Duration: {format_duration(analysis['total_duration'])}")
    lines.append("")

    # Timeline
    lines.append("-" * 80)
    lines.append("TIMELINE")
    lines.append("-" * 80)
    lines.append("")
    lines.append(f"{'Time':>12} | {'Delta':>10} | {'Path':<40} | Notes")
    lines.append(f"{'-'*12} | {'-'*10} | {'-'*40} | {'-'*20}")

    events = analysis['events']
    start = analysis['start']
    prev_ts = start

    # Group events by action for cleaner output
    action_groups = {}
    for event in events:
        path = event['path']
        # Extract action number
        parts = path.split('/')
        if parts[0] == 'action':
            action_key = '/'.join(parts[:2]) if len(parts) >= 2 else path
        else:
            action_key = path

        if action_key not in action_groups:
            action_groups[action_key] = []
        action_groups[action_key].append(event)

    # Print timeline with grouping
    last_action = None
    for event in events:
        ts = event['timestamp']
        path = event['path']

        time_from_start = (ts - start).total_seconds()
        delta = (ts - prev_ts).total_seconds()

        # Identify significant gaps
        gap_marker = ""
        if delta > 1.0:
            gap_marker = f" ⚠️ GAP: {format_duration(delta)}"
        elif delta > 0.5:
            gap_marker = f" (gap: {format_duration(delta)})"

        # Extract useful info from the event
        notes = ""
        data = event['data']
        changed_vars = data.get('changed_variables', {})
        result = data.get('result', {})

        if 'repeat' in changed_vars:
            repeat = changed_vars['repeat']
            item = repeat.get('item', {})
            zone_id = item.get('id', '')
            if zone_id:
                notes = f"zone: {zone_id}"

        if result.get('params', {}).get('service'):
            params = result['params']
            service = f"{params['domain']}.{params['service']}"
            target = params.get('target', {}).get('entity_id', [])
            if isinstance(target, list) and target:
                target = target[0].split('.')[-1]
            notes = f"{service} → {target}"

        lines.append(f"{time_from_start:>10.3f}s | {format_duration(delta):>10} | {path:<40} | {notes}{gap_marker}")

        prev_ts = ts

    # Summary by phase
    lines.append("")
    lines.append("-" * 80)
    lines.append("PHASE BREAKDOWN")
    lines.append("-" * 80)
    lines.append("")

    # Find phase boundaries
    phases = {
        'trigger': {'start': None, 'end': None, 'events': []},
        'conditions': {'start': None, 'end': None, 'events': []},
        'action/0': {'start': None, 'end': None, 'events': [], 'name': 'Set timestamp'},
        'action/1': {'start': None, 'end': None, 'events': [], 'name': 'Force sleep check'},
        'action/2': {'start': None, 'end': None, 'events': [], 'name': 'Zone Config Loop'},
        'action/3': {'start': None, 'end': None, 'events': [], 'name': 'Apply Phase (Parallel)'},
        'action/4': {'start': None, 'end': None, 'events': [], 'name': 'Completion Event'},
    }

    for event in events:
        path = event['path']
        ts = event['timestamp']

        # Determine phase
        if path.startswith('trigger'):
            phase = 'trigger'
        elif path.startswith('condition'):
            phase = 'conditions'
        elif path.startswith('action/0'):
            phase = 'action/0'
        elif path.startswith('action/1'):
            phase = 'action/1'
        elif path.startswith('action/2'):
            phase = 'action/2'
        elif path.startswith('action/3'):
            phase = 'action/3'
        elif path.startswith('action/4'):
            phase = 'action/4'
        else:
            continue

        if phases[phase]['start'] is None:
            phases[phase]['start'] = ts
        phases[phase]['end'] = ts
        phases[phase]['events'].append(event)

    total = analysis['total_duration']
    for phase_key, phase_data in phases.items():
        if phase_data['start'] and phase_data['end']:
            duration = (phase_data['end'] - phase_data['start']).total_seconds()
            pct = (duration / total * 100) if total > 0 else 0
            name = phase_data.get('name', phase_key)
            event_count = len(phase_data['events'])
            lines.append(f"{phase_key:<15} ({name:<25}): {format_duration(duration):>10} ({pct:>5.1f}%) - {event_count} events")

    # Calculate gaps between phases
    lines.append("")
    lines.append("-" * 80)
    lines.append("INTER-PHASE GAPS (Potential Bottlenecks)")
    lines.append("-" * 80)
    lines.append("")

    phase_order = ['action/0', 'action/1', 'action/2', 'action/3', 'action/4']
    for i in range(len(phase_order) - 1):
        current = phase_order[i]
        next_phase = phase_order[i + 1]

        if phases[current]['end'] and phases[next_phase]['start']:
            gap = (phases[next_phase]['start'] - phases[current]['end']).total_seconds()
            if gap > 0.1:  # Only show gaps > 100ms
                lines.append(f"Gap between {current} and {next_phase}: {format_duration(gap)}")
                if gap > 1.0:
                    lines.append(f"  ⚠️ BOTTLENECK DETECTED: {format_duration(gap)} delay")

    # Service call analysis
    lines.append("")
    lines.append("-" * 80)
    lines.append("SERVICE CALL TIMING")
    lines.append("-" * 80)
    lines.append("")

    service_calls = []
    for event in events:
        result = event['data'].get('result', {})
        params = result.get('params', {})
        if params.get('service'):
            service_calls.append({
                'timestamp': event['timestamp'],
                'service': f"{params['domain']}.{params['service']}",
                'target': params.get('target', {}).get('entity_id', ['unknown'])[0] if isinstance(params.get('target', {}).get('entity_id'), list) else 'unknown'
            })

    if service_calls:
        prev_ts = service_calls[0]['timestamp']
        for call in service_calls:
            delta = (call['timestamp'] - prev_ts).total_seconds()
            time_from_start = (call['timestamp'] - start).total_seconds()
            lines.append(f"{time_from_start:>8.3f}s (+{format_duration(delta):>8}): {call['service']:<45} → {call['target']}")
            prev_ts = call['timestamp']

    lines.append("")
    lines.append("=" * 80)
    lines.append("END OF REPORT")
    lines.append("=" * 80)

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_trace.py <trace_file.json> [output_file.txt]")
        print("       python3 analyze_trace.py logs/*.json  # Analyzes most recent")
        sys.exit(1)

    input_arg = sys.argv[1]

    # Handle glob patterns
    if '*' in input_arg:
        files = glob.glob(input_arg)
        if not files:
            print(f"No files matching: {input_arg}")
            sys.exit(1)
        # Get most recent
        trace_file = max(files, key=os.path.getmtime)
        print(f"Analyzing most recent trace: {trace_file}")
    else:
        trace_file = input_arg

    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    # Load trace
    with open(trace_file, 'r') as f:
        trace_data = json.load(f)

    # Analyze
    analysis = analyze_trace(trace_data)

    # Generate report
    report = generate_report(analysis)

    # Output
    if output_file:
        with open(output_file, 'w') as f:
            f.write(report)
        print(f"Report written to: {output_file}")
    else:
        print(report)


if __name__ == '__main__':
    main()
