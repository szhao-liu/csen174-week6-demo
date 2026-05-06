/**
 * Mock Data for Testing
 * This file contains sample data used across tests
 */

// Mock user prompts for testing
const mockUserPrompts = {
  basic: "A young warrior discovers a magical sword in an ancient temple",
  continuation: "The warrior learns to wield the magical sword's power",
  complex: "In a futuristic Tokyo, a hacker uncovers a conspiracy that threatens reality itself"
};

// Mock GPT-4 responses
const mockGPTResponses = {
  valid: {
    imagePrompt: "Anime style illustration of a young warrior in traditional armor standing in an ancient stone temple, dramatic lighting streaming through broken ceiling, holding a glowing magical katana with mystical runes, detailed background with ancient pillars and vines, high quality digital art",
    narrative: "In the depths of the forgotten temple, Kai's fingers wrapped around the hilt of an ancient blade. As the sword awakened, ethereal light danced across the walls, revealing prophecies written in a language older than time itself.",
    nextSuggestion: "The temple begins to collapse as the sword's removal triggers an ancient trap, and mysterious guardians awaken"
  },
  continuation: {
    imagePrompt: "Anime style scene of warrior training with glowing magical sword, energy trails in the air, determined expression, mountain training ground at sunset, dynamic action pose",
    narrative: "Through days of intense training, Kai discovered the sword responded to their emotions. Each swing released waves of pure energy, but mastering this power would require more than strength—it demanded understanding.",
    nextSuggestion: "A mysterious mentor appears, claiming to know the true purpose of the sword and warns of an approaching danger"
  }
};

// Mock DALL-E image responses
const mockDALLEResponses = {
  success: {
    data: [{
      url: "https://example.com/generated-anime-image.png",
      revised_prompt: "Enhanced anime style illustration..."
    }]
  },
  error: {
    error: {
      message: "Rate limit exceeded",
      type: "rate_limit_error"
    }
  }
};

// Mock story history for testing continuity
const mockStoryHistory = [
  {
    userPrompt: "A young warrior discovers a magical sword",
    imagePrompt: "Anime warrior with magical sword in temple",
    imageUrl: "https://example.com/image1.png",
    narrative: "Kai found an ancient blade in a forgotten temple.",
    nextSuggestion: "The sword begins to glow with mysterious power",
    timestamp: "2024-01-01T10:00:00.000Z"
  },
  {
    userPrompt: "The sword reveals its true power",
    imagePrompt: "Anime warrior with glowing sword unleashing energy",
    imageUrl: "https://example.com/image2.png",
    narrative: "As Kai held the blade aloft, waves of energy erupted.",
    nextSuggestion: "Ancient guardians awaken to test the new wielder",
    timestamp: "2024-01-01T10:05:00.000Z"
  }
];

// Test scenarios for different use cases
const testScenarios = {
  firstScene: {
    description: "User creates first scene with no history",
    userPrompt: mockUserPrompts.basic,
    storyHistory: []
  },
  continuation: {
    description: "User continues existing story",
    userPrompt: mockUserPrompts.continuation,
    storyHistory: mockStoryHistory
  },
  longHistory: {
    description: "Story with many scenes (5+)",
    userPrompt: "The final battle begins",
    storyHistory: Array(5).fill(null).map((_, i) => ({
      ...mockStoryHistory[0],
      userPrompt: `Scene ${i + 1}`,
      timestamp: new Date(Date.now() - (5 - i) * 300000).toISOString()
    }))
  }
};

module.exports = {
  mockUserPrompts,
  mockGPTResponses,
  mockDALLEResponses,
  mockStoryHistory,
  testScenarios
};
