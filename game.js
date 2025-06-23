const anchorOutput = document.getElementById('anchor-output');
const flyBtn = document.getElementById('fly-btn');
const dieBtn = document.getElementById('die-btn');
const inputForm = document.getElementById('input-form');
const userInput = document.getElementById('user-input');
const nextBtn = document.getElementById('next-btn');

const componentTypes = [
  'anchor',
  'top_connector',
  'sling',
  'middle_connector',
  'swivel',
  'bottom_connector',
  'ring'
];

let components = {};

// Load all component configs
async function loadComponents() {
  // Anchor, sling, swivel, ring use their own config; all connectors use connector.json
  const connectorRes = await fetch('components/connector.json');
  const connectorData = await connectorRes.json();
  components['top_connector'] = connectorData;
  components['middle_connector'] = connectorData;
  components['bottom_connector'] = connectorData;

  for (const type of ['anchor', 'sling', 'swivel', 'ring']) {
    const res = await fetch(`components/${type}.json`);
    components[type] = await res.json();
  }
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomAnchor() {
  const anchor = {};
  for (const type of componentTypes) {
    anchor[type] = getRandom(components[type]);
  }
  return anchor;
}

function renderAnchor(anchor) {
  // Only update the anchor-components-chosen list, do not show anchorOutput text or descriptions
  const ul = document.getElementById('anchor-components-chosen');
  ul.innerHTML = '';
  for (const type of componentTypes) {
    const comp = anchor[type];
    if (comp && comp.name && comp.name !== 'None') {
      const li = document.createElement('li');
      const typeSpan = document.createElement('span');
      typeSpan.className = 'component-type-label';
      typeSpan.textContent = type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) + ': ';
      li.appendChild(typeSpan);
      li.appendChild(document.createTextNode(comp.name));
      ul.appendChild(li);
    }
  }
  // Do not update anchorOutput here
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

function pickFailures(anchor, count) {
  // Gather all possible issues
  const allIssues = [];
  for (const type of componentTypes) {
    const comp = anchor[type];
    if (comp.potential_issues && comp.potential_issues.length > 0) {
      for (const issue of comp.potential_issues) {
        if (issue.failure) {
          allIssues.push({
            component: type,
            name: comp.name,
            issue: issue.issue,
            text: issue.text_description
          });
        }
      }
    }
  }
  // Shuffle and pick up to 'count' failures
  for (let i = allIssues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIssues[i], allIssues[j]] = [allIssues[j], allIssues[i]];
  }
  return allIssues.slice(0, count);
}

let currentAnchor = null;
let currentFailures = [];

function showRandomAnchor() {
  currentAnchor = generateRandomAnchor();
  renderAnchor(currentAnchor);
  const failCount = getFailureCount();
  currentFailures = pickFailures(currentAnchor, failCount);
}

function setButtonsState({flyDie=true, next=false}) {
  flyBtn.style.display = flyDie ? '' : 'none';
  dieBtn.style.display = flyDie ? '' : 'none';
  nextBtn.style.display = next ? '' : 'none';
}

flyBtn.onclick = () => {
  if (currentFailures.length > 0) {
    let msg = '\nYou chose to FLY!\n\nYou die.\n';
    msg += 'Failure(s):\n';
    for (const fail of currentFailures) {
      msg += `- [${fail.component.replace('_',' ')}: ${fail.name}] ${fail.text}\n`;
    }
    anchorOutput.textContent += msg;
  } else {
    anchorOutput.textContent += '\nYou chose to FLY!\n\nYou live!';
  }
  setButtonsState({flyDie: false, next: true});
};

dieBtn.onclick = () => {
  if (currentFailures.length > 0) {
    anchorOutput.textContent += '\nYou chose to DIE!\n\nCongratulations! You avoided disaster.';
  } else {
    anchorOutput.textContent += '\nYou chose to DIE!\n\nBetter safe than sorry, but this was fine.';
  }
  setButtonsState({flyDie: false, next: true});
};

nextBtn.onclick = () => {
  showRandomAnchor();
  setButtonsState({flyDie: true, next: false});
};

inputForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const value = userInput.value.trim();
  if (value) {
    anchorOutput.textContent += `\n> ${value}`;
    // Check for investigation synonyms
    const match = value.match(/^(investigate|check|inspect|examine|look at)\s+(.+)$/i);
    if (match) {
      const query = match[2].toLowerCase();
      let found = false;
      // Try to match by component type or name
      for (const type of componentTypes) {
        const comp = currentAnchor[type];
        if (!comp || comp.name === 'None') continue;
        const typeLabel = type.replace('_', ' ').toLowerCase();
        if (query === typeLabel || query === comp.name.toLowerCase()) {
          // Check if this component failed
          const fail = currentFailures.find(f => f.component === type && f.name === comp.name);
          if (fail) {
            anchorOutput.textContent += `\n${fail.text}`;
          } else if (comp.desc) {
            anchorOutput.textContent += `\n${comp.desc}`;
          } else {
            anchorOutput.textContent += `\nNo further information.`;
          }
          found = true;
          break;
        }
      }
      if (!found) {
        anchorOutput.textContent += `\nNo such component to investigate.`;
      }
    }
  }
  userInput.value = '';
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  showRandomAnchor();
  setButtonsState({flyDie: true, next: false});
}); 