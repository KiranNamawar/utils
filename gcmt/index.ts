import { $ } from "bun";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const model = "gemini-3-flash-preview";
const systemInstruction = `
You are a Semantic Git Commit Writer.
Rules:
1. First line: <type>(<scope>): <subject> (max 50 chars, imperative).
2. Scope should usually be the folder or area touched.
3. Body: Provide a concise but detailed summary. Group changes by component if possible.
4. Do NOT mention AI or tools.
5. Output ONLY the raw commit message.
`;

async function main() {
  const { stdout, stderr, exitCode } = await $`git diff --cached`.quiet();
  const diff = stdout.toString();
  if (exitCode !== 0) {
    console.error(stderr);
    process.exit(exitCode);
  } else if (diff.trim() === "") {
    console.error("No staged changes found. Use 'git add' first.");
    process.exit(1);
  }

  const response = await ai.models.generateContent({
    model,
    contents: stdout.toString(),
    config: {
      systemInstruction,
    },
  });

  console.log(response.text);
}

main();
