/**
 * Tests for BookRepository
 * Uses mocked axios to avoid real HTTP calls (unit tests).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookRepository } from '../src/js/BookRepository.js';

// --- Fixtures ---

const mockSubjectResponse = {
  data: {
    name: 'Fantasy',
    works: [
      {
        key: '/works/OL8193508W',
        title: "Alice's Adventures in Wonderland",
        authors: [{ name: 'Lewis Carroll' }],
        cover_id: 10527843,
        first_publish_year: 1865,
      },
      {
        key: '/works/OL27516W',
        title: 'The Hobbit',
        authors: [{ name: 'J.R.R. Tolkien' }],
        cover_id: null,
        first_publish_year: 1937,
      },
      {
        key: '/works/OL0W',
        title: 'No Author Book',
        authors: [],
        cover_id: null,
        first_publish_year: null,
      },
    ],
  },
};

const mockDetailResponse = {
  data: {
    key: '/works/OL8193508W',
    title: "Alice's Adventures in Wonderland",
    description:
      "One of the most popular books in English, Alice's Adventures in Wonderland...",
    subjects: ['Fantasy', 'Children', 'Classic', 'Victorian', 'Literature'],
  },
};

const mockDetailObjectDescription = {
  data: {
    key: '/works/OL27516W',
    title: 'The Hobbit',
    description: {
      type: '/type/text',
      value: 'In a hole in the ground there lived a hobbit...',
    },
    subjects: [],
  },
};

const mockDetailNoDescription = {
  data: {
    key: '/works/OL999W',
    title: 'No Description Book',
    subjects: [],
  },
};

// --- Tests ---

describe('BookRepository', () => {
  let mockHttp;
  let repo;

  beforeEach(() => {
    mockHttp = { get: vi.fn() };
    repo = new BookRepository(mockHttp);
  });

  // ---- getBooksBySubject ----

  describe('getBooksBySubject', () => {
    it('calls the correct Open Library URL', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      await repo.getBooksBySubject('fantasy');
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://openlibrary.org/subjects/fantasy.json?limit=20'
      );
    });

    it('normalizes subject to lowercase and underscores', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      await repo.getBooksBySubject('Science Fiction');
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('/subjects/science_fiction.json')
      );
    });

    it('trims whitespace from subject', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      await repo.getBooksBySubject('  fantasy  ');
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('/subjects/fantasy.json')
      );
    });

    it('returns correct number of books', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      const books = await repo.getBooksBySubject('fantasy');
      expect(books).toHaveLength(3);
    });

    it('maps book title correctly', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      const books = await repo.getBooksBySubject('fantasy');
      expect(books[0].title).toBe("Alice's Adventures in Wonderland");
    });

    it('maps book key correctly', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      const books = await repo.getBooksBySubject('fantasy');
      expect(books[0].key).toBe('/works/OL8193508W');
    });

    it('maps authors array correctly', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      const books = await repo.getBooksBySubject('fantasy');
      expect(books[0].authors).toEqual(['Lewis Carroll']);
    });

    it('returns empty authors array when no authors', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      const books = await repo.getBooksBySubject('fantasy');
      expect(books[2].authors).toEqual([]);
    });

    it('maps coverId correctly', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      const books = await repo.getBooksBySubject('fantasy');
      expect(books[0].coverId).toBe(10527843);
      expect(books[1].coverId).toBeNull();
    });

    it('maps firstPublishYear correctly', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      const books = await repo.getBooksBySubject('fantasy');
      expect(books[0].firstPublishYear).toBe(1865);
      expect(books[2].firstPublishYear).toBeNull();
    });

    it('returns empty array when no works in response', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      const books = await repo.getBooksBySubject('unknown');
      expect(books).toEqual([]);
    });

    it('respects custom limit parameter', async () => {
      mockHttp.get.mockResolvedValue(mockSubjectResponse);
      await repo.getBooksBySubject('fantasy', 5);
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=5')
      );
    });

    it('propagates HTTP errors', async () => {
      mockHttp.get.mockRejectedValue(new Error('Network Error'));
      await expect(repo.getBooksBySubject('fantasy')).rejects.toThrow(
        'Network Error'
      );
    });
  });

  // ---- getBookDetail ----

  describe('getBookDetail', () => {
    it('calls the correct Open Library URL for a work key', async () => {
      mockHttp.get.mockResolvedValue(mockDetailResponse);
      await repo.getBookDetail('/works/OL8193508W');
      expect(mockHttp.get).toHaveBeenCalledWith(
        'https://openlibrary.org/works/OL8193508W.json'
      );
    });

    it('returns description as string when description is a string', async () => {
      mockHttp.get.mockResolvedValue(mockDetailResponse);
      const detail = await repo.getBookDetail('/works/OL8193508W');
      expect(typeof detail.description).toBe('string');
      expect(detail.description).toContain("Alice's Adventures");
    });

    it('unwraps description.value when description is an object', async () => {
      mockHttp.get.mockResolvedValue(mockDetailObjectDescription);
      const detail = await repo.getBookDetail('/works/OL27516W');
      expect(detail.description).toBe(
        'In a hole in the ground there lived a hobbit...'
      );
    });

    it('returns null description when description is missing', async () => {
      mockHttp.get.mockResolvedValue(mockDetailNoDescription);
      const detail = await repo.getBookDetail('/works/OL999W');
      expect(detail.description).toBeNull();
    });

    it('limits subjects to 5', async () => {
      mockHttp.get.mockResolvedValue(mockDetailResponse);
      const detail = await repo.getBookDetail('/works/OL8193508W');
      expect(detail.subjects.length).toBeLessThanOrEqual(5);
    });

    it('returns empty subjects when not present', async () => {
      mockHttp.get.mockResolvedValue(mockDetailNoDescription);
      const detail = await repo.getBookDetail('/works/OL999W');
      expect(detail.subjects).toEqual([]);
    });

    it('propagates HTTP errors', async () => {
      mockHttp.get.mockRejectedValue(new Error('404 Not Found'));
      await expect(repo.getBookDetail('/works/OL000W')).rejects.toThrow(
        '404 Not Found'
      );
    });
  });
});