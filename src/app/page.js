"use client";

import React, { useEffect, useState } from "react";
import { createMazePrompt } from "../utils/prompt";
import styles from "./page.module.css";

export default function Home() {
  const [gameWon, setGameWon] = useState(false);
  const [playerPos, setPlayerPos] = useState({ row: -1, col: -1 });

  const MAZE_COLS = 10;
  const MAZE_ROWS = 8;
  const CELL_SIZE = 40;

  const mazeData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Welcome! Guide the player (red square) to the exit (green square) using commands like 'move right' or 'go down 2 steps'.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    const startPos = findStartPosition();
    setPlayerPos(startPos);
  }, []);

  function findStartPosition() {
    for (let r = 0; r < MAZE_ROWS; r++) {
      for (let c = 0; c < MAZE_COLS; c++) {
        if (mazeData[r][c] === 3) {
          return { row: r, col: c };
        }
      }
    }
    return { row: 1, col: 1 };
  }

  function movePlayer(dRow, dCol) {
    if (gameWon) return false;

    const newRow = playerPos.row + dRow;
    const newCol = playerPos.col + dCol;

    console.log("Moving from", playerPos, "to", { row: newRow, col: newCol });

    // Boundary check
    if (
      newRow < 0 ||
      newRow >= MAZE_ROWS ||
      newCol < 0 ||
      newCol >= MAZE_COLS
    ) {
      setFeedback("Cannot move outside the maze!");
      return false;
    }

    // Wall check
    const targetCellType = mazeData[newRow][newCol];
    if (targetCellType === 1) {
      setFeedback("Cannot move through walls!");
      return false;
    }

    setPlayerPos({ row: newRow, col: newCol });

    // Win check
    if (targetCellType === 2) {
      setGameWon(true);
      setFeedback("Congratulations! You've reached the exit! 🎉");
      return true;
    }

    return true;
  }

  function executeAction(action) {
    if (gameWon) return;
    console.log("Executing action:", action);

    switch (action.action) {
      case "move": {
        const { direction, steps } = action;
        let dRow = 0,
          dCol = 0;

        if (direction === "up") dRow = -1;
        else if (direction === "down") dRow = 1;
        else if (direction === "left") dCol = -1;
        else if (direction === "right") dCol = 1;
        else return;

        const numSteps = Math.max(1, Math.min(5, Number(steps) || 1));
        console.log(`Moving ${direction} by ${numSteps} steps`);

        let stepsTaken = 0;
        let success = false;

        // Try to move all steps at once
        const totalNewRow = playerPos.row + dRow * numSteps;
        const totalNewCol = playerPos.col + dCol * numSteps;

        // Check if the entire path is clear
        let pathClear = true;
        for (let i = 1; i <= numSteps; i++) {
          const checkRow = playerPos.row + dRow * i;
          const checkCol = playerPos.col + dCol * i;

          // Check boundaries
          if (
            checkRow < 0 ||
            checkRow >= MAZE_ROWS ||
            checkCol < 0 ||
            checkCol >= MAZE_COLS ||
            mazeData[checkRow][checkCol] === 1
          ) {
            pathClear = false;
            break;
          }
        }

        if (pathClear) {
          // Move the full distance
          success = movePlayer(dRow * numSteps, dCol * numSteps);
          if (success) stepsTaken = numSteps;
        } else {
          // If path isn't clear, try moving one step at a time
          for (let i = 0; i < numSteps; i++) {
            if (gameWon) break;
            if (movePlayer(dRow, dCol)) {
              stepsTaken++;
            } else {
              break;
            }
          }
        }

        if (stepsTaken > 0) {
          setFeedback(
            `Moved ${direction} ${stepsTaken} step${stepsTaken > 1 ? "s" : ""}`
          );
        }
        break;
      }
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!input?.trim()) return;

    setIsLoading(true);
    setFeedback("");

    const prompt = createMazePrompt(input, MAZE_ROWS, MAZE_COLS);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      // Add the user's message to the chat
      setMessages((prev) => [...prev, { role: "user", content: input }]);

      if (data?.content) {
        try {
          const actionJson = JSON.parse(data.content);
          console.log("Parsed action:", actionJson);
          executeAction(actionJson);
          setInput(""); // Clear input after successful command

          // Add AI's response to chat
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Moving ${actionJson.direction}${
                actionJson.steps > 1 ? ` ${actionJson.steps} steps` : ""
              }`,
            },
          ]);
        } catch (e) {
          console.error("Error parsing action:", e);
          setFeedback("Invalid command response from AI");
        }
      }
    } catch (error) {
      console.error("Error submitting command:", error);
      setFeedback("Error processing command");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <h1>AI Maze Navigator</h1>

      <div className={styles.gameContainer}>
        <div
          className={styles.mazeContainer}
          style={{
            gridTemplateColumns: `repeat(${MAZE_COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${MAZE_ROWS}, ${CELL_SIZE}px)`,
          }}
        >
          {mazeData.map((row, r) =>
            row.map((cellType, c) => (
              <div
                key={`${r}-${c}`}
                className={`${styles.cell} ${
                  cellType === 1
                    ? styles.wall
                    : cellType === 2
                    ? styles.exit
                    : styles.path
                }`}
                data-row={r}
                data-col={c}
              />
            ))
          )}
        </div>
        <div
          className={styles.player}
          style={{
            top: `${playerPos.row * CELL_SIZE}px`,
            left: `${playerPos.col * CELL_SIZE}px`,
          }}
        />
      </div>

      <div className={styles.chatInterface}>
        <div className={styles.chatOutput}>
          {messages.map((m, index) => (
            <div key={index} className={`${styles.message} ${styles[m.role]}`}>
              {m.content}
            </div>
          ))}
        </div>
        <form className={styles.chatInputArea} onSubmit={handleFormSubmit}>
          <input
            type="text"
            value={input || ""}
            onChange={handleInputChange}
            placeholder="Enter command..."
            disabled={gameWon || isLoading}
          />
          <button
            type="submit"
            disabled={gameWon || isLoading || !input?.trim()}
          >
            Send
          </button>
        </form>
        {isLoading && <p className={styles.loadingIndicator}>Thinking...</p>}
        {feedback && <p className={styles.feedback}>{feedback}</p>}
      </div>
    </main>
  );
}
