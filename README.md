# AI Maze Navigator

A fun, interactive maze game where you guide a player through a maze using natural language commands. The game uses AI to interpret your commands and move the player accordingly.

## Features

- Natural language command processing
- Interactive maze visualization
- Multi-step movement commands
- Intelligent path finding
- Real-time feedback
- Wall collision detection
- Win condition detection

## How to Play

1. The player (red square) starts at a fixed position
2. Guide the player to the exit (green square)
3. Use natural language commands to move the player
4. Avoid walls (dark cells) while navigating

## Commands

You can use various natural language commands to move the player:

### Single Movements

- "move right"
- "go left"
- "move up 2 steps"
- "go 3 steps down"

### Multiple Movements

- "move 2 steps right and then 3 down"
- "go up 2 steps then right"
- "move forward 2 steps and left"

### Direction Aliases

- "forward" or "forwards" → moves up
- "backward" or "backwards" → moves down

## Project Structure

```
maze-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.js    # AI command processing API
│   │   ├── page.js             # Main game component
│   │   └── page.module.css     # Game styles
│   └── utils/
│       └── prompt.js           # AI prompt configuration
```

## Technology Stack

- **Frontend**: React, Next.js
- **AI/ML**: Google Gemini AI for natural language processing
- **Styling**: CSS Modules
- **State Management**: React Hooks
- **API**: Next.js API Routes
- **Development**: Node.js, npm

## Game Rules

1. Player can move up, down, left, or right
2. Each movement can be 1-5 steps
3. Cannot move through walls
4. Cannot move outside the maze boundaries
5. Game is won when reaching the exit
6. Multiple movements can be chained in a single command

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Notes

- The game uses React state for position tracking
- Movement validation includes boundary and wall checks
- AI responses are parsed into structured movement commands
- Sequential movements are handled with proper state management
- Real-time feedback is provided for all actions
