# Anime Story Generator

An interactive web application that uses AI to help you create anime story series in **vintage Japanese anime style** (1970s-1990s). Users provide scene ideas, and the AI generates classic retro anime images with hand-drawn aesthetics and suggests story continuations, creating an evolving narrative series.

## Features

- **Vintage Anime Style**: All images generated in classic 1970s-1990s Japanese anime aesthetic
- **Hand-Drawn Look**: Cell animation style with soft vintage colors and film grain
- **AI-Powered Image Generation**: Creates retro anime images using DALL-E 3
- **Intelligent Story Continuation**: GPT-4 suggests what happens next in your story
- **Interactive Timeline**: Visual timeline of all generated scenes
- **Real-time Generation**: Watch your story unfold scene by scene
- **Collaborative Creation**: Accept AI suggestions or provide your own ideas

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **AI Services**:
  - OpenAI GPT-4 (story generation & prompts)
  - OpenAI DALL-E 3 (image generation)

## Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd lab5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your API key**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

## Usage

1. **Start the server**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

3. **Create your story**
   - Enter a scene description (e.g., "A young warrior discovers a magical sword")
   - Click "Generate Scene"
   - Wait for the AI to create the image and narrative
   - Review GPT-4's suggestion for the next scene
   - Accept the suggestion or write your own
   - Continue building your anime series!

## Testing

This project follows **Test-Driven Development (TDD)** practices.

### Running Tests

```bash
# Unit Tests (Mock - Fast, Free) - DEFAULT
npm test                    # Run all tests once
npm run test:watch          # Watch mode (auto-rerun on changes)
npm run test:coverage       # With coverage report
npm run test:unit           # Only unit tests with mocks

# Integration Tests (Real API - Slow, Costs Money) - OPTIONAL
npm run test:integration    # Test with REAL OpenAI API (~$0.10 per run)
npm run test:all            # Run both unit and integration tests
```

### Test Types

**Unit Tests (Mock)** - Recommended for daily development
- ⚡ Fast (~1 second)
- 💚 Free (no API costs)
- ✅ No API keys required
- Perfect for TDD workflow

**Integration Tests (Real API)** - Use before deployment
- 🐌 Slower (~30-90 seconds)
- 💰 Costs money (~$0.10 per run)
- 🔑 Requires OPENAI_API_KEY in .env
- Validates actual API behavior


### Test Structure

```
__tests__/
├── helpers/
│   ├── mockData.js                # Sample test data
│   └── mockOpenAI.js              # Mock AI client
├── ai-behavior.test.js            # AI tests (with mocks)
├── ai-behavior-real-api.test.js   # AI tests (with real API)
├── api.test.js                    # API endpoint tests
└── template.test.js               # Template for new tests
```

### Writing Tests

We provide comprehensive test templates and guides:

- **TEST_GUIDE.md**: Detailed testing documentation with examples
- **TDD_WORKFLOW.md**: Step-by-step TDD workflow guide
- **template.test.js**: Copy this to create new test files

Quick example:

```javascript
const { createMockOpenAI } = require('./helpers/mockOpenAI');

test('should generate anime story', async () => {
  const mockClient = createMockOpenAI();

  const response = await mockClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'A warrior finds a sword' }]
  });

  const data = JSON.parse(response.choices[0].message.content);
  expect(data).toHaveProperty('narrative');
});
```



## How It Works

1. **User Input**: You describe what happens in the scene
2. **GPT-4 Processing**: GPT-4 analyzes the story context and creates:
   - An optimized prompt for DALL-E in vintage anime style
   - A narrative description of the scene
   - A suggestion for the next scene
3. **Image Generation**: DALL-E 3 generates a vintage Japanese anime-style image (1970s-1990s aesthetic)
4. **Display**: The scene is displayed with the narrative
5. **Continuation**: GPT-4 suggests the next plot point
6. **Repeat**: Continue the cycle to build your series

## Vintage Anime Style

All images are generated in **classic 1970s-1990s Japanese anime style** featuring:

### Visual Characteristics
- 📺 Hand-drawn cell animation aesthetic
- 🎨 Soft vintage colors with warm tones
- 🎞️ Film grain and nostalgic quality
- 👁️ Retro character designs with big expressive eyes
- 🖼️ Classic anime composition and framing
- 🇯🇵 Traditional Japanese animation influences

### Inspired By Classic Anime
- Mobile Suit Gundam (1979)
- Akira (1988)
- Dragon Ball (1986)
- Cowboy Bebop (1998)
- Sailor Moon (1992)
- Neon Genesis Evangelion (1995)

### Technical Implementation
The system ensures vintage style through:
1. **GPT-4 Prompt Engineering**: Instructs AI to create prompts emphasizing 1970s-1990s aesthetics
2. **DALL-E Style Enhancement**: Appends specific vintage anime keywords to all image generations
3. **Consistent Aesthetics**: All scenes maintain the same retro quality

## API Endpoints

### `POST /api/generate-scene`
Generate a new anime scene with image and story continuation.

**Request Body:**
```json
{
  "userPrompt": "Scene description",
  "storyHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "scene": {
    "userPrompt": "...",
    "imagePrompt": "...",
    "imageUrl": "...",
    "narrative": "...",
    "nextSuggestion": "...",
    "timestamp": "..."
  }
}
```

### `GET /api/health`
Check server status.

## Project Structure

```
lab5/
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── public/             # Frontend files
    ├── index.html      # Main HTML page
    ├── style.css       # Styles
    └── app.js          # Frontend JavaScript
```

## Cost Considerations

- **DALL-E 3**: ~$0.040 per image (1024x1024, standard quality)
- **GPT-4o**: ~$0.005 per request (varies by token usage)

Estimated cost per scene: ~$0.045

Note: You can switch to `gpt-3.5-turbo` in server.js for lower costs (~$0.001 per request)

## Troubleshooting

**Server won't start:**
- Check that your `.env` file exists and has valid API keys
- Ensure port 3000 is not already in use

**Images not generating:**
- Verify your OpenAI API key has DALL-E 3 access
- Check the server console for error messages

**Story suggestions not appearing:**
- Verify your OpenAI API key is valid and has GPT-4 access
- Check browser console for errors

## Future Enhancements

- [ ] Save stories to database
- [ ] Export story series as PDF or image gallery
- [ ] Multiple art style options
- [ ] Character consistency across scenes
- [ ] Branching story paths
- [ ] Share stories with others

## License

MIT

## Credits

Powered by:
- [OpenAI GPT-4](https://openai.com/gpt-4)
- [OpenAI DALL-E 3](https://openai.com/dall-e-3)
