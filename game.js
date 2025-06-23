// Simple text adventure game engine
const output = document.getElementById('output');
const inputForm = document.getElementById('input-form');
const userInput = document.getElementById('user-input');

// Game state
let state = {
  location: 'start',
  inventory: [],
  gameOver: false
};

const scenes = {
  start: {
    description: `You wake up in a dark room. There is a door to the north.\nWhat do you do?`,
    actions: {
      'look': `It's too dark to see much, but you can make out the outline of a door to the north.`,
      'go north': 'door',
      'open door': 'door',
      'inventory': () => `You have: ${state.inventory.length ? state.inventory.join(', ') : 'nothing.'}`
    }
  },
  door: {
    description: `You open the door and step into a dimly lit hallway. There is a key on the floor.\nExits are south and east.`,
    actions: {
      'look': `The hallway is narrow. There is a key on the floor. Exits are south and east.`,
      'take key': () => {
        if (!state.inventory.includes('key')) {
          state.inventory.push('key');
          return 'You pick up the key.';
        } else {
          return 'You already have the key.';
        }
      },
      'go south': 'start',
      'go east': 'treasure',
      'inventory': () => `You have: ${state.inventory.length ? state.inventory.join(', ') : 'nothing.'}`
    }
  },
  treasure: {
    description: `You find a locked chest here. Exits are west.`,
    actions: {
      'look': `There is a locked chest. Exits are west.`,
      'open chest': () => {
        if (state.inventory.includes('key')) {
          state.gameOver = true;
          return 'You unlock the chest and find a pile of gold! You win!';
        } else {
          return 'The chest is locked. You need a key.';
        }
      },
      'go west': 'door',
      'inventory': () => `You have: ${state.inventory.length ? state.inventory.join(', ') : 'nothing.'}`
    }
  }
};

function show(text) {
  output.textContent += text + '\n';
  output.scrollTop = output.scrollHeight;
}

function showScene() {
  show(`\n${scenes[state.location].description}`);
}

function handleInput(input) {
  if (state.gameOver) {
    show('The game is over. Refresh to play again.');
    return;
  }
  const scene = scenes[state.location];
  const action = input.trim().toLowerCase();
  if (scene.actions[action]) {
    const result = typeof scene.actions[action] === 'function' ? scene.actions[action]() : scene.actions[action];
    if (typeof result === 'string' && scenes[result]) {
      state.location = result;
      showScene();
    } else if (typeof result === 'string') {
      show(result);
    }
  } else {
    show("I don't understand that command.");
  }
}

inputForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const value = userInput.value;
  show(`> ${value}`);
  handleInput(value);
  userInput.value = '';
});

// Start the game
showScene(); 