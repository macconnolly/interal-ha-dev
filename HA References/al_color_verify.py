#!/usr/bin/env python3
"""
Adaptive Lighting Color Interpolation Verification Script

Demonstrates exactly how AL calculates intermediate RGB values during
transition_until_sleep, and why blue values appear.

Usage: python3 al_color_verify.py
"""
import colorsys
import math
from dataclasses import dataclass


def color_temperature_to_rgb(kelvin: int) -> tuple[int, int, int]:
    """
    Tanner Helland algorithm for converting color temperature to RGB.
    This is the same algorithm used by Home Assistant.
    
    Reference: https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
    """
    temp = kelvin / 100
    
    # Red calculation
    if temp <= 66:
        red = 255
    else:
        red = 329.698727446 * ((temp - 60) ** -0.1332047592)
        red = max(0, min(255, red))
    
    # Green calculation  
    if temp <= 66:
        green = 99.4708025861 * math.log(temp) - 161.1195681661
    else:
        green = 288.1221695283 * ((temp - 60) ** -0.0755148492)
    green = max(0, min(255, green))
    
    # Blue calculation - THIS IS THE KEY!
    if temp >= 66:
        blue = 255
    elif temp <= 19:  # 1900K and below = 0 blue
        blue = 0
    else:
        # For 2000K: temp=20, so (20-10)=10
        # blue = 138.52 * ln(10) - 305.04 ≈ 14
        blue = 138.5177312231 * math.log(temp - 10) - 305.0447927307
        blue = max(0, min(255, blue))
    
    return (round(red), round(green), round(blue))


def lerp_color_hsv(
    rgb1: tuple[int, int, int],
    rgb2: tuple[int, int, int],
    t: float,
) -> tuple[int, int, int]:
    """
    Adaptive Lighting's HSV interpolation function.
    Exact copy from color_and_brightness.py
    """
    t = abs(t)
    assert 0 <= t <= 1

    # Convert RGB to HSV
    hsv1 = colorsys.rgb_to_hsv(*[x / 255.0 for x in rgb1])
    hsv2 = colorsys.rgb_to_hsv(*[x / 255.0 for x in rgb2])

    # Linear interpolation in HSV space
    hsv = (
        hsv1[0] + t * (hsv2[0] - hsv1[0]),
        hsv1[1] + t * (hsv2[1] - hsv1[1]),
        hsv1[2] + t * (hsv2[2] - hsv1[2]),
    )

    # Convert back to RGB
    rgb = tuple(round(x * 255) for x in colorsys.hsv_to_rgb(*hsv))
    return rgb


def lerp_color_rgb(
    rgb1: tuple[int, int, int],
    rgb2: tuple[int, int, int],
    t: float,
) -> tuple[int, int, int]:
    """
    Alternative: Direct RGB interpolation (not used by AL).
    Demonstrates what values would be without HSV conversion.
    """
    t = abs(t)
    assert 0 <= t <= 1
    
    return (
        round(rgb1[0] + t * (rgb2[0] - rgb1[0])),
        round(rgb1[1] + t * (rgb2[1] - rgb1[1])),
        round(rgb1[2] + t * (rgb2[2] - rgb1[2])),
    )


def rgb_to_hsv_display(rgb: tuple[int, int, int]) -> str:
    """Convert RGB to HSV for display purposes."""
    hsv = colorsys.rgb_to_hsv(*[x / 255.0 for x in rgb])
    return f"H:{hsv[0]*360:.1f}° S:{hsv[1]*100:.1f}% V:{hsv[2]*100:.1f}%"


def print_section(title: str):
    """Print a section header."""
    print()
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)


