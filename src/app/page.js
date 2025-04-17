"use client";

import React, { useEffect, useState } from "react";
import { createMazePrompt } from "../utils/prompt";
import styles from "./page.module.css";

export default function Home() {
  const [gameWon, setGameWon] = useState(false);
  const [playerPos, setPlayerPos] = useState({ row: -1, col: -1 });
  const [showCelebration, setShowCelebration] = useState(false);

  const createSpaghettiElements = () => {
    const elements = [];
    for (let i = 0; i < 30; i++) {
      const tx = Math.random() * 1000 - 500;
      const ty = Math.random() * 500;
      const rot = Math.random() * 360;
      const delay = Math.random() * 0.5;

      elements.push(
        <div
          key={i}
          className={styles.spaghetti}
          style={{
            left: "50%",
            top: "50%",
            "--tx": `${tx}px`,
            "--ty": `${ty}px`,
            "--rot": `${rot}deg`,
            animationDelay: `${delay}s`,
          }}
        />
      );
    }
    return elements;
  };

  const MAZE_COLS = 12;
  const MAZE_ROWS = 10;
  const CELL_SIZE = 55;

  const mazeData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 4, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 4, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0, 2, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Welcome to the Mystical Maze! 🌟 Navigate through the mysterious labyrinth to find the glowing portal, but beware of the dangerous traps (⚠️)! Use commands like 'move right' or 'go down 2 steps' to navigate.",
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

  function movePlayer(dRow, dCol, currentPos) {
    if (gameWon) return false;

    const newRow = currentPos.row + dRow;
    const newCol = currentPos.col + dCol;

    console.log("Moving from", currentPos, "to", { row: newRow, col: newCol });

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

    if (targetCellType === 4) {
      setFeedback("Oh no! You hit a trap! Try a different path! ☠️");
      return false;
    }

    setPlayerPos({ row: newRow, col: newCol });

    // Win check
    if (targetCellType === 2) {
      setGameWon(true);
      setShowCelebration(true);
      setFeedback("Congratulations! You've reached the exit! 🎉 🍝");
      setTimeout(() => setShowCelebration(false), 2000);
      return true;
    }

    return { success: true, newPos: { row: newRow, col: newCol } };
  }

  function executeMovement(movement, startPos) {
    if (gameWon) return null;
    console.log("Executing movement:", movement);

    const { direction, steps } = movement;
    let dRow = 0,
      dCol = 0;

    if (direction === "up") dRow = -1;
    else if (direction === "down") dRow = 1;
    else if (direction === "left") dCol = -1;
    else if (direction === "right") dCol = 1;
    else return null;

    const numSteps = Math.max(1, Math.min(5, Number(steps) || 1));
    console.log(`Moving ${direction} by ${numSteps} steps`);

    let stepsTaken = 0;
    let currentPos = startPos;
    let result;

    // Try to move all steps at once
    const totalNewRow = startPos.row + dRow * numSteps;
    const totalNewCol = startPos.col + dCol * numSteps;

    // Check if the entire path is clear
    let pathClear = true;
    for (let i = 1; i <= numSteps; i++) {
      const checkRow = startPos.row + dRow * i;
      const checkCol = startPos.col + dCol * i;

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
      result = movePlayer(dRow * numSteps, dCol * numSteps, currentPos);
      if (result.success) {
        stepsTaken = numSteps;
        currentPos = result.newPos;
      }
    } else {
      // If path isn't clear, try moving one step at a time
      for (let i = 0; i < numSteps; i++) {
        if (gameWon) break;
        result = movePlayer(dRow, dCol, currentPos);
        if (result.success) {
          stepsTaken++;
          currentPos = result.newPos;
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

    return currentPos;
  }

  async function executeActions(movements) {
    if (gameWon || !Array.isArray(movements)) return;
    console.log("Executing movements:", movements);

    let currentPos = playerPos;

    // Execute movements sequentially
    for (const movement of movements) {
      if (gameWon) break;

      // Wait a bit for animation and state updates
      await new Promise((resolve) => {
        const newPos = executeMovement(movement, currentPos);
        if (newPos) {
          currentPos = newPos;
        }
        setTimeout(resolve, 1000); // Small delay for visual feedback
      });
    }
  }

  function generateMovementDescription(movements) {
    if (!Array.isArray(movements) || movements.length === 0) return "";

    return movements
      .map(
        (m) => `Moving ${m.direction}${m.steps > 1 ? ` ${m.steps} steps` : ""}`
      )
      .join(", then ");
  }

  // Handler removed as it's no longer needed - using executeActions instead

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
          const movements = JSON.parse(data.content);
          console.log("Parsed movements:", movements);

          if (Array.isArray(movements)) {
            // Execute movements and wait for them to complete
            await executeActions(movements);
            setInput(""); // Clear input after successful command

            // Add AI's response to chat
            const responseContent = generateMovementDescription(movements);
            if (responseContent) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: responseContent,
                },
              ]);
            }
          }
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
      <h1
        style={{
          color: "#fff",
          textShadow: "0 0 10px rgba(255,255,255,0.5)",
          marginBottom: "20px",
        }}
      >
        Mystical Maze Navigator
      </h1>

      <div className={styles.gameContainer}>
        <div
          className={styles.mazeContainer}
          style={{
            gridTemplateColumns: `repeat(${MAZE_COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${MAZE_ROWS}, ${CELL_SIZE}px)`,
          }}
        >
          {mazeData.map((row, r) =>
            row.map((cellType, c) => {
              const isPath = cellType === 0;
              const pathClass = isPath
                ? `${styles.path} ${
                    (r + c) % 2 === 0 ? styles.pathLight : styles.pathDark
                  }`
                : cellType === 1
                ? styles.wall
                : styles.exit;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`${styles.cell} ${
                    cellType === 4 ? styles.danger : pathClass
                  }`}
                  data-row={r}
                  data-col={c}
                />
              );
            })
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
      {showCelebration && (
        <div className={styles.celebration}>{createSpaghettiElements()}</div>
      )}
    </main>
  );
}
