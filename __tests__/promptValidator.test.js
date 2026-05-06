const { validatePrompt, sanitizePrompt } = require("../src/promptValidator");

describe("validatePrompt()", () => {
  test("accepts a normal anime story prompt", () => {
    const result = validatePrompt("A young warrior discovers a magical sword");
    expect(result.valid).toBe(true);
    expect(result.reason).toBeNull();
  });

  test("rejects an empty string", () => {
    const result = validatePrompt("");
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/at least/);
  });

  test("rejects a prompt that is only whitespace", () => {
    const result = validatePrompt("   ");
    expect(result.valid).toBe(false);
  });

  test("rejects non-string input", () => {
    expect(validatePrompt(null).valid).toBe(false);
    expect(validatePrompt(undefined).valid).toBe(false);
    expect(validatePrompt(42).valid).toBe(false);
  });

  test("rejects an absurdly long prompt", () => {
    const tooLong = "a".repeat(501);
    const result = validatePrompt(tooLong);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/at most/);
  });
});

describe("sanitizePrompt()", () => {
  test("trims surrounding whitespace", () => {
    expect(sanitizePrompt("  hello  ")).toBe("hello");
  });

  test("collapses internal whitespace runs", () => {
    expect(sanitizePrompt("a    b\t\tc")).toBe("a b c");
  });

  test("returns empty string for non-string input", () => {
    expect(sanitizePrompt(null)).toBe("");
    expect(sanitizePrompt(undefined)).toBe("");
  });
});
