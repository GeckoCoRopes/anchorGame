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

function getDifficultyLevel() {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  if (difficulty === 'hard') return 3;
  return 1;
}

function getFilteredComponents(type) {
  const level = getDifficultyLevel();
  return components[type].filter(comp => !comp.min_difficulty || comp.min_difficulty <= level);
}

function generateRandomAnchor() {
  const anchor = {};
  for (const type of componentTypes) {
    const filtered = getFilteredComponents(type);
    anchor[type] = getRandom(filtered);
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

// Input history for cycling with up arrow
let inputHistory = [];
let historyIndex = -1;

function showRandomAnchor() {
  currentAnchor = generateRandomAnchor();
  renderAnchor(currentAnchor);
  const failCount = getFailureCount();
  currentFailures = pickFailures(currentAnchor, failCount);
  // Debug output of failures (now behind checkbox)
  const debugToggle = document.getElementById('debug-toggle');
  let debugMsg = '';
  if (currentFailures.length > 0) {
    debugMsg = '[DEBUG] Failures this round:';
    for (const fail of currentFailures) {
      debugMsg += `\n- [${fail.component.replace('_',' ')}: ${fail.name}] ${fail.issue}`;
    }
  } else {
    debugMsg = '[DEBUG] No failures this round.';
  }
  // Remove any previous debug info from anchorOutput
  anchorOutput.textContent = anchorOutput.textContent.replace(/\n?\[DEBUG\][^\n]*(\n- [^\n]*)*/g, '');
  if (debugToggle && debugToggle.checked) {
    anchorOutput.textContent += `\n${debugMsg}\n`;
  }
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
    historyIndex = -1;
    return;
  }
  const value = userInput.value.trim();
  if (value) {
    anchorOutput.textContent += `\n> ${value}`;
    inputHistory.push(value);
    if (inputHistory.length > 100) inputHistory.shift(); // Limit history size
    historyIndex = -1;
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
    // Now support: inspect <component> <key>
    const match = value.match(/^(investigate|check|inspect|examine|look at|c)\s+(.+)$/i);
    if (match) {
      let query = match[2].toLowerCase();
      const displayNames = {
        top_connector: 'Anchor Crab',
        middle_connector: 'Swivel Crab',
        bottom_connector: 'Ring Crab'
      };
      let found = false;
      // Try to split query into component and key (e.g., 'sling corrosion')
      let queryParts = query.split(/\s+/);
      let componentQuery = queryParts[0];
      let keyQuery = queryParts.length > 1 ? queryParts.slice(1).join(' ') : null;
      // Try to match component
      let matchedType = null;
      for (let i = 0; i < componentTypes.length; i++) {
        const type = componentTypes[i];
        const comp = currentAnchor[type];
        if (!comp || comp.name === 'None') continue;
        const typeLabel = type.replace('_', ' ').toLowerCase();
        const displayLabel = (displayNames[type] || '').toLowerCase();
        const numberAlias = (i + 1).toString();
        if (
          componentQuery === typeLabel ||
          componentQuery === comp.name.toLowerCase() ||
          (displayLabel && componentQuery === displayLabel) ||
          componentQuery === numberAlias ||
          typeLabel.includes(componentQuery) ||
          comp.name.toLowerCase().includes(componentQuery)
        ) {
          matchedType = type;
          break;
        }
      }
      // If both component and key are specified, check for key-based inspect
      if (matchedType && keyQuery) {
        const comp = currentAnchor[matchedType];
        let keyFound = false;
        if (comp && comp.potential_issues) {
          for (const issue of comp.potential_issues) {
            if (issue.failure && issue.key) {
              const keys = Array.isArray(issue.key) ? issue.key.map(k => k.toLowerCase()) : [issue.key.toLowerCase()];
              if (keys.includes(keyQuery)) {
                anchorOutput.textContent += `\n[${matchedType.replace('_',' ')}: ${comp.name}] ${issue.text_description}`;
                checkedComponents[matchedType] = 'fail';
                keyFound = true;
              }
            }
          }
        }
        if (!keyFound) {
          anchorOutput.textContent += `\nNo such failure key for that component to investigate.`;
        }
        renderAnchor(currentAnchor);
        found = true;
      } else if (matchedType) {
        // General inspect for this component
        const comp = currentAnchor[matchedType];
        const fail = currentFailures.find(f => f.component === matchedType && f.name === comp.name);
        if (fail) {
          if (difficulty === 'hard') {
            // 70% chance to return ok even if failed
            if (Math.random() < 0.7) {
              anchorOutput.textContent += `\nLooks OK.`;
              checkedComponents[matchedType] = 'ok';
            } else {
              anchorOutput.textContent += `\n${fail.text}`;
              checkedComponents[matchedType] = 'fail';
            }
          } else {
            anchorOutput.textContent += `\n${fail.text}`;
            checkedComponents[matchedType] = 'fail';
          }
        } else if (comp.desc) {
          anchorOutput.textContent += `\n${comp.desc}`;
          checkedComponents[matchedType] = 'ok';
        } else {
          anchorOutput.textContent += `\nNo further information.`;
          checkedComponents[matchedType] = 'ok';
        }
        renderAnchor(currentAnchor);
        found = true;
      }
      if (!found) {
        anchorOutput.textContent += `\nNo such component to investigate.`;
      }
    }
  }
  userInput.value = '';
});

// Up arrow cycles through input history
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp') {
    if (inputHistory.length === 0) return;
    if (historyIndex === -1) historyIndex = inputHistory.length - 1;
    else if (historyIndex > 0) historyIndex--;
    userInput.value = inputHistory[historyIndex];
    // Move cursor to end
    setTimeout(() => userInput.setSelectionRange(userInput.value.length, userInput.value.length), 0);
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    if (inputHistory.length === 0) return;
    if (historyIndex === -1) return;
    if (historyIndex < inputHistory.length - 1) historyIndex++;
    else { userInput.value = ''; historyIndex = -1; return; }
    userInput.value = inputHistory[historyIndex];
    setTimeout(() => userInput.setSelectionRange(userInput.value.length, userInput.value.length), 0);
    e.preventDefault();
  }
});

difficultySelect.addEventListener('change', function() {
  difficulty = difficultySelect.value;
  renderAnchor(currentAnchor);
  // Add to input history
  inputHistory.push(`difficulty ${difficulty}`);
  if (inputHistory.length > 100) inputHistory.shift();
  historyIndex = -1;
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  showRandomAnchor();
  setButtonsState({flyDie: true, next: false});
  // Add event listener for debug toggle
  const debugToggle = document.getElementById('debug-toggle');
  if (debugToggle) {
    debugToggle.addEventListener('change', () => {
      showRandomAnchor();
      // Add to input history
      inputHistory.push(`debug ${debugToggle.checked ? 'on' : 'off'}`);
      if (inputHistory.length > 100) inputHistory.shift();
      historyIndex = -1;
    });
  }
}); 