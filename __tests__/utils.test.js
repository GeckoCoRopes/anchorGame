// eslint-env jest
const { getRandom, getDifficultyLevel, getFilteredComponents, getFailureCount, pickFailures } = require('../utils.js');

describe('getRandom', () => {
  it('returns an element from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    for (let i = 0; i < 10; i++) {
      expect(arr).toContain(getRandom(arr));
    }
  });
  it('returns undefined for empty array', () => {
    expect(getRandom([])).toBeUndefined();
  });
});

describe('getDifficultyLevel', () => {
  it('returns 1 for easy', () => {
    expect(getDifficultyLevel('easy')).toBe(1);
  });
  it('returns 2 for medium', () => {
    expect(getDifficultyLevel('medium')).toBe(2);
  });
  it('returns 3 for hard', () => {
    expect(getDifficultyLevel('hard')).toBe(3);
  });
  it('returns 1 for unknown', () => {
    expect(getDifficultyLevel('unknown')).toBe(1);
  });
});

describe('getFilteredComponents', () => {
  const components = {
    foo: [
      { name: 'A' },
      { name: 'B', min_difficulty: 2 },
      { name: 'C', min_difficulty: 3 }
    ]
  };
  it('filters by difficulty', () => {
    expect(getFilteredComponents(components, 'foo', 'easy').map(c => c.name)).toEqual(['A']);
    expect(getFilteredComponents(components, 'foo', 'medium').map(c => c.name)).toEqual(['A', 'B']);
    expect(getFilteredComponents(components, 'foo', 'hard').map(c => c.name)).toEqual(['A', 'B', 'C']);
  });
});

describe('getFailureCount', () => {
  it('returns 0, 1, 2, 3, or 4', () => {
    for (let i = 0; i < 100; i++) {
      expect([0, 1, 2, 3, 4]).toContain(getFailureCount());
    }
  });
});

describe('pickFailures', () => {
  const anchor = {
    foo: { name: 'Foo', requires: 'bar' },
    bar: { name: 'None' },
    baz: {
      name: 'Baz',
      potential_issues: [
        { failure: true, issue: 'Broken', text_description: 'It is broken.' },
        { failure: false, issue: 'Fine', text_description: 'It is fine.' }
      ]
    }
  };
  const componentTypes = ['foo', 'bar', 'baz'];
  it('includes requirement failures', () => {
    const failures = pickFailures(anchor, componentTypes, 1);
    expect(failures.some(f => f.issue.includes('Missing required'))).toBe(true);
  });
  it('includes up to count other failures', () => {
    const failures = pickFailures(anchor, componentTypes, 1);
    // Only one non-requirement failure should be included
    const nonReq = failures.filter(f => !f.issue.includes('Missing required'));
    expect(nonReq.length).toBeLessThanOrEqual(1);
  });
}); 