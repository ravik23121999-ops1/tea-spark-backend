const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const WeatherService = require('../utils/weatherService');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tea menu context for the AI
const teaMenuContext = `You are Tea Spark's Tea Sommelier, a friendly tea expert. 
Your job is to recommend teas from the Tea Spark menu based on the customer's mood, taste preferences, or current weather. 
Always use the following menu items and their attributes:

- Masala Chai: spicy, warming, energizing, best for cold weather or with snacks
- Green Tea: refreshing, energizing, best for tired mood or hot weather
- Ginger Tea: spicy, comforting, best for rainy or cold days
- Iced Lemon Tea: cooling, refreshing, best for summer or hot weather
- Herbal Chamomile Tea: calming, soothing, best for stress or bedtime

Rules:
- If the user mentions mood (e.g., tired, stressed), match to teas with the right attributes.
- If the user mentions taste (e.g., spicy, sweet), match to teas with that flavor.
- If weather data is provided, include it in your recommendation.
- Respond in a warm, conversational style, and suggest one or two teas maximum.
- End your response with: "Would you like me to add this to your cart?"
- Keep responses concise and friendly (under 100 words)`;

// Chat endpoint
router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory = [], location } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get weather data
    const weatherData = await WeatherService.getWeatherData(location);
    
    // Try OpenAI first, fallback to rule-based system
    try {
      const weatherContext = WeatherService.getWeatherContext(weatherData);

      // Enhanced system prompt with weather context
      const enhancedContext = `${teaMenuContext}

${weatherContext}

When making recommendations, consider the current weather conditions. If it's hot, prioritize cooling teas. If it's cold, prioritize warming teas.`;

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: enhancedContext },
        ...conversationHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user', content: message }
      ];

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 150,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content;

      // Extract recommended teas from response (for cart functionality)
      const recommendedTeas = extractRecommendedTeas(aiResponse);

      return res.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        weather: weatherData,
        recommendedTeas,
        showAddToCart: recommendedTeas.length > 0
      });

    } catch (openaiError) {
      console.log('OpenAI API unavailable, using fallback:', openaiError.message);
      
      // Fallback to rule-based recommendations
      const fallbackResponse = generateFallbackResponse(message, weatherData);
      const recommendedTeas = extractRecommendedTeas(fallbackResponse);

      return res.json({
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        weather: weatherData,
        recommendedTeas,
        showAddToCart: recommendedTeas.length > 0,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message 
    });
  }
});

// Fallback rule-based recommendation system
function generateFallbackResponse(message, weatherData) {
  const lowerMessage = message.toLowerCase();
  let recommendedTeas = [];
  let response = '';

  // Mood-based recommendations
  if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
    recommendedTeas.push('Green Tea');
    if (weatherData.isHot) {
      recommendedTeas.push('Iced Lemon Tea');
    } else {
      recommendedTeas.push('Masala Chai');
    }
    response = "Since you're feeling tired";
  } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
    recommendedTeas.push('Herbal Chamomile Tea');
    response = "For stress relief";
  } else if (lowerMessage.includes('cold') || lowerMessage.includes('chilly')) {
    recommendedTeas.push('Ginger Tea');
    recommendedTeas.push('Masala Chai');
    response = "To warm you up";
  } else if (lowerMessage.includes('hot') || lowerMessage.includes('warm')) {
    recommendedTeas.push('Iced Lemon Tea');
    recommendedTeas.push('Green Tea');
    response = "To cool you down";
  } else {
    // Weather-based default recommendations
    if (weatherData.isHot) {
      recommendedTeas.push('Iced Lemon Tea', 'Green Tea');
      response = "Since it's hot outside";
    } else if (weatherData.isCold) {
      recommendedTeas.push('Masala Chai', 'Ginger Tea');
      response = "Since it's cold outside";
    } else if (weatherData.isRainy) {
      recommendedTeas.push('Ginger Tea', 'Herbal Chamomile Tea');
      response = "Perfect for this rainy weather";
    } else {
      recommendedTeas.push('Green Tea');
      response = "For a refreshing boost";
    }
  }

  // Limit to 2 teas maximum
  recommendedTeas = recommendedTeas.slice(0, 2);

  // Build response
  if (recommendedTeas.length === 1) {
    response += `, I recommend our ${recommendedTeas[0]}.`;
  } else {
    response += `, I recommend our ${recommendedTeas[0]} or ${recommendedTeas[1]}.`;
  }
  
  response += " Would you like me to add this to your cart?";

  return response;
}

// Helper function to extract tea names from AI response
function extractRecommendedTeas(response) {
  const teaMenu = ['Masala Chai', 'Green Tea', 'Ginger Tea', 'Iced Lemon Tea', 'Herbal Chamomile Tea'];
  const recommended = [];
  
  teaMenu.forEach(tea => {
    if (response.toLowerCase().includes(tea.toLowerCase())) {
      recommended.push(tea);
    }
  });
  
  return recommended;
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'Chat service is running' });
});

module.exports = router;
