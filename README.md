# 🦉 Owly — Book Discovery Platform

> Discover books by category, powered by [Open Library](https://openlibrary.org).  
> Built for **Owly** — an EdTech SaaS for primary schools.

---

## 🔗 Live Demo

**[→ Try Owly online](https://exquisite-beignet-5db120.netlify.app)**

---

## 📸 Screenshots

> Add screenshots here after deploy.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Installation

```bash
git clone https://github.com/ItsNotCami/owly.git
cd owly
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

---

## 📂 Project Structure

owly/
├── index.html
├── vite.config.js
├── src/
│ ├── js/
│ │ ├── app.js
│ │ ├── BookRepository.js
│ │ └── UIRenderer.js
│ └── css/
│ └── main.css
└── tests/
└── BookRepository.test.js

---

## 🛠️ Technologies

| Tool       | Purpose                                       |
| ---------- | --------------------------------------------- |
| **Vite**   | Bundler and dev server with native ES modules |
| **Vitest** | Unit testing framework                        |
| **Axios**  | HTTP requests to Open Library API             |
| **Lodash** | Safe data access from API responses           |

---

## 🏗️ Architecture

### Design Pattern: Repository Pattern

The **Repository Pattern** decouples the API layer from the UI layer.

App (controller)
├── BookRepository ← all API calls live here (testable in isolation)
└── UIRenderer ← all DOM manipulation lives here

**Why?**

- `BookRepository` can be mocked entirely in tests — no real HTTP calls needed.
- `UIRenderer` has zero knowledge of where data comes from.
- `App` orchestrates both without mixing concerns.

### API Flow

User types "fantasy"
→ App.searchBooks("fantasy")
→ BookRepository.getBooksBySubject("fantasy")
→ GET https://openlibrary.org/subjects/fantasy.json
→ UIRenderer.renderBooks(books, ...)
User clicks "View description"
→ App.handleBookClick(key, card)
→ BookRepository.getBookDetail("/works/OL8193508W")
→ GET https://openlibrary.org/works/OL8193508W.json
→ UIRenderer.renderBookDescription(card, detail)

---

## 🧪 Testing

Tests cover all critical logic in `BookRepository`:

- Correct URL construction (including subject normalization)
- Correct data mapping from raw API to clean Book/BookDetail models
- Edge cases: missing authors, missing description, object-type description
- Error propagation from HTTP failures

**20 unit tests — all passing.**

---

## 🌐 Deployment

Deployed via [Netlify](https://netlify.com).

```bash
npm run build
# drag-and-drop /dist to Netlify, or connect your GitHub repo
```

---

## 📜 License

MIT — © 2025 Owly
