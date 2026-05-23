# Weather API Setup for Tea Spark Chat

## Overview
The chat system now integrates weather data to provide more accurate tea recommendations based on current conditions.

## Setup Instructions

### 1. Get OpenWeatherMap API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Update Environment Variables
Add your OpenWeatherMap API key to the `.env` file:

```bash
# Existing variables...
OPENAI_API_KEY=your_openai_api_key_here
WEATHER_API_KEY=your_openweathermap_api_key_here
```

### 3. Restart Backend Server
```bash
npm run dev
```

## How It Works

### Weather Integration Flow
1. **User sends message** → Backend receives message
2. **Weather fetch** → API calls OpenWeatherMap for current weather
3. **Enhanced prompt** → AI receives weather context + user message
4. **Smart recommendations** → AI suggests teas based on weather conditions

### Weather Logic
- **Hot weather (>25°C)**: Prioritizes cooling teas (Iced Lemon Tea, Green Tea)
- **Cold weather (<15°C)**: Prioritizes warming teas (Masala Chai, Ginger Tea)
- **Rainy weather**: Suggests comforting teas (Ginger Tea, Herbal Chamomile Tea)
- **Mild weather**: Can recommend any suitable tea based on mood

### Example Scenarios

#### Scenario 1: Hot + Tired
**User**: "I feel tired and it's hot outside."
**Weather**: 28°C, sunny
**AI Response**: "Since you're tired and it's hot, I recommend our refreshing Green Tea or Iced Lemon Tea. Would you like me to add this to your cart?"
**Action**: Shows "Add Green Tea to Cart" and "Add Iced Lemon Tea to Cart" buttons

#### Scenario 2: Cold + Stressed
**User**: "I'm feeling stressed and it's freezing."
**Weather**: 10°C, cloudy
**AI Response**: "For stress and cold weather, I'd suggest our warming Ginger Tea or comforting Herbal Chamomile Tea. Would you like me to add this to your cart?"
**Action**: Shows "Add Ginger Tea to Cart" and "Add Herbal Chamomile Tea to Cart" buttons

## Features Added

### Backend Changes
- **Weather Service** (`utils/weatherService.js`): Handles weather API calls
- **Enhanced Chat Route**: Includes weather context in AI prompts
- **Tea Extraction**: Automatically detects recommended teas from AI responses

### Frontend Changes
- **Add to Cart Buttons**: Appears for messages with tea recommendations
- **Toast Notifications**: Confirms when items are added to cart
- **Weather-Aware Chat**: AI considers current weather in recommendations

### Cart Integration
The cart functionality currently shows toast notifications. To integrate with your actual cart system:

1. **Redux Integration**: Uncomment and modify the dispatch line in `ChatBot.tsx`
2. **API Integration**: Replace toast with actual cart API calls
3. **State Management**: Connect to your existing cart state

## Testing the Weather Integration

### Test Messages to Try:
1. "I feel tired and it's hot outside."
2. "It's cold and I need something warming."
3. "I'm stressed and it's rainy."
4. "What tea do you recommend for this weather?"

### Expected Behavior:
- AI should mention current weather conditions
- Recommendations should match weather patterns
- "Add to Cart" buttons should appear for recommended teas
- Cart additions should show toast notifications

## Location Support

Currently hardcoded to "New York, US". To make it dynamic:

### Option 1: Browser Geolocation
```javascript
// In ChatBot.tsx
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  // Send coordinates to backend for reverse geocoding
});
```

### Option 2: User Input
Add a location field to the chat interface for users to specify their city.

### Option 3: IP-based Location
Use a service like ipapi.co to detect location from IP address.

## Troubleshooting

### Weather Not Working?
1. Check API key is correctly set in `.env`
2. Verify OpenWeatherMap API is accessible
3. Check browser console for weather errors
4. Fallback weather data will be used if API fails

### Cart Buttons Not Showing?
1. Verify AI response contains tea names
2. Check `showAddToCart` flag in response
3. Ensure `recommendedTeas` array is populated

### AI Not Considering Weather?
1. Check weather data is being fetched
2. Verify weather context is added to prompt
3. Test with different weather conditions
