// Utility functions and constants for anchor game logic

export const componentTypes = [
  'anchor',
  'top_connector',
  'sling',
  'middle_connector',
  'swivel',
  'bottom_connector',
  'ring'
];

export const displayNames = {
  anchor: 'Anchor',
  top_connector: 'AnchorCrab',
  middle_connector: 'SwivelCrab',
  bottom_connector: 'RingCrab',
  sling: 'Sling',
  swivel: 'Swivel',
  ring: 'Ring'
};

export function getDisplayName(type) {
  return displayNames[type] || type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getDifficultyLevel(difficulty) {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  if (difficulty === 'hard') return 3;
  return 1;
}

export function getFilteredComponents(components, type, difficulty) {
  const level = getDifficultyLevel(difficulty);
  return components[type].filter(comp => !comp.min_difficulty || comp.min_difficulty <= level);
}

// export function generateRandomAnchor(components, difficulty) {
//   const anchor = {};
//   for (const type of componentTypes) {
//     const filtered = getFilteredComponents(components, type, difficulty);
//     let validComponents = filtered;
//     // Check for incompatibilities with adjacent components by name
//     if (type === 'swivel' && anchor.anchor) {
//       validComponents = filtered.filter(comp =>
//         !comp.incompatible_with || !comp.incompatible_with.includes(anchor.anchor.name)
//       );
//     } else if (type === 'top_connector' && anchor.anchor) {
//       validComponents = filtered.filter(comp =>
//         !comp.incompatible_with || !comp.incompatible_with.includes(anchor.anchor.name)
//       );
//     } else if (type === 'middle_connector' && anchor.swivel) {
//       validComponents = filtered.filter(comp =>
//         !comp.incompatible_with || !comp.incompatible_with.includes(anchor.swivel.name)
//       );
//     } else if (type === 'sling' && anchor.top_connector) {
//       validComponents = filtered.filter(comp =>
//         !comp.incompatible_with || !comp.incompatible_with.includes(anchor.top_connector.name)
//       );
//     } else if (type === 'bottom_connector' && anchor.ring) {
//       validComponents = filtered.filter(comp =>
//         !comp.incompatible_with || !comp.incompatible_with.includes(anchor.ring.name)
//       );
//     }
//     if (validComponents.length === 0) {
//       validComponents = filtered;
//     }
//     anchor[type] = getRandom(validComponents);
//   }
//   if (anchor.swivel && anchor.swivel.name === 'None') {
//     anchor.middle_connector = { name: 'None', desc: '' };
//   }
//   return anchor;
// }

export function getFailureCount() {
  if (Math.random() >= 0.5) return 0;
  const r = Math.random();
  if (r < 0.05) return 4;
  if (r < 0.15) return 3;
  if (r < 0.35) return 2;
  return 1;
}

// export function pickFailures(anchor, componentTypes, count) {
//   const requirementIssues = [];
//   const otherIssues = [];
//   for (const type of componentTypes) {
//     const comp = anchor[type];
//     if (comp && comp.requires) {
//       const requiredType = comp.requires;
//       const requiredComp = anchor[requiredType];
//       if (!requiredComp || requiredComp.name === 'None') {
//         requirementIssues.push({
//           component: type,
//           name: comp.name,
//           issue: `Missing required ${requiredType}`,
//           text: `${comp.name} requires a ${requiredType} but none is present.`
//         });
//       }
//     }
//   }
//   for (const type of componentTypes) {
//     const comp = anchor[type];
//     if (comp.potential_issues && comp.potential_issues.length > 0) {
//       for (const issue of comp.potential_issues) {
//         if (issue.failure) {
//           otherIssues.push({
//             component: type,
//             name: comp.name,
//             issue: issue.issue,
//             text: issue.text_description
//           });
//         }
//       }
//     }
//   }
//   for (let i = otherIssues.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [otherIssues[i], otherIssues[j]] = [otherIssues[j], otherIssues[i]];
//   }
//   return requirementIssues.concat(otherIssues.slice(0, count));
// } 