const grid = document.querySelector('[data-category-grid]');

function createCategoryCard(category) {
  const card = document.createElement('article');
  card.className = 'category-card';

  const title = document.createElement('h2');
  title.textContent = category.title;
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = category.short_desc || '';
  card.appendChild(desc);

  const link = document.createElement('a');
  link.href = `wiki-category.html?type=${encodeURIComponent(category.type)}`;
  link.textContent = 'View details';
  card.appendChild(link);

  return card;
}

function showError(error) {
  const message = document.createElement('p');
  message.style.color = '#ff7b7b';
  message.textContent = `Failed to load categories: ${error.message}`;
  grid.replaceWith(message);
}

async function init() {
  try {
    const res = await fetch('components/categories.json');
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const categories = await res.json();
    categories.forEach((category) => {
      grid.appendChild(createCategoryCard(category));
    });
  } catch (error) {
    showError(error);
  }
}

init();

