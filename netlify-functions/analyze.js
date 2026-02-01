const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { imageData, industry } = JSON.parse(event.body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageData
              }
            },
            {
              type: "text",
              text: `You are a professional photography expert analyzing headshots for the ${industry} industry. Analyze this headshot and provide feedback in the following JSON format (respond ONLY with valid JSON, no other text):

{
  "score": <number 0-100>,
  "verdict": "<excellent|good|needs-improvement>",
  "strengths": [
    {"title": "Short strength title", "description": "Brief explanation"},
    ...2-4 strengths
  ],
  "improvements": [
    {"title": "Short improvement title", "description": "Specific actionable advice"},
    ...2-4 improvements
  ],
  "recommendations": [
    {"title": "Short recommendation", "description": "Professional advice"},
    ...2-3 recommendations
  ],
  "needsNewHeadshot": <true|false>,
  "ctaMessage": "Personalized message about whether they should book a session"
}

Evaluate based on:
- Lighting quality and professionalism
- Background appropriateness for ${industry}
- Composition and framing
- Expression and approachability
- Technical quality (focus, resolution)
- Clothing/attire appropriateness for ${industry}
- Overall professional impression for ${industry}

Be honest but constructive. If it's a good headshot, say so. If it needs work, be specific about what to improve.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Analysis failed', details: error.message })
    };
  }
};
