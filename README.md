StayFeed is a full-stack, server-rendered HackerNews client and community platform, built to showcase modern web-app patterns and deliver a polished user experience:

Backend (StayFeed-API)

Node.js & Express proxy to the HackerNews Firebase API and Algolia search

MongoDB (Mongoose) for persisting user ratings and threaded comments

Firebase Admin SDK for secure user authentication and token verification

Exposes REST endpoints:

GET /api/topstories (proxy top HN stories)

GET /api/search?q= (search HN via Algolia)

POST/GET/PUT/DELETE /api/ratings (per-user star ratings)

POST/GET/PUT/DELETE /api/comments (threaded comments with replies)

Frontend (StayFeed-Web)

Create React App SPA with React Router for protected routes

Firebase JS SDK for signup, login, and token management

Axios service layer to call your API (with automatic auth headers)

Custom UI Components:

SearchBar with debounce and accessibility

NewsCard with glass-morphism styling, live previews, and hover effects

Rating widget using react-icons, supporting create/update/delete of stars

Comments component with recursive, threaded replies, edit/delete, and polished animations

Key Highlights

Fully type-safe and testable: small components, mockable API layer, unit & integration tests with Jest/RTL & Supertest

Environment-driven configuration for seamless local, staging, and production deployments

Serverless-ready: backend on Render, frontend on Vercel, and Cloud-hosted MongoDB Atlas

Includes CI hooks for linting, testing, and health-check pings to keep the API warm
