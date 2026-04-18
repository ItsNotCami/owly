/**
 * UIRenderer — handles all DOM rendering for the Owly app.
 * Keeps UI concerns separate from data/API concerns.
 */

export class UIRenderer {
  constructor() {
    this.resultsContainer = document.getElementById('results');
    this.loadingEl = document.getElementById('loading');
    this.errorEl = document.getElementById('error');
    this.resultsTitleEl = document.getElementById('results-title');
  }

  showLoading() {
    this.loadingEl.hidden = false;
    this.resultsContainer.innerHTML = '';
    this.errorEl.hidden = true;
    this.resultsTitleEl.hidden = true;
  }

  hideLoading() {
    this.loadingEl.hidden = true;
  }

  showError(message) {
    this.errorEl.textContent = message;
    this.errorEl.hidden = false;
  }

  /**
   * Renders the list of books
   * @param {Book[]} books
   * @param {string} subject
   * @param {Function} onBookClick - callback when user clicks a book
   */
  renderBooks(books, subject, onBookClick) {
    this.resultsTitleEl.textContent = `Results for "${subject}"`;
    this.resultsTitleEl.hidden = false;
    this.resultsContainer.innerHTML = '';

    if (books.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="empty-state">
          <p>No books found for this category. Try another one!</p>
        </div>`;
      return;
    }

    books.forEach((book) => {
      const card = this._createBookCard(book, onBookClick);
      this.resultsContainer.appendChild(card);
    });
  }

  /**
   * Creates a single book card element
   * @param {Book} book
   * @param {Function} onBookClick
   * @returns {HTMLElement}
   */
  _createBookCard(book, onBookClick) {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.key = book.key;

    const coverUrl = book.coverId
      ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
      : null;

    const authorsText = book.authors.length > 0
      ? book.authors.join(', ')
      : 'Unknown Author';

    const yearText = book.firstPublishYear
      ? `<span class="book-year">${book.firstPublishYear}</span>`
      : '';

    card.innerHTML = `
      <div class="book-cover">
        ${coverUrl
          ? `<img src="${coverUrl}" alt="Cover of ${book.title}" loading="lazy" />`
          : `<div class="book-cover-placeholder"><span>📖</span></div>`
        }
      </div>
      <div class="book-info">
        <div class="book-header">
          <h3 class="book-title">${escapeHtml(book.title)}</h3>
          ${yearText}
        </div>
        <p class="book-authors">${escapeHtml(authorsText)}</p>
        <div class="book-description-area" id="desc-${sanitizeKey(book.key)}" hidden>
          <div class="description-loader" hidden>Loading description...</div>
          <p class="description-text"></p>
          <p class="no-description" hidden>No description available for this book.</p>
        </div>
        <button class="btn-details" data-key="${book.key}" aria-expanded="false">
          View description
        </button>
      </div>`;

    card.querySelector('.btn-details').addEventListener('click', () => {
      onBookClick(book.key, card);
    });

    return card;
  }

  /**
   * Shows loading state on a specific book's description area
   * @param {HTMLElement} card
   */
  showDescriptionLoading(card) {
    const btn = card.querySelector('.btn-details');
    const key = btn.dataset.key;
    const area = card.querySelector(`#desc-${sanitizeKey(key)}`);
    const loader = area.querySelector('.description-loader');

    area.hidden = false;
    loader.hidden = false;
    btn.disabled = true;
    btn.textContent = 'Loading...';
  }

  /**
   * Renders the book description in the card
   * @param {HTMLElement} card
   * @param {BookDetail} detail
   */
  renderBookDescription(card, detail) {
    const btn = card.querySelector('.btn-details');
    const key = btn.dataset.key;
    const area = card.querySelector(`#desc-${sanitizeKey(key)}`);
    const loader = area.querySelector('.description-loader');
    const textEl = area.querySelector('.description-text');
    const noDescEl = area.querySelector('.no-description');

    loader.hidden = true;
    area.hidden = false;

    if (detail.description) {
      textEl.textContent = detail.description;
      textEl.hidden = false;
      noDescEl.hidden = true;
    } else {
      textEl.hidden = true;
      noDescEl.hidden = false;
    }

    btn.textContent = 'Hide description';
    btn.setAttribute('aria-expanded', 'true');
    btn.disabled = false;
    btn.dataset.open = 'true';
  }

  /**
   * Toggles visibility of an already-loaded description
   * @param {HTMLElement} card
   */
  toggleDescription(card) {
    const btn = card.querySelector('.btn-details');
    const key = btn.dataset.key;
    const area = card.querySelector(`#desc-${sanitizeKey(key)}`);
    const isOpen = btn.dataset.open === 'true';

    area.hidden = isOpen;
    btn.dataset.open = isOpen ? 'false' : 'true';
    btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    btn.textContent = isOpen ? 'View description' : 'Hide description';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function sanitizeKey(key) {
  return key.replace(/\//g, '-');
}