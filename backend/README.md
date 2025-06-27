# AI Tutor Platform Backend

A TypeScript Node.js backend application built with Express.js.

## Features

- TypeScript for type safety
- Express.js web framework
- RESTful API endpoints
- Development server with hot reload
- Production build compilation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server with hot reload
npm run dev
```

The server will start on `http://localhost:5050`

## Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## Build Scripts

- `npm run dev` - Start development server with ts-node and nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Compile TypeScript in watch mode
- `npm start` - Start production server

## API Endpoints

- `GET /api/users` - Get users (returns Hello message)

## Project Structure

```
src/
├── app.ts              # Express app configuration
├── server.ts           # Server entry point
├── controllers/        # Route controllers
│   └── userController.ts
└── route/             # Route definitions
    └── userRoutes.ts
dist/                  # Compiled JavaScript (generated)
```

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Node.js** - Runtime environment
- **ts-node** - Development TypeScript execution
- **nodemon** - Development file watcher
