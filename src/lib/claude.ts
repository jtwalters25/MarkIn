import Anthropic from "@anthropic-ai/sdk";
import { EDIT_GENERATOR_PROMPT, FILE_IDENTIFIER_PROMPT } from "./prompts";
import type { FileEdit, FileTarget } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-20250514";

function extractJSON(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const firstBrace = text.search(/[\[{]/);
  if (firstBrace === -1) return text.trim();
  return text.slice(firstBrace).trim();
}

export async function identifyFiles(
  fileTree: string[],
  request: string
): Promise<FileTarget[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: FILE_IDENTIFIER_PROMPT,
    messages: [
      {
        role: "user",
        content: `File tree:\n${fileTree.join("\n")}\n\nUser request: "${request}"`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(extractJSON(text));
  return Array.isArray(parsed) ? parsed : [parsed];
}

export async function generateEdit(
  fileContent: string,
  request: string,
  filePath: string
): Promise<FileEdit> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: EDIT_GENERATOR_PROMPT,
    messages: [
      {
        role: "user",
        content: `File path: ${filePath}\n\nFile content:\n${fileContent}\n\nUser request: "${request}"`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(extractJSON(text));

  return {
    file: filePath,
    originalText: parsed.original_text,
    newText: parsed.new_text,
    lineNumber: parsed.line_number,
    explanation: parsed.explanation,
  };
}
