/**
 * Sizing Contract Tests
 *
 * Guards for CD4 (Shared Sizing And Sections Adoption).
 * These tests define the boundary behavior of the sizing functions
 * BEFORE the consistency pass modifies or replaces them.
 * Any CD4 change that breaks these tests is a regression.
 */

import { describe, it, expect } from 'vitest';
import { autoSizeFromWidth, bucketFromWidth } from '../tunet_base.js';

describe('autoSizeFromWidth', () => {
  it('returns standard for invalid inputs', () => {
    expect(autoSizeFromWidth(null)).toBe('standard');
    expect(autoSizeFromWidth(undefined)).toBe('standard');
    expect(autoSizeFromWidth(NaN)).toBe('standard');
    expect(autoSizeFromWidth(-1)).toBe('standard');
    expect(autoSizeFromWidth(0)).toBe('standard');
    expect(autoSizeFromWidth(Infinity)).toBe('standard');
    expect(autoSizeFromWidth('abc')).toBe('standard');
  });

  it('returns compact below 600px', () => {
    expect(autoSizeFromWidth(1)).toBe('compact');
    expect(autoSizeFromWidth(299)).toBe('compact');
    expect(autoSizeFromWidth(300)).toBe('compact');
    expect(autoSizeFromWidth(599)).toBe('compact');
  });

  it('returns standard at 600px and above', () => {
    expect(autoSizeFromWidth(600)).toBe('standard');
    expect(autoSizeFromWidth(601)).toBe('standard');
    expect(autoSizeFromWidth(1440)).toBe('standard');
  });

  it('handles string numeric inputs', () => {
    expect(autoSizeFromWidth('400')).toBe('compact');
    expect(autoSizeFromWidth('700')).toBe('standard');
  });
});

describe('bucketFromWidth', () => {
  it('returns md for invalid inputs', () => {
    expect(bucketFromWidth(null)).toBe('md');
    expect(bucketFromWidth(undefined)).toBe('md');
    expect(bucketFromWidth(NaN)).toBe('md');
    expect(bucketFromWidth(-1)).toBe('md');
    expect(bucketFromWidth(0)).toBe('md');
  });

  it('returns xs below 400px', () => {
    expect(bucketFromWidth(1)).toBe('xs');
    expect(bucketFromWidth(200)).toBe('xs');
    expect(bucketFromWidth(399)).toBe('xs');
  });

  it('returns sm from 400px to 599px', () => {
    expect(bucketFromWidth(400)).toBe('sm');
    expect(bucketFromWidth(500)).toBe('sm');
    expect(bucketFromWidth(599)).toBe('sm');
  });

  it('returns md from 600px to 799px', () => {
    expect(bucketFromWidth(600)).toBe('md');
    expect(bucketFromWidth(700)).toBe('md');
    expect(bucketFromWidth(799)).toBe('md');
  });

  it('returns lg at 800px and above', () => {
    expect(bucketFromWidth(800)).toBe('lg');
    expect(bucketFromWidth(1000)).toBe('lg');
    expect(bucketFromWidth(1440)).toBe('lg');
  });

  it('boundary values are exact', () => {
    expect(bucketFromWidth(399)).toBe('xs');
    expect(bucketFromWidth(400)).toBe('sm');
    expect(bucketFromWidth(599)).toBe('sm');
    expect(bucketFromWidth(600)).toBe('md');
    expect(bucketFromWidth(799)).toBe('md');
    expect(bucketFromWidth(800)).toBe('lg');
  });
});
