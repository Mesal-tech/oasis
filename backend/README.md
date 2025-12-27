# Oasis Backend Server

Backend server for the Oasis gaming platform with Express.js, Socket.IO, Prisma ORM, Supabase, and Redis.

## Features

- **REST API**: Player management, game statistics, leaderboards, and arenas
- **WebSocket Game Servers**: Real-time multiplayer for Slither.io and Flappy Bird
- **Database**: PostgreSQL with Prisma ORM (Supabase)
- **Caching**: Redis for leaderboard caching and pub/sub
- **Logging**: Winston for structured logging

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Redis Configuration (Optional - will use mock if not available)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Game Server Configuration
GAME_TICK_RATE=60
MAX_PLAYERS_PER_ROOM=50
```

### 3. Set Up Supabase Database

1. Create a Supabase project at https://supabase.com
2. Copy your database URL and API keys to `.env`
3. Run Prisma migrations:

```bash
npm run db:push
```

4. Seed the database with sample data:

```bash
npm run db:seed
```

### 4. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Players
- `POST /api/players/register` - Register new player
- `GET /api/players/:id` - Get player profile
- `PUT /api/players/:id` - Update player profile
- `GET /api/players/:id/stats` - Get player statistics
- `POST /api/players/:id/xp` - Add XP to player

### Games
- `GET /api/games` - List all games
- `GET /api/games/:gameId` - Get game details
- `POST /api/games/:gameId/match` - Record match result

### Leaderboards
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/:gameId` - Game-specific leaderboard
- `GET /api/leaderboard/:gameId/player/:playerId` - Player rank

### Arenas
- `POST /api/arenas` - Create arena
- `GET /api/arenas` - List arenas
- `GET /api/arenas/:id` - Get arena details
- `POST /api/arenas/:id/join` - Join arena
- `POST /api/arenas/:id/complete` - Complete arena

## WebSocket Namespaces

### Slither.io (`/slither`)
Events:
- `join` - Join game room
- `input` - Send player input (angle)
- `gameState` - Receive game state updates
- `playerJoined` - Player joined notification
- `playerLeft` - Player left notification

### Flappy Bird (`/flappy`)
Events:
- `join` - Join game room
- `input` - Send player input (jump/start)
- `gameState` - Receive game state updates
- `playerJoined` - Player joined notification
- `playerLeft` - Player left notification

## Database Schema

- **Player**: User profiles with XP, levels, and ranks
- **Match**: Game match records with scores and rewards
- **Arena**: Competitive game arenas with entry fees
- **ArenaPlayer**: Player participation in arenas
- **Leaderboard**: Rankings for each game

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Architecture

```
src/
├── server.js              # Main Express server
├── config/               # Configuration files
│   ├── supabase.js       # Supabase client
│   └── redis.js          # Redis client
├── db/                   # Database
│   └── index.js          # Prisma client
├── routes/               # API routes
│   ├── players.js
│   ├── games.js
│   ├── leaderboard.js
│   └── arenas.js
├── ws/                   # WebSocket game servers
│   ├── index.js          # Server initialization
│   ├── BaseGameServer.js # Base game server class
│   ├── slither/          # Slither.io server
│   └── flappy/           # Flappy Bird server
├── middleware/           # Express middleware
│   └── errorHandler.js
└── utils/               # Utilities
    └── logger.js         # Winston logger
```

## Next Steps

1. **Set up Supabase**: Create a project and configure the database
2. **Configure Redis** (optional): For production caching
3. **Update Frontend**: Connect frontend to backend API
4. **Deploy**: Deploy to your hosting platform
