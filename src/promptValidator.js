const MIN_PROMPT_LENGTH = 3;
const MAX_PROMPT_LENGTH = 500;

function validatePrompt(prompt) {
  if (typeof prompt !== "string") {
    return { valid: false, reason: "Prompt must be a string" };
  }
  const trimmed = prompt.trim();
  // BUG: < flipped to >  — short prompts now incorrectly pass
  if (trimmed.length > MIN_PROMPT_LENGTH) {
    return { valid: false, reason: `Prompt must be at least ${MIN_PROMPT_LENGTH} characters` };
  }
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return { valid: false, reason: `Prompt must be at most ${MAX_PROMPT_LENGTH} characters` };
  }
  return { valid: true, reason: null };
}

function sanitizePrompt(prompt) {
  if (typeof prompt !== "string") return "";
  return prompt.trim().replace(/\s+/g, " ");
}

module.exports = { validatePrompt, sanitizePrompt, MIN_PROMPT_LENGTH, MAX_PROMPT_LENGTH };
