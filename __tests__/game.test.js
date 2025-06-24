const { getRandom, getDisplayName, pickFailures } = require('../game');

describe('getRandom', () => {
  it('returns an element from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toContain(getRandom(arr));
  });
});

describe('getDisplayName', () => {
  it('returns the display name for known types', () => {
    expect(getDisplayName('top_connector')).toBe('Anchor Crab');
    expect(getDisplayName('middle_connector')).toBe('Swivel Crab');
    expect(getDisplayName('bottom_connector')).toBe('Ring Crab');
  });
  it('formats unknown types', () => {
    expect(getDisplayName('foo_bar')).toBe('Foo Bar');
  });
});

describe('pickFailures', () => {
  it('detects missing required components', () => {
    const anchor = {
      anchor: { name: 'Screw-In Eye', requires: 'swivel' },
      swivel: { name: 'None' }
    };
    const failures = pickFailures(anchor, 1);
    expect(failures.some(f => f.issue && f.issue.includes('Missing required swivel'))).toBe(true);
  });
  it('detects potential issues', () => {
    const anchor = {
      anchor: { name: 'Test Anchor', potential_issues: [
        { issue: 'Test Issue', text_description: 'Test fail', failure: true }
      ] }
    };
    const failures = pickFailures(anchor, 1);
    expect(failures.some(f => f.issue === 'Test Issue')).toBe(true);
  });
}); 