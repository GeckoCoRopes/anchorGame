const componentSources = [
  {
    type: 'anchor',
    title: 'Anchors',
    blurb: 'Primary attachment points – bolts, beams, and fixed eyes.',
  },
  {
    type: 'connector',
    title: 'Connectors (Top / Middle / Bottom)',
    blurb: 'Carabiners and links that join each stage of the anchor.',
  },
  {
    type: 'sling',
    title: 'Slings',
    blurb: 'Webbing, soft goods, and chains that connect the system.',
  },
  {
    type: 'swivel',
    title: 'Swivels',
    blurb: 'Allow the load to rotate (or be intentionally absent).',
  },
  {
    type: 'ring',
    title: 'Lowering Rings',
    blurb: 'Final hardware the rope runs through.',
  },
];

const container = document.querySelector('[data-component-sections]');

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatRequires(requirement) {
  if (!requirement) return null;
  const label = requirement.replace('_', ' ');
  return `Requires ${label}`;
}

function formatDifficulty(minDifficulty) {
  if (!minDifficulty) return null;
  if (minDifficulty === 1) return 'Min difficulty: Easy';
  if (minDifficulty === 2) return 'Min difficulty: Medium';
  if (minDifficulty === 3) return 'Min difficulty: Hard';
  return `Min difficulty: ${minDifficulty}`;
}

function createPlaceholderFigure(name) {
  const figure = document.createElement('figure');
  figure.className = 'component-card__media component-card__media--placeholder';
  figure.textContent = `Add a photo named ${slugify(name)}.* inside images/components`;
  return figure;
}

function getImageCandidates(type, slug) {
  return [
    `images/components/${type}/${slug}.webp`,
    `images/components/${type}/${slug}.png`,
    `images/components/${type}/${slug}.jpg`,
    `images/components/${type}/${slug}.jpeg`,
    `images/components/${type}/${slug}.svg`,
  ];
}

function createImageFigure(type, name) {
  const slug = slugify(name);
  const figure = document.createElement('figure');
  figure.className = 'component-card__media';
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = name;
  const candidates = getImageCandidates(type, slug);
  let attempt = 0;
  img.src = candidates[attempt];
  img.addEventListener('error', () => {
    attempt += 1;
    if (attempt < candidates.length) {
      img.src = candidates[attempt];
    } else {
      figure.replaceWith(createPlaceholderFigure(name));
    }
  });
  figure.appendChild(img);
  return figure;
}

function renderIssues(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return '<p>No documented failures.</p>';
  }
  return `
    <ul class="issue-list">
      ${list
        .map(
          (issue) => `
            <li>
              <strong>${issue.issue || 'Issue'}</strong>
              ${issue.text_description ? ` – ${issue.text_description}` : ''}
            </li>
          `,
        )
        .join('')}
    </ul>
  `;
}

function createCard(type, component) {
  const article = document.createElement('article');
  article.className = 'component-card';

  const figure = createImageFigure(type, component.name);
  article.appendChild(figure);

  const body = document.createElement('div');
  body.className = 'component-card__body';

  const title = document.createElement('h3');
  title.textContent = component.name;
  body.appendChild(title);

  if (component.desc) {
    const desc = document.createElement('p');
    desc.textContent = component.desc;
    body.appendChild(desc);
  }

  const meta = document.createElement('div');
  meta.className = 'meta-row';
  const difficultyTag = formatDifficulty(component.min_difficulty);
  const requirementTag = formatRequires(component.requires);
  if (difficultyTag) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = difficultyTag.replace('Min difficulty: ', '');
    meta.appendChild(chip);
  }
  if (requirementTag) {
    const text = document.createElement('span');
    text.textContent = requirementTag;
    meta.appendChild(text);
  }
  if (meta.children.length > 0) {
    body.appendChild(meta);
  }

  const detail = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Failure modes';
  detail.appendChild(summary);
  detail.insertAdjacentHTML('beforeend', renderIssues(component.potential_issues));
  body.appendChild(detail);

  article.appendChild(body);
  return article;
}

function showError(section, error) {
  const message = document.createElement('p');
  message.style.color = '#ff7b7b';
  message.textContent = `Failed to load data: ${error.message}`;
  section.appendChild(message);
}

async function loadSection(source) {
  const section = document.createElement('section');
  section.innerHTML = `
    <header>
      <h2>${source.title}</h2>
      <p>${source.blurb}</p>
    </header>
    <div class="card-grid" data-card-grid></div>
  `;
  container.appendChild(section);
  try {
    const response = await fetch(`components/${source.type}.json`);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const grid = section.querySelector('[data-card-grid]');
    data
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((component) => {
        grid.appendChild(createCard(source.type, component));
      });
  } catch (error) {
    showError(section, error);
  }
}

async function init() {
  for (const source of componentSources) {
    await loadSection(source);
  }
}

init();

