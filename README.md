# hotelapi

Hotel & Restaurant Management System - Backend REST API

## Tech Stack
- Node.js & Express
- PostgreSQL (pg)
- JSON Web Token (JWT) & bcryptjs
- CORS & dotenv

## Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=restaurant_db
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
