/**
 * Real API Integration Tests
 *
 * These tests make ACTUAL calls to OpenAI API
 *
 * ⚠️ WARNING:
 * - These tests cost real money (API usage)
 * - These tests are slower (~10-30 seconds)
 * - Requires valid OPENAI_API_KEY in .env
 *
 * Run with: npm run test:integration
 * Or: npm test -- ai-behavior-real-api.test.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { describe, test, expect, beforeAll } = require('@jest/globals');
const OpenAI = require('openai');

// Check if we should skip these tests
const SKIP_INTEGRATION_TESTS = !process.env.OPENAI_API_KEY || process.env.SKIP_INTEGRATION_TESTS === 'true';
//const SKIP_INTEGRATION_TESTS = false;
const describeOrSkip = SKIP_INTEGRATION_TESTS ? describe.skip : describe;

describeOrSkip('Real API Integration Tests', () => {
  let openai;

  beforeAll(() => {
    // Initialize real OpenAI client
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n⚠️  Running REAL API tests - this will cost money!\n');
  });

  describe('GPT-4 Real API', () => {
    test('should generate valid story data with real GPT-4', async () => {
      // Arrange
      const userPrompt = "A young warrior discovers a magical sword in an ancient temple";

      // Act
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a creative vintage Japanese anime story writer specializing in classic 1970s-1990s anime aesthetics and storytelling. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: `You are an anime story creator. Create:
1. A detailed DALL-E prompt for generating a vintage Japanese anime image
2. A brief narrative description (2-3 sentences)
3. A suggestion for the next scene

Scene idea: ${userPrompt}

Respond in JSON format only:
{
  "imagePrompt": "detailed prompt for DALL-E",
  "narrative": "brief narrative",
  "nextSuggestion": "next scene suggestion"
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 800
      });

      // Assert
      expect(response.choices).toHaveLength(1);
      expect(response.choices[0].message).toHaveProperty('content');

      const data = JSON.parse(response.choices[0].message.content);

      console.log('\n📝 GPT-4 Response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('imagePrompt');
      expect(data).toHaveProperty('narrative');
      expect(data).toHaveProperty('nextSuggestion');

      expect(typeof data.imagePrompt).toBe('string');
      expect(typeof data.narrative).toBe('string');
      expect(typeof data.nextSuggestion).toBe('string');

      expect(data.imagePrompt.length).toBeGreaterThan(20);
      expect(data.narrative.length).toBeGreaterThan(10);
      expect(data.nextSuggestion.length).toBeGreaterThan(10);
    }, 30000); // 30 second timeout

    test('should include vintage anime style in generated prompts', async () => {
      // Arrange
      const userPrompt = "A cyberpunk hacker in a neon city";

      // Act
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a creative vintage Japanese anime story writer specializing in classic 1970s-1990s anime aesthetics. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: `Create a DALL-E prompt for: ${userPrompt}. Must include vintage 1970s-1990s anime style elements.

Respond in JSON format:
{
  "imagePrompt": "detailed vintage anime style prompt"
}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const data = JSON.parse(response.choices[0].message.content);

      console.log('\n🎨 Image Prompt:', data.imagePrompt);

      // Assert - Check for vintage anime keywords
      const prompt = data.imagePrompt.toLowerCase();
      const vintageKeywords = ['vintage', 'retro', '1970', '1980', '1990', 'classic', 'cell animation', 'hand-drawn'];

      const hasVintageKeyword = vintageKeywords.some(keyword => prompt.includes(keyword));
      expect(hasVintageKeyword).toBe(true);
    }, 30000);

    test('should generate coherent story continuation', async () => {
      // Arrange
      const scene1 = "A warrior finds a magical sword";
      const scene2 = "The warrior begins training with the sword";

      // Act
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a creative anime story writer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: `Previous story:
Scene 1: ${scene1}
Scene 2: ${scene2}

Create the next scene. Respond in JSON:
{
  "narrative": "what happens next",
  "nextSuggestion": "following scene idea"
}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const data = JSON.parse(response.choices[0].message.content);

      console.log('\n📖 Story Continuation:', data.narrative);

      // Assert - Story should be coherent
      expect(data.narrative).toBeTruthy();
      expect(data.nextSuggestion).toBeTruthy();

      // Should relate to previous scenes (mention sword or warrior)
      const narrative = data.narrative.toLowerCase();
      const isCoherent = narrative.includes('sword') ||
                         narrative.includes('warrior') ||
                         narrative.includes('training') ||
                         narrative.includes('power');

      expect(isCoherent).toBe(true);
    }, 30000);
  });

  describe('DALL-E 3 Real API', () => {
    test('should generate real anime image with DALL-E 3', async () => {
      // Arrange
      const imagePrompt = "A young anime warrior with determined eyes, holding a glowing magical katana, standing in an ancient temple with dramatic lighting";

      // Act
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt + " | Vintage Japanese anime style from 1970s-1990s era, classic hand-drawn cell animation aesthetic, retro anime art, soft vintage colors, film grain texture",
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      // Assert
      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toHaveProperty('url');
      expect(response.data[0].url).toMatch(/^https?:\/\//);

      console.log('\n🖼️  Generated Image URL:', response.data[0].url);
      console.log('📝 Revised Prompt:', response.data[0].revised_prompt);

      // URL should be accessible
      expect(response.data[0].url).toBeTruthy();
    }, 60000); // 60 second timeout for image generation
  });

  describe('Full End-to-End Workflow', () => {
    test('should complete full scene generation workflow', async () => {
      // Arrange
      const userPrompt = "A mecha pilot enters their robot for the first time";

      console.log('\n🚀 Starting full workflow test...');

      // Step 1: Generate story with GPT-4
      console.log('📝 Step 1: Generating story with GPT-4...');
      const storyResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a creative vintage Japanese anime story writer specializing in classic 1970s-1990s anime aesthetics and storytelling. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: `Create an anime scene for: ${userPrompt}

Respond in JSON format:
{
  "imagePrompt": "detailed prompt for DALL-E optimized for vintage anime style",
  "narrative": "brief narrative of this scene",
  "nextSuggestion": "suggestion for what happens next"
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 800
      });

      const storyData = JSON.parse(storyResponse.choices[0].message.content);

      console.log('✅ Story generated:', {
        imagePrompt: storyData.imagePrompt.substring(0, 50) + '...',
        narrative: storyData.narrative.substring(0, 50) + '...',
        nextSuggestion: storyData.nextSuggestion.substring(0, 50) + '...'
      });

      // Assert story data
      expect(storyData).toHaveProperty('imagePrompt');
      expect(storyData).toHaveProperty('narrative');
      expect(storyData).toHaveProperty('nextSuggestion');

      // Step 2: Generate image with DALL-E
      console.log('🎨 Step 2: Generating image with DALL-E...');
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: storyData.imagePrompt + " | Vintage Japanese anime style from 1970s-1990s era, classic hand-drawn cell animation aesthetic",
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      console.log('✅ Image generated:', imageResponse.data[0].url);

      // Assert image generation
      expect(imageResponse.data[0]).toHaveProperty('url');
      expect(imageResponse.data[0].url).toMatch(/^https?:\/\//);

      // Complete workflow validation
      const completeScene = {
        userPrompt,
        imagePrompt: storyData.imagePrompt,
        imageUrl: imageResponse.data[0].url,
        narrative: storyData.narrative,
        nextSuggestion: storyData.nextSuggestion,
        timestamp: new Date().toISOString()
      };

      console.log('\n✅ Complete scene generated successfully!');
      console.log(JSON.stringify(completeScene, null, 2));

      // Final assertions
      expect(completeScene.userPrompt).toBe(userPrompt);
      expect(completeScene.imageUrl).toBeTruthy();
      expect(completeScene.narrative).toBeTruthy();
      expect(completeScene.nextSuggestion).toBeTruthy();

    }, 90000); // 90 second timeout for full workflow
  });

  describe('Error Handling with Real API', () => {
    test('should handle invalid model name', async () => {
      await expect(
        openai.chat.completions.create({
          model: 'invalid-model-name',
          messages: [{ role: 'user', content: 'test' }]
        })
      ).rejects.toThrow();
    });

    test('should handle empty prompt', async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello' }
        ]
      });

      // Should still return a response
      expect(response.choices[0].message.content).toBeTruthy();
    });
  });
});

// Instructions for running these tests
if (SKIP_INTEGRATION_TESTS) {
  console.log('\n⚠️  Integration tests skipped');
  console.log('To run these tests:');
  console.log('1. Set OPENAI_API_KEY in your .env file');
  console.log('2. Run: npm run test:integration');
  console.log('3. Or: SKIP_INTEGRATION_TESTS=false npm test -- ai-behavior-real-api.test.js\n');
}