def main():
    # Configuration (matches your OAL setup)
    MIN_COLOR_TEMP = 2000  # Your min_color_temp
    SLEEP_RGB = (255, 165, 0)  # Your sleep_rgb_color (orange)
    
    print_section("ADAPTIVE LIGHTING COLOR INTERPOLATION ANALYSIS")
    
    # Part 1: Show what 2000K converts to
    print_section("1. COLOR TEMPERATURE TO RGB CONVERSION")
    
    print("\nTemperature to RGB conversion (Tanner Helland algorithm):\n")
    print(f"{'Kelvin':>8} │ {'Red':>5} │ {'Green':>5} │ {'Blue':>5} │ Notes")
    print("─" * 55)
    
    for kelvin in [1800, 1900, 2000, 2200, 2500, 2700, 3000, 4000]:
        rgb = color_temperature_to_rgb(kelvin)
        note = ""
        if kelvin == 1900:
            note = "← Blue threshold (≤1900K = 0)"
        elif kelvin == MIN_COLOR_TEMP:
            note = "← YOUR MIN_COLOR_TEMP"
        print(f"{kelvin:>8} │ {rgb[0]:>5} │ {rgb[1]:>5} │ {rgb[2]:>5} │ {note}")
    
    min_temp_rgb = color_temperature_to_rgb(MIN_COLOR_TEMP)
    print(f"\n⚠️  KEY FINDING: {MIN_COLOR_TEMP}K converts to {min_temp_rgb}")
    print(f"   Blue channel = {min_temp_rgb[2]}, NOT 0!")
    
    # Part 2: Show HSV values
    print_section("2. HSV COLOR SPACE VALUES")
    
    print(f"\nStart (2000K RGB):  {min_temp_rgb}")
    print(f"                    {rgb_to_hsv_display(min_temp_rgb)}")
    print(f"\nTarget (Sleep RGB): {SLEEP_RGB}")
    print(f"                    {rgb_to_hsv_display(SLEEP_RGB)}")
    
    hsv1 = colorsys.rgb_to_hsv(*[x / 255.0 for x in min_temp_rgb])
    hsv2 = colorsys.rgb_to_hsv(*[x / 255.0 for x in SLEEP_RGB])
    
    print(f"\n⚠️  Note: Start hue ({hsv1[0]*360:.1f}°) ≠ Target hue ({hsv2[0]*360:.1f}°)")
    print(f"   This hue difference causes HSV interpolation to produce blue!")
    
    # Part 3: Show interpolation results
    print_section("3. HSV INTERPOLATION (AL's Method)")
    
    print("\nInterpolation from 2000K RGB → Sleep RGB in HSV space:\n")
    print(f"{'t':>6} │ {'Red':>5} │ {'Green':>5} │ {'Blue':>5} │ {'Hue':>8} │ Notes")
    print("─" * 60)
    
    for t in [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]:
        rgb = lerp_color_hsv(min_temp_rgb, SLEEP_RGB, t)
        hsv = colorsys.rgb_to_hsv(*[x / 255.0 for x in rgb])
        
        note = ""
        if t == 0.0:
            note = "← Start (sunset)"
        elif t == 1.0:
            note = "← End (sleep mode)"
        elif rgb[2] >= 5:
            note = "⚠️ Blue ≥5 (Govee purple bug)"
        
        print(f"{t:>6.1f} │ {rgb[0]:>5} │ {rgb[1]:>5} │ {rgb[2]:>5} │ {hsv[0]*360:>6.1f}° │ {note}")
    
    # Part 4: Compare with RGB interpolation
    print_section("4. RGB INTERPOLATION (Alternative)")
    
    print("\nWhat if AL used direct RGB interpolation instead?\n")
    print(f"{'t':>6} │ {'Red':>5} │ {'Green':>5} │ {'Blue':>5} │ Notes")
    print("─" * 50)
    
    for t in [0.0, 0.25, 0.5, 0.75, 1.0]:
        rgb = lerp_color_rgb(min_temp_rgb, SLEEP_RGB, t)
        
        note = ""
        if rgb[2] >= 5:
            note = "⚠️ Still has blue (from start value)"
        
        print(f"{t:>6.2f} │ {rgb[0]:>5} │ {rgb[1]:>5} │ {rgb[2]:>5} │ {note}")
    
    print("\n⚠️  Even RGB interpolation has blue because START has blue!")
    
    # Part 5: Solution demonstration
    print_section("5. SOLUTION: CUSTOM START COLOR")
    
    custom_start = (255, 140, 0)  # Pure orange, no blue
    
    print(f"\nUsing custom start color: {custom_start} (instead of 2000K RGB)")
    print(f"\n{'t':>6} │ {'Red':>5} │ {'Green':>5} │ {'Blue':>5} │ Notes")
    print("─" * 50)
    
    for t in [0.0, 0.25, 0.5, 0.75, 1.0]:
        rgb = lerp_color_hsv(custom_start, SLEEP_RGB, t)
        
        note = "✓ No blue!" if rgb[2] == 0 else f"Blue = {rgb[2]}"
        print(f"{t:>6.2f} │ {rgb[0]:>5} │ {rgb[1]:>5} │ {rgb[2]:>5} │ {note}")
    
    # Summary
    print_section("SUMMARY")
    
    print("""
┌─────────────────────────────────────────────────────────────────────┐
│ ROOT CAUSE                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ 1. color_temperature_to_rgb(2000) returns [255, 137, 14]            │
│    - Blue = 14 because 2000K > 1900K threshold                      │
│                                                                     │
│ 2. HSV interpolation between different hues creates intermediate    │
│    colors that convert back to RGB with non-zero blue               │
├─────────────────────────────────────────────────────────────────────┤
│ SOLUTIONS                                                           │
├─────────────────────────────────────────────────────────────────────┤
│ A. Set min_color_temp to 1900K (eliminates START blue only)         │
│    - HSV interpolation may still produce some blue                  │
│                                                                     │
│ B. Request AL feature: transition_start_rgb_color option            │
│    - Override start color with pure orange [255, 140, 0]            │
│                                                                     │
│ C. Request AL feature: sleep_transition_clamp_blue option           │
│    - Force blue channel to 0 in output                              │
│                                                                     │
│ D. Use automation to intercept and clamp RGB values                 │
│    - Post-process any blue < 10 to blue = 0                         │
└─────────────────────────────────────────────────────────────────────┘
""")


if __name__ == "__main__":
    main()