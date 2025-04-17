import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Define the movement schema
const MovementSchema = z.object({
  direction: z.enum(["up", "down", "left", "right"]),
  steps: z.number().int().min(1).max(5).default(1),
});

// Define the action schema as an array of movements
const ActionSchema = z.array(MovementSchema);

export const runtime = "edge";

export async function POST(req) {
  try {
    const body = await req.json();
    const lastMessage = body.messages?.[body.messages.length - 1];

    if (!lastMessage?.content) {
      throw new Error("No content provided");
    }

    console.log("Processing request:", lastMessage.content);

    const result = await generateObject({
      model: google("gemini-2.0-flash-lite", process.env.GEMINI_API_KEY),
      schema: ActionSchema,
      prompt: lastMessage.content,
    });

    console.log("AI Response:", result);
    console.log("Full AI Response:", JSON.stringify(result, null, 2));

    // Extract just the array from the AI response
    const movements = result.object;
    console.log("Extracted movements:", movements);

    const responseBody = {
      id: Date.now(),
      role: "assistant",
      content: JSON.stringify(movements),
    };
    console.log("Sending response:", responseBody);

    return new Response(JSON.stringify(responseBody), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        id: Date.now(),
        role: "assistant",
        content: JSON.stringify([]), // Return empty array for errors
      }),
      {
        status: error.message === "Invalid action format" ? 400 : 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
