// Story state management
let storyHistory = [];
let currentSuggestion = null;

// DOM elements
const userPromptInput = document.getElementById('userPrompt');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const suggestionBox = document.getElementById('suggestionBox');
const suggestionText = document.getElementById('suggestionText');
const useSuggestionBtn = document.getElementById('useSuggestion');
const currentSceneSection = document.getElementById('currentScene');
const currentImage = document.getElementById('currentImage');
const currentTitle = document.getElementById('currentTitle');
const currentNarrative = document.getElementById('currentNarrative');
const storyTimeline = document.getElementById('storyTimeline');
const timelineContent = document.getElementById('timelineContent');
const sceneCount = document.getElementById('sceneCount');

// Event listeners
generateBtn.addEventListener('click', generateScene);
clearBtn.addEventListener('click', clearStory);
useSuggestionBtn.addEventListener('click', () => {
    userPromptInput.value = currentSuggestion;
    suggestionBox.classList.add('hidden');
});

// Allow Enter to submit (Shift+Enter for new line)
userPromptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateScene();
    }
});

// Main function to generate a scene
async function generateScene() {
    const userPrompt = userPromptInput.value.trim();

    if (!userPrompt) {
        alert('Please enter a scene description!');
        return;
    }

    // Disable button and show loading state
    setLoadingState(true);

    try {
        const response = await fetch('/api/generate-scene', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userPrompt,
                storyHistory
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate scene');
        }

        const data = await response.json();

        if (data.success) {
            // Add to story history
            storyHistory.push(data.scene);

            // Display current scene
            displayCurrentScene(data.scene);

            // Update timeline
            updateTimeline();

            // Show next suggestion
            if (data.scene.nextSuggestion) {
                currentSuggestion = data.scene.nextSuggestion;
                suggestionText.textContent = data.scene.nextSuggestion;
                suggestionBox.classList.remove('hidden');
            }

            // Clear input
            userPromptInput.value = '';

            // Scroll to current scene
            currentSceneSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } else {
            throw new Error(data.error || 'Unknown error');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate scene. Please check your API keys and try again.\n\nError: ' + error.message);
    } finally {
        setLoadingState(false);
    }
}

// Display the current scene
function displayCurrentScene(scene) {
    currentImage.src = scene.imageUrl;
    currentImage.alt = scene.userPrompt;
    currentTitle.textContent = scene.userPrompt;
    currentNarrative.textContent = scene.narrative;
    currentSceneSection.classList.remove('hidden');
}

// Update the timeline with all scenes
function updateTimeline() {
    if (storyHistory.length === 0) {
        storyTimeline.classList.add('hidden');
        return;
    }

    storyTimeline.classList.remove('hidden');
    sceneCount.textContent = storyHistory.length;

    // Reverse to show newest first
    const reversedHistory = [...storyHistory].reverse();

    timelineContent.innerHTML = reversedHistory.map((scene, index) => {
        const sceneNumber = storyHistory.length - index;
        return `
            <div class="timeline-item">
                <span class="scene-number">Scene ${sceneNumber}</span>
                <img src="${scene.imageUrl}" alt="${scene.userPrompt}" loading="lazy">
                <h4>${scene.userPrompt}</h4>
                <p>${scene.narrative}</p>
            </div>
        `;
    }).join('');
}

// Clear the entire story
function clearStory() {
    if (storyHistory.length === 0) {
        return;
    }

    if (confirm('Are you sure you want to clear the entire story? This cannot be undone.')) {
        storyHistory = [];
        currentSuggestion = null;
        userPromptInput.value = '';
        currentSceneSection.classList.add('hidden');
        storyTimeline.classList.add('hidden');
        suggestionBox.classList.add('hidden');
    }
}

// Set loading state
function setLoadingState(isLoading) {
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');

    if (isLoading) {
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        generateBtn.disabled = true;
        userPromptInput.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        generateBtn.disabled = false;
        userPromptInput.disabled = false;
    }
}

// Check server health on load
async function checkHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('Server status:', data);
    } catch (error) {
        console.error('Server connection failed:', error);
        alert('Cannot connect to server. Please make sure the server is running.');
    }
}

// Initialize
checkHealth();
