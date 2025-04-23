# Apsiv Fullstack Application

This is a fullstack application with a React frontend and Express/MySQL backend.

## Project Structure

```
fullstack/
├── frontend/     # React frontend application
├── backend/      # Express backend application
└── package.json  # Root package.json for running both apps
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Installation

1. Install all dependencies (root, frontend, and backend):

```bash
npm run install:all
```

2. Set up the MySQL database:

```bash
npm run setup:db
```

## Running the Application

To run both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3002

## Building for Production

To build the application:

```bash
npm run build
```

To run the built application:

```bash
npm start
```

## Admin User

An admin user is automatically created with the following credentials:

- Email: admin@apsiv.com
- Password: 123456

## Available Scripts

- `npm run dev` - Run both frontend and backend in development mode
- `npm run start` - Run both frontend and backend in production mode
- `npm run build` - Build both frontend and backend
- `npm run install:all` - Install all dependencies
- `npm run setup:db` - Set up the MySQL database
- `npm run dev:frontend` - Run only the frontend in development mode
- `npm run dev:backend` - Run only the backend in development mode
- `npm run start:frontend` - Run only the frontend in production mode
- `npm run start:backend` - Run only the backend in production mode
