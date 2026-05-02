# 🤝 Contributing to BallotBuddy AI

Thank you for your interest in contributing! This document outlines the development workflow, coding standards, and PR process.

---

## 🛠️ Development Setup

1. **Fork** the repository and clone your fork
2. Follow the [Quick Start](./README.md#-quick-start) in the README
3. Create a feature branch: `git checkout -b feat/your-feature-name`

---

## 📐 Code Standards

### General
- Use **descriptive variable names** (no single letters except loop counters)
- Every exported function must have a **JSDoc comment** with `@param` and `@returns`
- Use **async/await** over raw Promises for readability
- All errors must be caught and logged via `logger.error()`

### Backend (Node.js)
- **One responsibility per file**: routes handle HTTP, services handle logic
- New routes must register a **Joi validation schema** in `middleware/validate.js`
- All new endpoints must have **rate limiting** applied
- Tests are required for all new service functions

### Frontend (React)
- Components must be **functional** (no class components)
- All interactive elements need an `aria-label` or `aria-labelledby`
- Use the existing **CSS custom properties** (never hardcode colours)
- New pages must be added to `App.jsx` with `React.lazy()`

---

## 🧪 Testing Requirements

| Layer | Tool | Minimum Coverage |
|---|---|---|
| Backend services | Jest | 70% lines |
| Backend routes | Jest + Supertest | All happy + error paths |
| Frontend components | Vitest + RTL | All interactive elements |

Run tests before pushing:
```bash
cd backend && npm test
cd frontend && npm test
```

---

## 📦 Pull Request Process

1. Ensure **all tests pass** and coverage thresholds are met
2. Update the **README** if you add new features or configuration
3. Use **conventional commit messages**:
   - `feat:` – new feature
   - `fix:` – bug fix
   - `docs:` – documentation only
   - `chore:` – maintenance (deps, CI)
   - `test:` – adding/updating tests
4. Request review from a maintainer
5. Squash and merge after approval

---

## 🔒 Security

- **Never commit** `.env` files or service account JSON keys
- Report security vulnerabilities privately to the maintainers
- All new inputs must go through Joi validation + DOMPurify sanitization

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
