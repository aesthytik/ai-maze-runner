export const createMazePrompt = (commandText, mazeRows, mazeCols) => `
You are an AI controlling a character in a simple grid-based maze game.
You will receive commands in natural language and must respond with a JSON object.

The available actions are:
- Moving the character: {"action": "move", "direction": "up" | "down" | "left" | "right", "steps": <number>}
If steps are not specified, assume 1 step.

Rules:
1. Only respond with a valid JSON object, nothing else.
2. Direction must be exactly "up", "down", "left", or "right"
3. Steps must be a number between 1 and 5
4. For invalid commands, respond with {"action": "unknown"}

Current command to process: "${commandText}"

Remember to ONLY return a JSON object, no other text or explanation.
`;
