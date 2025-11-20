import {
  componentTypes,
  displayNames,
  getDisplayName,
  getRandom,
  getFailureCount,
} from './utils.js';

const anchorOutput = document.getElementById('anchor-output');
const flyBtn = document.getElementById('fly-btn');
const dieBtn = document.getElementById('die-btn');
const inputForm = document.getElementById('input-form');
const userInput = document.getElementById('user-input');
const nextBtn = document.getElementById('next-btn');
// eslint-disable-next-line no-unused-vars
const difficultySelect = document.getElementById('difficulty-select');

function slugifyName(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const wikiTypeAliases = {
  top_connector: 'connector',
  middle_connector: 'connector',
  bottom_connector: 'connector',
};

function getWikiHref(type, name) {
  const canonicalType = wikiTypeAliases[type] || type;
  const params = new URLSearchParams({ type: canonicalType });
  if (name) {
    params.set('component', slugifyName(name));
  }
  return `wiki-category.html?${params.toString()}`;
}


let components = {};
let checkedComponents = {};
let difficulty = 'medium';
let resultShown = false;
let flyDieMode = 'action'; // 'action' or 'next'


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
    let validComponents = filtered;
    
    // Check for incompatibilities with adjacent components by name
    if (type === 'swivel' && anchor.anchor) {
      // Swivel is incompatible with anchor
      validComponents = filtered.filter(comp => 
        !comp.incompatible_with || !comp.incompatible_with.includes(anchor.anchor.name)
      );
    } else if (type === 'top_connector' && anchor.anchor) {
      // Top connector might be incompatible with anchor
      validComponents = filtered.filter(comp => 
        !comp.incompatible_with || !comp.incompatible_with.includes(anchor.anchor.name)
      );
    } else if (type === 'middle_connector' && anchor.swivel) {
      // Middle connector might be incompatible with swivel
      validComponents = filtered.filter(comp => 
        !comp.incompatible_with || !comp.incompatible_with.includes(anchor.swivel.name)
      );
    } else if (type === 'sling' && anchor.top_connector) {
      // Sling might be incompatible with top connector
      validComponents = filtered.filter(comp => 
        !comp.incompatible_with || !comp.incompatible_with.includes(anchor.top_connector.name)
      );
    } else if (type === 'bottom_connector' && anchor.ring) {
      // Bottom connector might be incompatible with ring
      validComponents = filtered.filter(comp => 
        !comp.incompatible_with || !comp.incompatible_with.includes(anchor.ring.name)
      );
    }
    
    // If no valid components, fall back to all filtered components
    if (validComponents.length === 0) {
      validComponents = filtered;
    }
    
    anchor[type] = getRandom(validComponents);
  }
  
  // If swivel is None, make middle_connector None too
  if (anchor.swivel && anchor.swivel.name === 'None') {
    anchor.middle_connector = { name: 'None', desc: '' };
  }
  
  return anchor;
}

function renderAnchor(anchor) {
  const ul = document.getElementById('anchor-components-chosen');
  ul.innerHTML = '';
  for (const type of componentTypes) {
    const comp = anchor[type];
    if (comp && comp.name && comp.name !== 'None') {
      const li = document.createElement('li');
      const typeSpan = document.createElement('span');
      typeSpan.className = 'component-type-label';
      const label = getDisplayName(type);
      typeSpan.textContent = label + ': ';
      li.appendChild(typeSpan);
      const link = document.createElement('a');
      link.href = getWikiHref(type, comp.name);
      link.textContent = comp.name;
      link.target = '_blank';
      link.rel = 'noopener';
      link.title = 'Open wiki entry';
      li.appendChild(link);
      if (difficulty === 'easy' && checkedComponents[type]) {
        if (checkedComponents[type] === 'fail') {
          li.style.color = '#ffd600';
        } else if (checkedComponents[type] === 'ok') {
          li.style.color = '#00e676';
        }
      }
      ul.appendChild(li);
    }
  }
}

