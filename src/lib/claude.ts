import Anthropic from "@anthropic-ai/sdk";
import { EDIT_GENERATOR_PROMPT, FILE_IDENTIFIER_PROMPT } from "./prompts";
import type { FileEdit, FileTarget } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-6";

function extractJSON(text: string): string {
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const firstBrace = cleaned.search(/[\[{]/);
  if (firstBrace === -1) return cleaned;
  return cleaned.slice(firstBrace).trim();
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
  console.log("[analyze] identifyFiles raw Claude response:", text);
  const parsed = JSON.parse(extractJSON(text));
  console.log("[analyze] identifyFiles parsed result:", parsed);
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
  console.log("[analyze] generateEdit raw Claude response:", text);
  const parsed = JSON.parse(extractJSON(text));

  if (parsed.original_text == null || parsed.new_text == null) {
    throw new Error(
      "Couldn't generate a valid edit for that request. Try being more specific about what text to change."
    );
  }

  return {
    file: filePath,
    originalText: parsed.original_text,
    newText: parsed.new_text,
    lineNumber: parsed.line_number,
    explanation: "",
  };
}
