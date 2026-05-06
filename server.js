require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store story history (in production, use a database)
const storyHistory = new Map();

// Generate anime scene with story continuation
app.post('/api/generate-scene', async (req, res) => {
  try {
    const { userPrompt, storyHistory: history = [] } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: 'User prompt is required' });
    }

    console.log('Generating scene for:', userPrompt);

    // Step 1: Use GPT to create an optimized anime image prompt and story context
    const storyContext = history.map((h, i) =>
      `Scene ${i + 1}: ${h.userPrompt}\nNarrative: ${h.narrative}`
    ).join('\n\n');

    const gptPrompt = `You are an anime story creator specializing in vintage Japanese anime aesthetics. Based on the user's idea and story history, create:
1. A detailed DALL-E prompt for generating a VINTAGE JAPANESE ANIME style image. The image should have:
   - 1970s-1990s classic anime aesthetics
   - Hand-drawn cell animation look
   - Soft vintage colors and film grain
   - Traditional Japanese art influences
   - Retro anime character designs with big expressive eyes
   - Classic anime composition and framing
2. A brief narrative description (2-3 sentences) of this scene that fits the vintage anime storytelling style
3. A compelling suggestion for the next scene in the story

${storyContext ? `Previous story:\n${storyContext}\n\n` : ''}Current scene idea: ${userPrompt}

Respond in JSON format only, no other text:
{
  "imagePrompt": "detailed prompt for DALL-E optimized for vintage Japanese anime style from 1970s-1990s era",
  "narrative": "brief narrative of this scene",
  "nextSuggestion": "suggestion for what happens next in the story"
}`;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o', // You can also use 'gpt-3.5-turbo' for lower cost
      messages: [{
        role: 'system',
        content: 'You are a creative vintage Japanese anime story writer specializing in classic 1970s-1990s anime aesthetics and storytelling. Always respond with valid JSON only. Create image prompts that emphasize retro anime art style with hand-drawn cell animation quality.'
      }, {
        role: 'user',
        content: gptPrompt
      }],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 800
    });

    // Parse GPT's response
    const responseText = gptResponse.choices[0].message.content;
    let storyData;

    try {
      storyData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', responseText);
      return res.status(500).json({ error: 'Failed to parse story data' });
    }

    // Step 2: Generate image with DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: storyData.imagePrompt + " | Vintage Japanese anime style from 1970s-1990s era, classic hand-drawn cell animation aesthetic, retro anime art, soft vintage colors, film grain texture, traditional Japanese animation quality, nostalgic anime look",
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    const imageUrl = imageResponse.data[0].url;

    // Return complete scene data
    res.json({
      success: true,
      scene: {
        userPrompt,
        imagePrompt: storyData.imagePrompt,
        imageUrl,
        narrative: storyData.narrative,
        nextSuggestion: storyData.nextSuggestion,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating scene:', error);
    res.status(500).json({
      error: 'Failed to generate scene',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Anime Story Generator API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API Keys configured:', {
    openai: !!process.env.OPENAI_API_KEY
  });
});
