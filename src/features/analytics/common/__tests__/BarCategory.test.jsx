import { describe, expect, it } from 'vitest';
import { __TEST_ONLY__ } from '../BarCategory';

describe('BarCategory sanitisation helpers', () => {
  it('converts NaN-like inputs into safe finite numbers', () => {
    const { toFiniteNumber } = __TEST_ONLY__;

    expect(toFiniteNumber(Number.NaN)).toBe(0);
    expect(toFiniteNumber('NaN')).toBe(0);
    expect(toFiniteNumber('PHP 1,234.50')).toBeCloseTo(1234.5);
    expect(toFiniteNumber('-42')).toBe(-42);
    expect(toFiniteNumber(undefined, 7)).toBe(7);
  });

  it('normalises dataset and derives a padded numeric domain', () => {
    const { normaliseDataset, computeDomain } = __TEST_ONLY__;

    const seriesDefs = [
      {
        key: 'value',
        readerKey: 'value',
        label: 'Value',
        color: '#123456',
        variant: 'chart-1',
        barProps: {},
      },
    ];

    const source = [
      { label: 'Apples', value: 10 },
      { label: 'Bananas', value: 'NaN' },
      { label: null, value: '-20' },
      { value: undefined },
    ];

    const { rows, values } = normaliseDataset(source, seriesDefs, 'label');
    expect(rows).toHaveLength(4);
    expect(rows[0].value).toBe(10);
    expect(rows[1].value).toBe(0);
    expect(rows[2].label).toBe('Item 3');
    expect(rows[3].label).toBe('Item 4');

    expect(values).toEqual([10, 0, -20, 0]);

    const domain = computeDomain(values);
    expect(domain[0]).toBeCloseTo(-21.5);
    expect(domain[1]).toBeCloseTo(11.5);
  });
});
