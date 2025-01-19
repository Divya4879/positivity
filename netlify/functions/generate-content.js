const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { userRole, mood, contentType, motivationType, achievement } = JSON.parse(event.body);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `You are a globally renowned motivational speaker who creates ${motivationType} content. Generate only a single ${contentType} for a ${userRole} feeling ${mood}. ${achievement ? `Incorporate their achievement: ${achievement}.` : ''} Aim to uplift their mood and motivate them. Ensure the content is beautiful, memorable, attractive, and powerful. Adjust length based on content type:
              - Story: 250-1200 words
              - Poem: 50-200 words
              - Quote: 1-2 lines
              - Anecdote: 15-40 words
              - Dialogue: 40-100 words
              - Wishes: 30-50 words
              - Affirmation: 1-2 lines
              - Riddle: 20-50 words (including the answer and lesson)
              For stories and poems, include a creative title as an <h3> tag. For quotes, use English only. For riddles, provide the riddle, answer, and a brief motivational lesson. Focus on positivity, productivity, and happiness. Use the specified tone and create varied content each time. Do not include any additional text, explanations, or tags unless specified.`
          },
          {
            role: 'user',
            content: `Generate a ${motivationType} ${contentType} for a ${userRole} feeling ${mood}. ${achievement ? `Include their achievement: ${achievement}.` : ''}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ content })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate content' })
    };
  }
};

