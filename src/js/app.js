/**
 * App — Main controller / entry point.
 * Orchestrates the BookRepository (data) and UIRenderer (presentation).
 */

import { bookRepository } from './BookRepository.js';
import { UIRenderer } from './UIRenderer.js';

class App {
  constructor(repository, renderer) {
    this.repository = repository;
    this.renderer = renderer;
    this.loadedDescriptions = new Map();
  }

  init() {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    this.featuredSection = document.getElementById('featured-section');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = input.value.trim();
      if (subject) this.searchBooks(subject);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const subject = input.value.trim();
        if (subject) this.searchBooks(subject);
      }
    });

    const suggestions = document.querySelectorAll('.suggestion-chip');
    suggestions.forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = chip.dataset.subject;
        this.searchBooks(chip.dataset.subject);
      });
    });

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card) => {
      card.addEventListener('click', () => {
        input.value = card.dataset.subject;
        this.searchBooks(card.dataset.subject);
      });
    });
  }

  async searchBooks(subject) {
    this.renderer.showLoading();
    this.loadedDescriptions.clear();
    this.featuredSection.hidden = true;

    try {
      const books = await this.repository.getBooksBySubject(subject, 20);
      this.renderer.hideLoading();
      this.renderer.renderBooks(books, subject, (key, card) =>
        this.handleBookClick(key, card)
      );
    } catch (err) {
      this.renderer.hideLoading();
      this.renderer.showError(
        'Could not load books. Please check the category name and try again.'
      );
      console.error('Search error:', err);
    }
  }

  async handleBookClick(key, card) {
    if (this.loadedDescriptions.has(key)) {
      this.renderer.toggleDescription(card);
      return;
    }

    this.renderer.showDescriptionLoading(card);

    try {
      const detail = await this.repository.getBookDetail(key);
      this.loadedDescriptions.set(key, detail);
      this.renderer.renderBookDescription(card, detail);
    } catch (err) {
      this.renderer.renderBookDescription(card, { description: null });
      console.error('Detail error:', err);
    }
  }
}

const app = new App(bookRepository, new UIRenderer());
app.init();