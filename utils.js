// Utility functions for anchor game logic

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDifficultyLevel(difficulty) {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  if (difficulty === 'hard') return 3;
  return 1;
}

function getFilteredComponents(components, type, difficulty) {
  const level = getDifficultyLevel(difficulty);
  return components[type].filter(comp => !comp.min_difficulty || comp.min_difficulty <= level);
}

function getFailureCount() {
  // 50% chance of any failure
  if (Math.random() >= 0.5) return 0;
  // If there is a failure, determine how many
  const r = Math.random();
  if (r < 0.05) return 4;
  if (r < 0.15) return 3;
  if (r < 0.35) return 2;
  return 1;
}

function pickFailures(anchor, componentTypes, count) {
  // Gather all possible issues
  const requirementIssues = [];
  const otherIssues = [];
  // First, check for requirement failures
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
  // Then gather all other potential issues
  for (const type of componentTypes) {
    const comp = anchor[type];
    if (comp.potential_issues && comp.potential_issues.length > 0) {
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
  // Shuffle and pick up to 'count' non-requirement failures
  for (let i = otherIssues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherIssues[i], otherIssues[j]] = [otherIssues[j], otherIssues[i]];
  }
  // Always include all requirement issues, plus up to 'count' other issues
  return requirementIssues.concat(otherIssues.slice(0, count));
}

module.exports = {
  getRandom,
  getDifficultyLevel,
  getFilteredComponents,
  getFailureCount,
  pickFailures
}; 