function pickFailures(anchor, count) {
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
      debugMsg += `\n- [${getDisplayName(fail.component)}: ${fail.name}] ${fail.issue}`;
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

// Scoreboard state
let score = { failed: 0, passed: 0, skipped: 0 };

function updateScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  const debugToggle = document.getElementById('debug-toggle');
  if (scoreboard) {
    if (debugToggle && debugToggle.checked) {
      scoreboard.style.display = 'none';
    } else {
      scoreboard.style.display = 'flex';
      document.getElementById('score-failed').textContent = `Failed: ${score.failed}`;
      document.getElementById('score-passed').textContent = `Passed: ${score.passed}`;
      document.getElementById('score-skipped').textContent = `Skipped: ${score.skipped}`;
    }
  }
}

function resetScoreboard() {
  score.failed = 0;
  score.passed = 0;
  score.skipped = 0;
  updateScoreboard();
}

function setNextButtonText() {
  if (!resultShown) {
    nextBtn.textContent = 'Skip';
    nextBtn.style.background = '#222';
    nextBtn.style.color = '#aaa';
    nextBtn.style.opacity = '0.7';
  } else {
    nextBtn.textContent = 'Next';
    nextBtn.style.background = '#444';
    nextBtn.style.color = '#fff';
    nextBtn.style.opacity = '1';
  }
}

function setFlyDieMode(mode) {
  flyDieMode = mode;
  // Do not change button text, only the action
}

flyBtn.onclick = () => {
  if (flyDieMode === 'next') {
    nextBtn.onclick();
    return;
  }
  if (currentFailures.length > 0) {
    let msg = '\nYou chose to FLY!\n\nYou die.\n\n';
    msg += ' Failure(s):\n';
    for (const fail of currentFailures) {
      msg += ` - ${getDisplayName(fail.component)} '${fail.name}': ${fail.text}\n`;
    }
    anchorOutput.textContent += msg;
    score.failed++;
  } else {
    anchorOutput.textContent += '\nYou chose to FLY!\n\nYou live!';
    score.passed++;
  }
  updateScoreboard();
  resultShown = true;
  setNextButtonText();
  setFlyDieMode('next');
};

dieBtn.onclick = () => {
  if (flyDieMode === 'next') {
    nextBtn.onclick();
    return;
  }
  let msg = '\nYou chose to DIE!\n\n';
  if (currentFailures.length > 0) {
    msg += 'Congratulations! You avoided disaster\n\n';
    msg += ' Failure(s):\n';
    for (const fail of currentFailures) {
      msg += ` - ${getDisplayName(fail.component)} '${fail.name}': ${fail.text}\n`;
    }
    score.passed++;
  } else {
    msg += 'Better safe than sorry, but this was fine.';
    score.failed++;
  }
  anchorOutput.textContent += msg;
  updateScoreboard();
  resultShown = true;
  setNextButtonText();
  setFlyDieMode('next');
};

nextBtn.onclick = () => {
  if (!resultShown) {
    score.skipped++;
    updateScoreboard();
  }
  anchorOutput.textContent = '';
  checkedComponents = {};
  showRandomAnchor();
  resultShown = false;
  setNextButtonText();
  setFlyDieMode('action');
};

function handleDirectCommands(value) {
  if (/^help$/i.test(value)) {
    document.getElementById('anchor-instructions').style.display = '';
    userInput.value = '';
    return true;
  }
  if (/^hide help$/i.test(value)) {
    document.getElementById('anchor-instructions').style.display = 'none';
    userInput.value = '';
    return true;
  }
  if (/^fly$/i.test(value)) {
    flyBtn.onclick();
    userInput.value = '';
    return true;
  }
  if (/^die$/i.test(value)) {
    dieBtn.onclick();
    userInput.value = '';
    return true;
  }
  return false;
}

function handleGeneralInspect(matchedType, comp) {
  const fail = currentFailures.find(f => f.component === matchedType && f.name === comp.name);
  let compCategoryLine = `<span style='color:#aaa;'>${getDisplayName(matchedType)}</span>`;
  if (fail) {
    if (difficulty === 'hard') {
      if (Math.random() < 0.7) {
        if (comp.desc) {
          anchorOutput.innerHTML += `\n${compCategoryLine} - ${comp.desc}`;
        } else {
          anchorOutput.innerHTML += `\n${compCategoryLine} - No further information.`;
        }
        checkedComponents[matchedType] = 'ok';
      } else {
        anchorOutput.innerHTML += `\n${compCategoryLine} - ${fail.text}`;
        checkedComponents[matchedType] = 'fail';
      }
    } else {
      anchorOutput.innerHTML += `\n${compCategoryLine} - ${fail.text}`;
      checkedComponents[matchedType] = 'fail';
    }
  } else if (comp.desc) {
    anchorOutput.innerHTML += `\n${compCategoryLine} - ${comp.desc}`;
    checkedComponents[matchedType] = 'ok';
  } else {
    anchorOutput.innerHTML += `\n${compCategoryLine} - No further information.`;
    checkedComponents[matchedType] = 'ok';
  }
  renderAnchor(currentAnchor);
}

