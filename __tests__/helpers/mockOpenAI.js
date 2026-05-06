/**
 * Mock OpenAI API Client
 * This file provides mock functions for OpenAI API calls during testing
 */

const { mockGPTResponses, mockDALLEResponses } = require('./mockData');

/**
 * Creates a mock OpenAI client
 * @param {Object} options - Configuration options
 * @returns {Object} Mock OpenAI client
 */
function createMockOpenAI(options = {}) {
  const {
    gptShouldFail = false,
    dalleShouldFail = false,
    customGPTResponse = null,
    customDALLEResponse = null
  } = options;

  return {
    chat: {
      completions: {
        create: jest.fn(async (params) => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 10));

          if (gptShouldFail) {
            throw new Error('GPT API Error: Rate limit exceeded');
          }

          // Determine which response to use based on prompt
          const prompt = params.messages[1].content;
          let response = customGPTResponse || mockGPTResponses.valid;

          // If prompt mentions continuation, use continuation response
          if (prompt.includes('Previous story:')) {
            response = mockGPTResponses.continuation;
          }

          return {
            choices: [{
              message: {
                content: JSON.stringify(response)
              }
            }]
          };
        })
      }
    },
    images: {
      generate: jest.fn(async (params) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 10));

        if (dalleShouldFail) {
          throw new Error('DALL-E API Error: Content policy violation');
        }

        return customDALLEResponse || mockDALLEResponses.success;
      })
    }
  };
}

/**
 * Creates a mock that fails after N successful calls
 * Useful for testing rate limiting and retry logic
 */
function createFlakeyMockOpenAI(failAfter = 2) {
  let callCount = 0;

  return {
    chat: {
      completions: {
        create: jest.fn(async () => {
          callCount++;
          if (callCount > failAfter) {
            throw new Error('Rate limit exceeded');
          }
          return {
            choices: [{
              message: {
                content: JSON.stringify(mockGPTResponses.valid)
              }
            }]
          };
        })
      }
    },
    images: {
      generate: jest.fn(async () => {
        return mockDALLEResponses.success;
      })
    }
  };
}

/**
 * Verifies OpenAI API was called with correct parameters
 */
const verifyGPTCall = (mockClient, expectedParams = {}) => {
  expect(mockClient.chat.completions.create).toHaveBeenCalled();

  if (Object.keys(expectedParams).length > 0) {
    const callArgs = mockClient.chat.completions.create.mock.calls[0][0];

    if (expectedParams.model) {
      expect(callArgs.model).toBe(expectedParams.model);
    }

    if (expectedParams.temperature) {
      expect(callArgs.temperature).toBe(expectedParams.temperature);
    }

    if (expectedParams.responseFormat) {
      expect(callArgs.response_format).toBeDefined();
    }
  }
};

const verifyDALLECall = (mockClient, expectedParams = {}) => {
  expect(mockClient.images.generate).toHaveBeenCalled();

  if (Object.keys(expectedParams).length > 0) {
    const callArgs = mockClient.images.generate.mock.calls[0][0];

    if (expectedParams.model) {
      expect(callArgs.model).toBe(expectedParams.model);
    }

    if (expectedParams.size) {
      expect(callArgs.size).toBe(expectedParams.size);
    }
  }
};

module.exports = {
  createMockOpenAI,
  createFlakeyMockOpenAI,
  verifyGPTCall,
  verifyDALLECall
};
