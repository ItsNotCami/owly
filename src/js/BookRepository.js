/**
 * BookRepository — Repository Pattern
 * Decouples all Open Library API logic from the UI layer.
 * This makes it easy to swap the data source or mock it during testing.
 */

import axios from 'axios';
import _ from 'lodash';

const BASE_URL = 'https://openlibrary.org';

export class BookRepository {
  constructor(httpClient = axios) {
    this.http = httpClient;
  }

  /**
   * Fetch books by subject/category
   * @param {string} subject - The category (e.g. "fantasy")
   * @param {number} limit - Max books to retrieve
   * @returns {Promise<Book[]>}
   */
  async getBooksBySubject(subject, limit = 20) {
    const normalizedSubject = subject.trim().toLowerCase().replace(/\s+/g, '_');
    const url = `${BASE_URL}/subjects/${normalizedSubject}.json?limit=${limit}`;

    const response = await this.http.get(url);
    const works = _.get(response, 'data.works', []);

    return works.map(this._mapToBook);
  }

  /**
   * Fetch full book details (including description) by book key
   * @param {string} key - Book key e.g. "/works/OL8193508W"
   * @returns {Promise<BookDetail>}
   */
  async getBookDetail(key) {
    const url = `${BASE_URL}${key}.json`;
    const response = await this.http.get(url);
    const data = _.get(response, 'data', {});

    return this._mapToBookDetail(data);
  }

  /**
   * Maps raw API work object to a clean Book model
   * @param {object} work
   * @returns {Book}
   */
  _mapToBook(work) {
    const authors = _.get(work, 'authors', []).map(
      (a) => _.get(a, 'name', 'Unknown Author')
    );

    return {
      key: _.get(work, 'key', ''),
      title: _.get(work, 'title', 'Untitled'),
      authors,
      coverId: _.get(work, 'cover_id', null),
      firstPublishYear: _.get(work, 'first_publish_year', null),
    };
  }

  /**
   * Maps raw API detail object to a clean BookDetail model
   * @param {object} data
   * @returns {BookDetail}
   */
  _mapToBookDetail(data) {
    const rawDescription = _.get(data, 'description', null);
    let description = null;

    if (typeof rawDescription === 'string') {
      description = rawDescription;
    } else if (typeof rawDescription === 'object' && rawDescription !== null) {
      description = _.get(rawDescription, 'value', null);
    }

    return {
      key: _.get(data, 'key', ''),
      title: _.get(data, 'title', 'Untitled'),
      description,
      subjects: _.get(data, 'subjects', []).slice(0, 5),
    };
  }
}

export const bookRepository = new BookRepository();