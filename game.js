const anchorOutput = document.getElementById('anchor-output');
const flyBtn = document.getElementById('fly-btn');
const dieBtn = document.getElementById('die-btn');
const inputForm = document.getElementById('input-form');
const userInput = document.getElementById('user-input');
const nextBtn = document.getElementById('next-btn');
const difficultySelect = document.getElementById('difficulty-select');

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
let checkedComponents = {};
let difficulty = 'medium';

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
  const displayNames = {
    top_connector: 'Anchor Crab',
    middle_connector: 'Swivel Crab',
    bottom_connector: 'Ring Crab'
  };
  for (const type of componentTypes) {
    const comp = anchor[type];
    if (comp && comp.name && comp.name !== 'None') {
      const li = document.createElement('li');
      const typeSpan = document.createElement('span');
      typeSpan.className = 'component-type-label';
      const label = displayNames[type] || type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
      typeSpan.textContent = label + ': ';
      li.appendChild(typeSpan);
      li.appendChild(document.createTextNode(comp.name));
      // Color if checked (only in easy mode)
      if (difficulty === 'easy' && checkedComponents[type]) {
        if (checkedComponents[type] === 'fail') {
          li.style.color = '#ffd600'; // yellow
        } else if (checkedComponents[type] === 'ok') {
          li.style.color = '#00e676'; // green
        }
      }
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
  anchorOutput.textContent = '';
  checkedComponents = {};
  showRandomAnchor();
  setButtonsState({flyDie: true, next: false});
};

inputForm.addEventListener('submit', function(e) {
  e.preventDefault();
  // If Next is visible, pressing Enter triggers Next
  if (nextBtn.style.display !== 'none') {
    nextBtn.onclick();
    userInput.value = '';
    return;
  }
  const value = userInput.value.trim();
  if (value) {
    anchorOutput.textContent += `\n> ${value}`;
    // Show instructions on 'help', hide on 'hide help'
    if (/^help$/i.test(value)) {
      document.getElementById('anchor-instructions').style.display = '';
      userInput.value = '';
      return;
    }
    if (/^hide help$/i.test(value)) {
      document.getElementById('anchor-instructions').style.display = 'none';
      userInput.value = '';
      return;
    }
    // Fly/Die text commands
    if (/^fly$/i.test(value)) {
      flyBtn.onclick();
      userInput.value = '';
      return;
    }
    if (/^die$/i.test(value)) {
      dieBtn.onclick();
      userInput.value = '';
      return;
    }
    // Check for investigation synonyms, allow 'c' as shortcut
    const match = value.match(/^(investigate|check|inspect|examine|look at|c)\s+(.+)$/i);
    if (match) {
      let query = match[2].toLowerCase();
      const displayNames = {
        top_connector: 'Anchor Crab',
        middle_connector: 'Swivel Crab',
        bottom_connector: 'Ring Crab'
      };
      let found = false;
      for (let i = 0; i < componentTypes.length; i++) {
        const type = componentTypes[i];
        const comp = currentAnchor[type];
        if (!comp || comp.name === 'None') continue;
        const typeLabel = type.replace('_', ' ').toLowerCase();
        const displayLabel = (displayNames[type] || '').toLowerCase();
        // Allow number alias (1-based)
        const numberAlias = (i + 1).toString();
        if (
          query === typeLabel ||
          query === comp.name.toLowerCase() ||
          (displayLabel && query === displayLabel) ||
          query === numberAlias
        ) {
          // Check if this component failed
          const fail = currentFailures.find(f => f.component === type && f.name === comp.name);
          if (fail) {
            anchorOutput.textContent += `\n${fail.text}`;
            checkedComponents[type] = 'fail';
          } else if (comp.desc) {
            anchorOutput.textContent += `\n${comp.desc}`;
            checkedComponents[type] = 'ok';
          } else {
            anchorOutput.textContent += `\nNo further information.`;
            checkedComponents[type] = 'ok';
          }
          renderAnchor(currentAnchor);
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

difficultySelect.addEventListener('change', function() {
  difficulty = difficultySelect.value;
  renderAnchor(currentAnchor);
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  showRandomAnchor();
  setButtonsState({flyDie: true, next: false});
}); 