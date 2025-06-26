 // eslint-env jest
import {
  getDisplayName,
  getRandom,
  getDifficultyLevel,
  getFilteredComponents,
  // generateRandomAnchor,
  getFailureCount,
  // pickFailures,
  componentTypes,
  displayNames
} from '../utils.js';

describe('getDisplayName', () => {
  it('returns the display name for known types', () => {
    expect(getDisplayName('anchor')).toBe('Anchor');
    expect(getDisplayName('top_connector')).toBe('AnchorCrab');
    expect(getDisplayName('middle_connector')).toBe('SwivelCrab');
    expect(getDisplayName('bottom_connector')).toBe('RingCrab');
    expect(getDisplayName('sling')).toBe('Sling');
    expect(getDisplayName('swivel')).toBe('Swivel');
    expect(getDisplayName('ring')).toBe('Ring');
  });
  it('returns a formatted string for unknown types', () => {
    expect(getDisplayName('foo_bar')).toBe('Foo Bar');
    expect(getDisplayName('baz')).toBe('Baz');
  });
});

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

// describe('generateRandomAnchor', () => {
//   const components = {
//     anchor: [{ name: 'A' }],
//     top_connector: [{ name: 'B' }],
//     sling: [{ name: 'C' }],
//     middle_connector: [{ name: 'D' }],
//     swivel: [{ name: 'E' }],
//     bottom_connector: [{ name: 'F' }],
//     ring: [{ name: 'G' }]
//   };
//   it('generates an anchor with all component types', () => {
//     const anchor = generateRandomAnchor(components, 'easy');
//     for (const type of componentTypes) {
//       expect(anchor[type]).toBeDefined();
//     }
//   });
// });

describe('getFailureCount', () => {
  it('returns 0, 1, 2, 3, or 4', () => {
    for (let i = 0; i < 100; i++) {
      expect([0, 1, 2, 3, 4]).toContain(getFailureCount());
    }
  });
});

// describe('pickFailures', () => {
//   const anchor = {
//     foo: { name: 'Foo', requires: 'bar' },
//     bar: { name: 'None' },
//     baz: {
//       name: 'Baz',
//       potential_issues: [
//         { failure: true, issue: 'Broken', text_description: 'It is broken.' },
//         { failure: false, issue: 'Fine', text_description: 'It is fine.' }
//       ]
//     }
//   };
//   const types = ['foo', 'bar', 'baz'];
//   it('includes requirement failures', () => {
//     const failures = pickFailures(anchor, types, 1);
//     expect(failures.some(f => f.issue.includes('Missing required'))).toBe(true);
//   });
//   it('includes up to count other failures', () => {
//     const failures = pickFailures(anchor, types, 1);
//     const nonReq = failures.filter(f => !f.issue.includes('Missing required'));
//     expect(nonReq.length).toBeLessThanOrEqual(1);
//   });
//   it('does not include requirement failures if none exist', () => {
//     const anchorNoReq = {
//       foo: { name: 'Foo' },
//       bar: { name: 'Bar' },
//       baz: {
//         name: 'Baz',
//         potential_issues: [
//           { failure: true, issue: 'Broken', text_description: 'It is broken.' },
//           { failure: false, issue: 'Fine', text_description: 'It is fine.' }
//         ]
//       }
//     };
//     const failures = pickFailures(anchorNoReq, ['foo', 'bar', 'baz'], 2);
//     expect(failures.some(f => f.issue.includes('Missing required'))).toBe(false);
//     expect(failures.length).toBeLessThanOrEqual(2);
//     expect(failures.every(f => f.issue === 'Broken')).toBe(true);
//   });
// });

describe('componentTypes and displayNames', () => {
  it('componentTypes contains all expected types', () => {
    expect(componentTypes).toEqual([
      'anchor',
      'top_connector',
      'sling',
      'middle_connector',
      'swivel',
      'bottom_connector',
      'ring'
    ]);
  });
  it('displayNames maps types to display names', () => {
    expect(displayNames.anchor).toBe('Anchor');
    expect(displayNames.top_connector).toBe('AnchorCrab');
    expect(displayNames.middle_connector).toBe('SwivelCrab');
    expect(displayNames.bottom_connector).toBe('RingCrab');
    expect(displayNames.sling).toBe('Sling');
    expect(displayNames.swivel).toBe('Swivel');
    expect(displayNames.ring).toBe('Ring');
  });
});
