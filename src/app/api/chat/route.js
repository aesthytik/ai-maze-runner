import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Define the movement action schema
const MoveActionSchema = z.object({
  action: z.literal("move"),
  direction: z.enum(["up", "down", "left", "right"]),
  steps: z.number().int().min(1).max(5).default(1),
});

// Define the unknown action schema
const UnknownActionSchema = z.object({
  action: z.literal("unknown"),
});

// Combined action schema
const ActionSchema = z.union([MoveActionSchema, UnknownActionSchema]);

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
      model: google("gemini-2.0-flash", process.env.GEMINI_API_KEY),
      schema: ActionSchema,
      prompt: `Process this command for a maze game: "${lastMessage.content}"
      You must respond with a valid action:
      - For movement: use direction "up", "down", "left", or "right" with steps 1-5
      - For invalid commands: use action "unknown"`,
    });

    console.log("AI Response:", result);

    // Log the full AI response for debugging
    console.log("Full AI Response:", JSON.stringify(result, null, 2));

    // Extract just the object from the AI response
    const actionObject = result.object;
    console.log("Extracted action object:", actionObject);

    const responseBody = {
      id: Date.now(),
      role: "assistant",
      content: JSON.stringify(actionObject),
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
        content: JSON.stringify({ action: "unknown" }),
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