inputForm.addEventListener('submit', function(e) {
  e.preventDefault();
  // Only allow Enter to trigger Next if a result is shown
  if (resultShown) {
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
    // Handle direct commands (help / hide help / fly / die)
    if (handleDirectCommands(value)) return;
    // Check for investigation synonyms, allow 'c' as shortcut
    // Now support: inspect <component> <key>
    let match = value.match(/^(investigate|check|inspect|examine|look at|c)\s+(.+)$/i);
    if (!match) {
      match = value.match(/^(c)(\d+)$/i);
      if (match) match = [match[0], match[1], match[2]];
    }
    if (match) {
      let query = match[2].toLowerCase();
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
          (displayLabel && componentQuery === displayLabel) ||
          componentQuery === numberAlias ||
          typeLabel.includes(componentQuery)
        ) {
          matchedType = type;
          break;
        }
        // If no typeLabel match, try to match on comp.name
        if (
          componentQuery === comp.name.toLowerCase() ||
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
        // Look for a matching failure in currentFailures
        for (const fail of currentFailures) {
          if (fail.component === matchedType && fail.name === comp.name) {
            // Find the matching key in the component's potential_issues
            if (comp && comp.potential_issues) {
              for (const issue of comp.potential_issues) {
                if (issue.failure && issue.key) {
                  const keys = Array.isArray(issue.key) ? issue.key.map(k => k.toLowerCase()) : [issue.key.toLowerCase()];
                  if (keys.includes(keyQuery)) {
                    // Only show if this is the actual failure for this round
                    if (
                      (fail.issue && issue.issue && fail.issue === issue.issue) ||
                      (fail.text && issue.text_description && fail.text === issue.text_description)
                    ) {
                      anchorOutput.textContent += `\n[${getDisplayName(matchedType)}: ${comp.name}] ${issue.text_description}`;
                      checkedComponents[matchedType] = 'fail';
                      keyFound = true;
                    }
                  }
                }
              }
            }
          }
        }
        if (keyFound) {
          renderAnchor(currentAnchor);
          found = true;
        } else {
          // Fall through to general inspect for this component
          handleGeneralInspect(matchedType, comp);
          found = true;
        }
      } else if (matchedType) {
        // General inspect for this component
        const comp = currentAnchor[matchedType];
        handleGeneralInspect(matchedType, comp);
        found = true;
      }
      if (!found) {
        anchorOutput.textContent += `\nNo such component to investigate.`;
      }
    }
    userInput.value = '';
  }
});

userInput.addEventListener('keydown', function(e) {
  if (inputHistory.length === 0) return;
  if (e.key === 'ArrowUp') {
    if (historyIndex === -1) {
      historyIndex = inputHistory.length - 1;
    } else if (historyIndex > 0) {
      historyIndex--;
    }
    userInput.value = inputHistory[historyIndex] || '';
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    if (historyIndex === -1) return;
    if (historyIndex < inputHistory.length - 1) {
      historyIndex++;
      userInput.value = inputHistory[historyIndex] || '';
    } else {
      historyIndex = -1;
      userInput.value = '';
    }
    e.preventDefault();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  showRandomAnchor();

  // Restore debug toggle event
  const debugToggle = document.getElementById('debug-toggle');
  if (debugToggle) {
    debugToggle.addEventListener('change', () => {
      resetScoreboard();
      showRandomAnchor();
    });
  }

  // Restore difficulty select event
  const difficultySelect = document.getElementById('difficulty-select');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', function() {
      difficulty = difficultySelect.value;
      resetScoreboard();
      showRandomAnchor();
    });
  }
  updateScoreboard();
  setNextButtonText();
  setFlyDieMode('action');
});