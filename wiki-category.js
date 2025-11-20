const titleEl = document.querySelector('[data-category-title]');
const summaryEl = document.querySelector('[data-category-summary]');
const detailsSection = document.querySelector('[data-category-details]');
const longDescEl = document.querySelector('[data-category-long]');
const listsContainer = document.querySelector('[data-category-lists]');
const componentGrid = document.querySelector('[data-component-grid]');
const categoryNav = document.querySelector('[data-category-nav]');

const params = new URLSearchParams(window.location.search);
const typeParam = params.get('type');
const focusParam = params.get('component');

const typeToFile = {
  anchor: 'anchor',
  top_connector: 'connector',
  middle_connector: 'connector',
  sling: 'sling',
  swivel: 'swivel',
  bottom_connector: 'connector',
  ring: 'ring',
};

const canonicalTypeMap = {
  connector: 'connector',
  top_connector: 'connector',
  middle_connector: 'connector',
  bottom_connector: 'connector',
};

function getCanonicalType(type) {
  return canonicalTypeMap[type] || type;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function formatRequires(requirement) {
  if (!requirement) return null;
  const label = requirement.replace('_', ' ');
  return `Requires ${label}`;
}

function formatDifficulty(minDifficulty) {
  if (!minDifficulty) return null;
  if (minDifficulty === 1) return 'Easy+';
  if (minDifficulty === 2) return 'Medium+';
  if (minDifficulty === 3) return 'Hard only';
  return `Min difficulty: ${minDifficulty}`;
}

function createCard(type, component) {
  const article = document.createElement('article');
  const slug = slugify(component.name);
  article.className = 'component-card';
  article.dataset.componentId = slug;

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
    chip.textContent = difficultyTag;
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

function renderCategoryDetails(category) {
  titleEl.textContent = category.title;
  summaryEl.textContent = category.short_desc || 'Detailed reference.';
  let shouldShowDetails = false;
  listsContainer.innerHTML = '';

  if (category.long_desc) {
    longDescEl.textContent = category.long_desc;
    longDescEl.hidden = false;
    shouldShowDetails = true;
  } else {
    longDescEl.textContent = '';
    longDescEl.hidden = true;
  }
  if (Array.isArray(category.inspection_tips) && category.inspection_tips.length > 0) {
    const tipsHeading = document.createElement('h3');
    tipsHeading.textContent = 'Inspection tips';
    listsContainer.appendChild(tipsHeading);

    const tipsList = document.createElement('ul');
    category.inspection_tips.forEach((tip) => {
      const li = document.createElement('li');
      li.textContent = tip;
      tipsList.appendChild(li);
    });
    listsContainer.appendChild(tipsList);
    shouldShowDetails = true;
  }

  if (category.usage_notes) {
    const usageHeading = document.createElement('h3');
    usageHeading.textContent = 'Field notes';
    listsContainer.appendChild(usageHeading);
    const usagePara = document.createElement('p');
    usagePara.textContent = category.usage_notes;
    listsContainer.appendChild(usagePara);
    shouldShowDetails = true;
  }

  detailsSection.hidden = !shouldShowDetails;
}

function showError(message) {
  const errorEl = document.createElement('p');
  errorEl.className = 'error';
  errorEl.textContent = message;
  componentGrid.replaceWith(errorEl);
}

function renderCategoryNav(categories, activeType) {
  if (!categoryNav) return;
  categoryNav.innerHTML = '';
  const allLink = document.createElement('a');
  allLink.href = 'wiki.html';
  allLink.textContent = 'All categories';
  categoryNav.appendChild(allLink);

  categories.forEach((category) => {
    const link = document.createElement('a');
    link.href = `wiki-category.html?type=${encodeURIComponent(category.type)}`;
    link.textContent = category.title;
    if (category.type === activeType) {
      link.classList.add('is-active');
    }
    categoryNav.appendChild(link);
  });
}

async function loadCategory(type, canonicalType) {
  const res = await fetch('components/categories.json');
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  const categories = await res.json();
  const activeType = canonicalType || type;
  renderCategoryNav(categories, activeType);
  const match = categories.find((item) => item.type === activeType);
  if (!match) {
    throw new Error(`Unknown category '${activeType}'`);
  }
  renderCategoryDetails(match);
  return match;
}

async function loadComponents(type) {
  const source = typeToFile[type];
  if (!source) {
    throw new Error(`Unsupported component type '${type}'`);
  }
  const res = await fetch(`components/${source}.json`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  data
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((component) => {
      componentGrid.appendChild(createCard(source, component));
    });
}

function focusComponent(slug) {
  if (!slug) return;
  const target = document.querySelector(`[data-component-id="${slug}"]`);
  if (target) {
    target.classList.add('component-card--highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

async function init() {
  if (!typeParam) {
    showError('Select a category from the wiki index.');
    return;
  }
  const canonicalType = getCanonicalType(typeParam);
  try {
    await loadCategory(typeParam, canonicalType);
    await loadComponents(typeParam);
    if (focusParam) {
      focusComponent(focusParam);
    }
  } catch (error) {
    showError(error.message);
  }
}

init();

