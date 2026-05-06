/**
 * AI Behavior Tests
 * Tests for AI response handling, parsing, and validation
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const {
  mockUserPrompts,
  mockGPTResponses,
  testScenarios,
  mockStoryHistory
} = require('./helpers/mockData');
const {
  createMockOpenAI,
  createFlakeyMockOpenAI,
  verifyGPTCall,
  verifyDALLECall
} = require('./helpers/mockOpenAI');

describe('AI Response Generation', () => {
  let mockOpenAI;

  beforeEach(() => {
    mockOpenAI = createMockOpenAI();
  });

  describe('GPT-4 Story Generation', () => {
    test('should generate valid story data structure', async () => {
      const response = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: mockUserPrompts.basic }
        ]
      });

      const storyData = JSON.parse(response.choices[0].message.content);
      console.log('Generated Story Data:', storyData);

      expect(storyData).toHaveProperty('imagePrompt');
      expect(storyData).toHaveProperty('narrative');
      expect(storyData).toHaveProperty('nextSuggestion');
    });

    test('should include anime-optimized image prompt', async () => {
      const response = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: mockUserPrompts.basic }
        ]
      });

      const storyData = JSON.parse(response.choices[0].message.content);

      expect(storyData.imagePrompt).toBeTruthy();
      expect(typeof storyData.imagePrompt).toBe('string');
      expect(storyData.imagePrompt.length).toBeGreaterThan(20);
    });

    test('should generate narrative description', async () => {
      const response = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: mockUserPrompts.basic }
        ]
      });

      const storyData = JSON.parse(response.choices[0].message.content);

      expect(storyData.narrative).toBeTruthy();
      expect(typeof storyData.narrative).toBe('string');
      expect(storyData.narrative.length).toBeGreaterThan(10);
    });

    test('should provide next scene suggestion', async () => {
      const response = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: mockUserPrompts.basic }
        ]
      });

      const storyData = JSON.parse(response.choices[0].message.content);

      expect(storyData.nextSuggestion).toBeTruthy();
      expect(typeof storyData.nextSuggestion).toBe('string');
    });

    test('should handle story continuation with context', async () => {
      const storyContext = mockStoryHistory.map((h, i) =>
        `Scene ${i + 1}: ${h.userPrompt}\nNarrative: ${h.narrative}`
      ).join('\n\n');

      const prompt = `Previous story:\n${storyContext}\n\nCurrent scene: ${mockUserPrompts.continuation}`;

      const response = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: prompt }
        ]
      });

      const storyData = JSON.parse(response.choices[0].message.content);

      // Should still have all required fields
      expect(storyData).toHaveProperty('imagePrompt');
      expect(storyData).toHaveProperty('narrative');
      expect(storyData).toHaveProperty('nextSuggestion');
    });
  });

  describe('DALL-E Image Generation', () => {
    test('should generate image with correct parameters', async () => {
      const imagePrompt = mockGPTResponses.valid.imagePrompt;

      const response = await mockOpenAI.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt + " in anime art style, high quality anime illustration",
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toHaveProperty('url');
      expect(response.data[0].url).toMatch(/^https?:\/\//);
    });

    test('should request anime art style', async () => {
      await mockOpenAI.images.generate({
        model: "dall-e-3",
        prompt: "Test prompt in anime art style",
        size: "1024x1024"
      });

      verifyDALLECall(mockOpenAI, { model: 'dall-e-3' });
    });
  });

  describe('JSON Response Parsing', () => {
    test('should parse valid JSON response', () => {
      const jsonString = JSON.stringify(mockGPTResponses.valid);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(mockGPTResponses.valid);
    });

    test('should handle malformed JSON gracefully', () => {
      const malformedJSON = '{ "imagePrompt": "test", invalid }';

      expect(() => {
        JSON.parse(malformedJSON);
      }).toThrow();
    });

    test('should extract JSON from text with markdown', () => {
      const responseWithMarkdown = `Here's the scene data:\n\`\`\`json\n${JSON.stringify(mockGPTResponses.valid)}\n\`\`\``;

      const jsonMatch = responseWithMarkdown.match(/\{[\s\S]*\}/);
      expect(jsonMatch).toBeTruthy();

      const parsed = JSON.parse(jsonMatch[0]);
      expect(parsed).toHaveProperty('imagePrompt');
    });

    test('should validate required fields in response', () => {
      const response = mockGPTResponses.valid;

      expect(response).toHaveProperty('imagePrompt');
      expect(response).toHaveProperty('narrative');
      expect(response).toHaveProperty('nextSuggestion');

      expect(typeof response.imagePrompt).toBe('string');
      expect(typeof response.narrative).toBe('string');
      expect(typeof response.nextSuggestion).toBe('string');
    });
  });

  describe('Error Handling', () => {
    test('should handle GPT API errors', async () => {
      const failingMock = createMockOpenAI({ gptShouldFail: true });

      await expect(
        failingMock.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'test' }]
        })
      ).rejects.toThrow();
    });

    test('should handle DALL-E API errors', async () => {
      const failingMock = createMockOpenAI({ dalleShouldFail: true });

      await expect(
        failingMock.images.generate({
          model: 'dall-e-3',
          prompt: 'test'
        })
      ).rejects.toThrow();
    });

    test('should handle rate limiting', async () => {
      const flakeyMock = createFlakeyMockOpenAI(2);

      // First two calls should succeed
      await flakeyMock.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }]
      });
      await flakeyMock.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }]
      });

      // Third call should fail
      await expect(
        flakeyMock.chat.completions.create({
          messages: [{ role: 'user', content: 'test' }]
        })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Story Continuity', () => {
    test('should maintain story context across scenes', async () => {
      const scene1Prompt = mockUserPrompts.basic;
      const scene2Prompt = mockUserPrompts.continuation;

      // Generate first scene
      const response1 = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: scene1Prompt }
        ]
      });

      const scene1Data = JSON.parse(response1.choices[0].message.content);

      // Generate second scene with context
      const contextPrompt = `Previous story:\nScene 1: ${scene1Prompt}\nNarrative: ${scene1Data.narrative}\n\nCurrent scene: ${scene2Prompt}`;

      const response2 = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: contextPrompt }
        ]
      });

      const scene2Data = JSON.parse(response2.choices[0].message.content);

      // Both scenes should have valid structure
      expect(scene1Data).toHaveProperty('nextSuggestion');
      expect(scene2Data).toHaveProperty('narrative');
    });

    test('should handle long story histories', async () => {
      const longHistory = testScenarios.longHistory.storyHistory;

      const contextPrompt = longHistory.map((h, i) =>
        `Scene ${i + 1}: ${h.userPrompt}\nNarrative: ${h.narrative}`
      ).join('\n\n');

      expect(contextPrompt.length).toBeGreaterThan(100);

      // Should still be able to generate response with long context
      const response = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative anime story writer.' },
          { role: 'user', content: `Previous story:\n${contextPrompt}\n\nCurrent scene: Final battle` }
        ]
      });

      expect(response).toBeTruthy();
    });
  });
});

describe('Image Collection Creation', () => {
  let mockOpenAI;

  beforeEach(() => {
    mockOpenAI = createMockOpenAI();
  });

  describe('Collection Generation', () => {
    test('should create collection from story history', () => {
      // Arrange
      const storyHistory = mockStoryHistory;

      // Act
      const collection = createImageCollection(storyHistory);

      // Assert
      expect(collection).toHaveProperty('id');
      expect(collection).toHaveProperty('title');
      expect(collection).toHaveProperty('images');
      expect(collection.images).toHaveLength(storyHistory.length);
    });

    test('should include all image URLs in collection', () => {
      // Arrange
      const storyHistory = mockStoryHistory;

      // Act
      const collection = createImageCollection(storyHistory);

      // Assert
      expect(collection.images).toHaveLength(2);
      expect(collection.images[0]).toHaveProperty('url');
      expect(collection.images[0].url).toBe(mockStoryHistory[0].imageUrl);
      expect(collection.images[1].url).toBe(mockStoryHistory[1].imageUrl);
    });

    test('should include metadata for each image', () => {
      // Arrange
      const storyHistory = mockStoryHistory;

      // Act
      const collection = createImageCollection(storyHistory);

      // Assert
      collection.images.forEach((image, index) => {
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('prompt');
        expect(image).toHaveProperty('narrative');
        expect(image).toHaveProperty('sceneNumber');
        expect(image.sceneNumber).toBe(index + 1);
      });
    });

    test('should generate timestamp for collection', () => {
      // Arrange
      const storyHistory = mockStoryHistory;

      // Act
      const collection = createImageCollection(storyHistory);

      // Assert
      expect(collection).toHaveProperty('createdAt');
      expect(new Date(collection.createdAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('AI-Generated Collection Metadata', () => {
    test('should generate collection title using AI', async () => {
      // Arrange
      const storyHistory = mockStoryHistory;
      const expectedResponse = {
        title: "The Legend of the Ancient Blade",
        description: "A warrior's journey to master a magical sword and face ancient guardians",
        themes: ["adventure", "magic", "fantasy"]
      };

      const customMock = createMockOpenAI({
        customGPTResponse: expectedResponse
      });

      // Act
      const metadata = await generateCollectionMetadata(storyHistory, customMock);

      // Assert
      expect(metadata).toHaveProperty('title');
      expect(metadata.title).toBeTruthy();
      expect(typeof metadata.title).toBe('string');
    });

    test('should generate collection description from story narrative', async () => {
      // Arrange
      const storyHistory = mockStoryHistory;
      const expectedResponse = {
        title: "Epic Quest",
        description: "An epic tale of courage and discovery",
        themes: ["action", "adventure"]
      };

      const customMock = createMockOpenAI({
        customGPTResponse: expectedResponse
      });

      // Act
      const metadata = await generateCollectionMetadata(storyHistory, customMock);

      // Assert
      expect(metadata).toHaveProperty('description');
      expect(metadata.description.length).toBeGreaterThan(10);
    });

    test('should extract themes from story content', async () => {
      // Arrange
      const storyHistory = mockStoryHistory;
      const expectedResponse = {
        title: "Sword Quest",
        description: "A fantasy adventure",
        themes: ["fantasy", "adventure", "magic", "combat"]
      };

      const customMock = createMockOpenAI({
        customGPTResponse: expectedResponse
      });

      // Act
      const metadata = await generateCollectionMetadata(storyHistory, customMock);

      // Assert
      expect(metadata).toHaveProperty('themes');
      expect(Array.isArray(metadata.themes)).toBe(true);
      expect(metadata.themes.length).toBeGreaterThan(0);
    });

    test('should include scene count in metadata', async () => {
      // Arrange
      const storyHistory = mockStoryHistory;

      // Act
      const metadata = await generateCollectionMetadata(storyHistory, mockOpenAI);

      // Assert
      expect(metadata).toHaveProperty('sceneCount');
      expect(metadata.sceneCount).toBe(storyHistory.length);
    });
  });

  describe('Collection Validation', () => {
    test('should require at least one scene to create collection', () => {
      // Arrange
      const emptyHistory = [];

      // Act & Assert
      expect(() => createImageCollection(emptyHistory))
        .toThrow('Cannot create collection: No scenes available');
    });

    test('should handle single scene collection', () => {
      // Arrange
      const singleScene = [mockStoryHistory[0]];

      // Act
      const collection = createImageCollection(singleScene);

      // Assert
      expect(collection.images).toHaveLength(1);
      expect(collection.images[0].sceneNumber).toBe(1);
    });

    test('should handle large collections (10+ scenes)', () => {
      // Arrange
      const largeHistory = Array(15).fill(null).map((_, i) => ({
        ...mockStoryHistory[0],
        userPrompt: `Scene ${i + 1}`,
        imageUrl: `https://example.com/image${i + 1}.png`,
        timestamp: new Date(Date.now() - (15 - i) * 300000).toISOString()
      }));

      // Act
      const collection = createImageCollection(largeHistory);

      // Assert
      expect(collection.images).toHaveLength(15);
      expect(collection.images[0].sceneNumber).toBe(1);
      expect(collection.images[14].sceneNumber).toBe(15);
    });

    test('should validate all images have valid URLs', () => {
      // Arrange
      const storyHistory = mockStoryHistory;

      // Act
      const collection = createImageCollection(storyHistory);

      // Assert
      collection.images.forEach(image => {
        expect(image.url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Collection Export', () => {
    test('should format collection for download', () => {
      // Arrange
      const collection = {
        id: 'collection-123',
        title: 'My Anime Story',
        images: mockStoryHistory.map((scene, i) => ({
          url: scene.imageUrl,
          prompt: scene.userPrompt,
          narrative: scene.narrative,
          sceneNumber: i + 1
        })),
        createdAt: new Date().toISOString()
      };

      // Act
      const exportData = formatCollectionForExport(collection);

      // Assert
      expect(exportData).toHaveProperty('title');
      expect(exportData).toHaveProperty('images');
      expect(typeof exportData).toBe('object');
    });

    test('should include download metadata', () => {
      // Arrange
      const collection = createImageCollection(mockStoryHistory);

      // Act
      const exportData = formatCollectionForExport(collection);

      // Assert
      expect(exportData).toHaveProperty('exportedAt');
      expect(exportData).toHaveProperty('format');
      expect(exportData.format).toBe('json');
    });

    test('should generate unique collection ID', () => {
      // Arrange
      const history1 = [mockStoryHistory[0]];
      const history2 = [mockStoryHistory[1]];

      // Act
      const collection1 = createImageCollection(history1);
      const collection2 = createImageCollection(history2);

      // Assert
      expect(collection1.id).not.toBe(collection2.id);
      expect(collection1.id).toBeTruthy();
      expect(collection2.id).toBeTruthy();
    });
  });

  describe('AI-Enhanced Collection Features', () => {
    test('should suggest collection title based on story content', async () => {
      // Arrange
      const storyContext = mockStoryHistory.map(h => h.narrative).join(' ');
      const prompt = `Based on this story, suggest a compelling title: ${storyContext}`;

      // Act
      const response = await mockOpenAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative title generator.' },
          { role: 'user', content: prompt }
        ]
      });

      const data = JSON.parse(response.choices[0].message.content);

      // Assert
      expect(data).toBeTruthy();
      expect(typeof data).toBe('object');
    });

    test('should generate collection cover description', async () => {
      // Arrange
      const collection = createImageCollection(mockStoryHistory);

      // Act
      const coverPrompt = await generateCollectionCover(collection, mockOpenAI);

      // Assert
      expect(coverPrompt).toBeTruthy();
      expect(typeof coverPrompt).toBe('string');
      expect(coverPrompt.length).toBeGreaterThan(20);
    });

    test('should create story summary from all scenes', async () => {
      // Arrange
      const storyHistory = mockStoryHistory;

      const summaryResponse = {
        summary: "A warrior discovers an ancient magical sword and begins to unlock its true power while facing mysterious guardians.",
        keyMoments: [
          "Discovery of the magical blade",
          "First use of sword's power"
        ]
      };

      const customMock = createMockOpenAI({
        customGPTResponse: summaryResponse
      });

      // Act
      const summary = await generateStorySummary(storyHistory, customMock);

      // Assert
      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('keyMoments');
      expect(Array.isArray(summary.keyMoments)).toBe(true);
    });
  });

  describe('Collection Sharing', () => {
    test('should generate shareable link for collection', () => {
      // Arrange
      const collection = createImageCollection(mockStoryHistory);

      // Act
      const shareableLink = generateShareableLink(collection);

      // Assert
      expect(shareableLink).toMatch(/^https?:\/\//);
      expect(shareableLink).toContain(collection.id);
    });

    test('should create collection thumbnail from first image', () => {
      // Arrange
      const collection = createImageCollection(mockStoryHistory);

      // Act
      const thumbnail = getCollectionThumbnail(collection);

      // Assert
      expect(thumbnail).toBe(mockStoryHistory[0].imageUrl);
    });

    test('should format collection for social media sharing', () => {
      // Arrange
      const collection = {
        id: 'abc123',
        title: 'Epic Adventure',
        images: mockStoryHistory.map(s => ({ url: s.imageUrl })),
        createdAt: new Date().toISOString()
      };

      // Act
      const socialData = formatForSocialShare(collection);

      // Assert
      expect(socialData).toHaveProperty('title');
      expect(socialData).toHaveProperty('description');
      expect(socialData).toHaveProperty('imageUrl');
      expect(socialData).toHaveProperty('url');
    });
  });
});

// Mock functions (to be implemented)
function createImageCollection(storyHistory) {
  if (!storyHistory || storyHistory.length === 0) {
    throw new Error('Cannot create collection: No scenes available');
  }

  return {
    id: `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Untitled Collection',
    images: storyHistory.map((scene, index) => ({
      url: scene.imageUrl,
      prompt: scene.userPrompt,
      narrative: scene.narrative,
      sceneNumber: index + 1
    })),
    createdAt: new Date().toISOString()
  };
}

async function generateCollectionMetadata(storyHistory, openaiClient) {
  const client = openaiClient || mockOpenAI;
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a creative title generator.' },
      { role: 'user', content: 'Generate metadata' }
    ]
  });

  const data = JSON.parse(response.choices[0].message.content);
  return {
    ...data,
    sceneCount: storyHistory.length
  };
}

function formatCollectionForExport(collection) {
  return {
    ...collection,
    exportedAt: new Date().toISOString(),
    format: 'json'
  };
}

async function generateCollectionCover(collection, openaiClient) {
  return "Anime style collection cover showing epic journey";
}

async function generateStorySummary(storyHistory, openaiClient) {
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a story summarizer.' },
      { role: 'user', content: 'Summarize story' }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

function generateShareableLink(collection) {
  return `https://anime-story-generator.com/collection/${collection.id}`;
}

function getCollectionThumbnail(collection) {
  return collection.images[0]?.url || null;
}

function formatForSocialShare(collection) {
  return {
    title: collection.title,
    description: `Check out my anime story collection with ${collection.images.length} scenes!`,
    imageUrl: collection.images[0]?.url,
    url: generateShareableLink(collection)
  };
}

/**
 * ============================================================================
 * TEMPLATE FOR ADDING NEW AI BEHAVIOR TESTS
 * ============================================================================
 *
 * describe('Your AI Feature', () => {
 *   test('should perform expected behavior', async () => {
 *     // 1. Create mock OpenAI client
 *     const mockClient = createMockOpenAI({
 *       customGPTResponse: { your: 'custom response' }
 *     });
 *
 *     // 2. Call the AI function
 *     const response = await mockClient.chat.completions.create({
 *       model: 'gpt-4o',
 *       messages: [{ role: 'user', content: 'your prompt' }]
 *     });
 *
 *     // 3. Parse and verify response
 *     const data = JSON.parse(response.choices[0].message.content);
 *     expect(data).toHaveProperty('expectedField');
 *   });
 *
 *   test('should handle edge case', async () => {
 *     // Test edge cases like empty input, very long input, special characters
 *   });
 *
 *   test('should validate output format', () => {
 *     // Verify the AI response matches expected schema
 *   });
 * });
 *
 * ============================================================================
 * COMMON TEST PATTERNS
 * ============================================================================
 *
 * 1. Testing Response Structure:
 *    expect(response).toHaveProperty('field');
 *    expect(typeof response.field).toBe('string');
 *
 * 2. Testing String Content:
 *    expect(response.narrative).toMatch(/expected pattern/);
 *    expect(response.text.length).toBeGreaterThan(minLength);
 *
 * 3. Testing Arrays:
 *    expect(response.items).toHaveLength(expectedLength);
 *    expect(response.items).toContain(expectedItem);
 *
 * 4. Testing Error Scenarios:
 *    await expect(asyncFunction()).rejects.toThrow('Expected error');
 *
 * 5. Testing API Calls:
 *    verifyGPTCall(mockClient, { model: 'gpt-4o', temperature: 0.8 });
 *
 * 6. Testing with Custom Mocks:
 *    const customMock = createMockOpenAI({
 *      gptShouldFail: false,
 *      customGPTResponse: yourResponse
 *    });
 */
