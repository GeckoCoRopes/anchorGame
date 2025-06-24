// Pure game logic for testing and reuse

const displayNames = {
  anchor: 'Anchor',
  top_connector: 'Anchor Crab',
  middle_connector: 'Swivel Crab',
  bottom_connector: 'Ring Crab',
  sling: 'Sling',
  swivel: 'Swivel',
  ring: 'Ring'
};

function getDisplayName(type) {
  return displayNames[type] || type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const componentTypes = [
  'anchor',
  'top_connector',
  'sling',
  'middle_connector',
  'swivel',
  'bottom_connector',
  'ring'
];

function pickFailures(anchor, count) {
  const requirementIssues = [];
  const otherIssues = [];
  for (const type of componentTypes) {
    const comp = anchor[type];
    if (comp && comp.requires) {
      const requiredType = comp.requires;
      const requiredComp = anchor[requiredType];
      if (!requiredComp || requiredComp.name === 'None') {
        requirementIssues.push({
          component: type,
          name: comp.name,
          issue: `Missing required ${requiredType}`,
          text: `${comp.name} requires a ${requiredType} but none is present.`
        });
      }
    }
  }
  for (const type of componentTypes) {
    const comp = anchor[type];
    if (comp && comp.potential_issues && comp.potential_issues.length > 0) {
      for (const issue of comp.potential_issues) {
        if (issue.failure) {
          otherIssues.push({
            component: type,
            name: comp.name,
            issue: issue.issue,
            text: issue.text_description
          });
        }
      }
    }
  }
  for (let i = otherIssues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherIssues[i], otherIssues[j]] = [otherIssues[j], otherIssues[i]];
  }
  return requirementIssues.concat(otherIssues.slice(0, count));
}

export { getDisplayName, getRandom, pickFailures, componentTypes }; 