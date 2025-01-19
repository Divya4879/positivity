const userRoleInput = document.getElementById('userRole');
const moodSelect = document.getElementById('mood');
const customMoodInput = document.getElementById('customMood');
const contentTypeSelect = document.getElementById('contentType');
const motivationTypeSelect = document.getElementById('motivationType');
const achievementInput = document.getElementById('achievementInput');
const generateBtn = document.getElementById('generateBtn');
const errorDiv = document.getElementById('error');
const generatedContentDiv = document.getElementById('generatedContent');
const themeToggle = document.getElementById('themeToggle');
const miscellaneousInput = document.getElementById('miscellaneousInput');

userRoleInput.addEventListener('input', updateButtonState);
moodSelect.addEventListener('change', updateButtonState);
contentTypeSelect.addEventListener('change', updateButtonState);
motivationTypeSelect.addEventListener('change', updateButtonState);
customMoodInput.addEventListener('input', updateButtonState);
generateBtn.addEventListener('click', generateContent);
themeToggle.addEventListener('click', toggleDarkMode);
moodSelect.addEventListener('change', toggleMiscellaneousInput);

function toggleMiscellaneousInput() {
    miscellaneousInput.style.display = moodSelect.value === 'miscellaneous' ? 'block' : 'none';
    updateButtonState();
}

function updateButtonState() {
    const isMiscellaneous = moodSelect.value === 'miscellaneous';
    const isCustomMoodFilled = customMoodInput.value.trim() !== '';
    generateBtn.disabled = !userRoleInput.value.trim() || !moodSelect.value || !contentTypeSelect.value || !motivationTypeSelect.value || (isMiscellaneous && !isCustomMoodFilled);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
}

async function generateContent() {
    const userRole = userRoleInput.value.trim();
    const mood = moodSelect.value === 'miscellaneous' ? customMoodInput.value : moodSelect.value;
    const contentType = contentTypeSelect.value;
    const motivationType = motivationTypeSelect.value;
    const achievement = achievementInput.value.trim();

    errorDiv.textContent = '';
    generatedContentDiv.style.display = 'block';
    generatedContentDiv.textContent = 'Generating content...';
    generateBtn.disabled = true;

    try {
        const response = await fetch('/.netlify/functions/generate-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userRole,
                mood,
                contentType,
                motivationType,
                achievement
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate content');
        }

        const data = await response.json();
        let content = data.content;

        // Process the content based on the content type
        if (contentType === 'story' || contentType === 'poem') {
            const titleMatch = content.match(/<h3>(.*?)<\/h3>/);
            if (titleMatch) {
                const title = titleMatch[1];
                content = content.replace(/<h3>.*?<\/h3>/, '').trim();
                generatedContentDiv.innerHTML = `<h3>${title}</h3>${content}`;
            } else {
                generatedContentDiv.textContent = content;
            }
        } else if (contentType === 'riddle') {
            // Split the content into riddle, answer, and lesson
            const parts = content.split('\n').map(part => part.trim()).filter(part => part);
            if (parts.length >= 3) {
                generatedContentDiv.innerHTML = `
                    <p><strong>Riddle:</strong> ${parts[0]}</p>
                    <p><strong>Answer:</strong> ${parts[1]}</p>
                    <p><strong>Lesson:</strong> ${parts[2]}</p>
                `;
            } else {
                generatedContentDiv.textContent = content;
            }
        } else {
            generatedContentDiv.textContent = content;
        }
    } catch (error) {
        errorDiv.textContent = 'Error generating content. Please try again later.';
        generatedContentDiv.style.display = 'none';
        console.error(error);
    } finally {
        generateBtn.disabled = false;
    }
}

