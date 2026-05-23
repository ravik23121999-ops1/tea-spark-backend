# AI Chat Integration for Tea Spark

## Overview
This document explains the AI chat integration implemented for Tea Spark, featuring an intelligent tea sommelier chatbot.

## Features
- **AI-Powered Recommendations**: Uses OpenAI GPT-3.5-turbo for intelligent tea recommendations
- **Contextual Conversations**: Maintains conversation history for better responses
- **Tea Menu Expert**: Specialized knowledge of Tea Spark's menu items
- **Responsive UI**: Beautiful chat interface with animations
- **Real-time Messaging**: Instant responses with typing indicators

## Backend Implementation

### New Dependencies
- `openai`: OpenAI SDK for AI integration

### API Endpoints
- **POST** `/api/chat/message` - Send messages to AI (also available at `/chat/message`)
- **GET** `/api/chat/health` - Health check (also `/chat/health`)

### Environment Variables
Add to `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Chat Route (`routes/chatRoute.js`)
- Handles message processing
- Integrates with OpenAI API
- Provides tea-specific context to AI
- Error handling and response formatting

## Frontend Implementation

### Components
- **ChatBot.tsx**: Main chat interface component
- Integrated into root layout for global access

### Features
- Floating chat button (bottom-right corner)
- Animated chat window with smooth transitions
- Message history with timestamps
- Typing indicators
- User and bot message differentiation
- Responsive design

### Dependencies (Already Installed)
- `framer-motion`: Animations
- `lucide-react`: Icons

## AI Behavior

The chatbot acts as a Tea Sommelier with specific rules:
1. **Menu Knowledge**: Knows all 5 tea varieties and their attributes
2. **Contextual Recommendations**: Based on mood, taste, weather
3. **Conversation Style**: Warm, friendly, concise
4. **Response Format**: Always ends with "Would you like me to add this to your cart?"

### Tea Menu
- **Masala Chai**: spicy, warming, energizing, best for cold weather or with snacks
- **Green Tea**: refreshing, energizing, best for tired mood or hot weather
- **Ginger Tea**: spicy, comforting, best for rainy or cold days
- **Iced Lemon Tea**: cooling, refreshing, best for summer or hot weather
- **Herbal Chamomile Tea**: calming, soothing, best for stress or bedtime

## Setup Instructions

### Backend Setup
1. Install OpenAI dependency:
   ```bash
   npm install openai
   ```

2. Add OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
The chat component is already integrated into the layout. Simply start the frontend:
```bash
npm run dev
```

## Usage
1. Click the chat button in the bottom-right corner
2. Type your message about tea preferences
3. Receive AI-powered recommendations
4. Continue conversation for more suggestions

## Testing
Test the chat functionality by:
1. Starting both backend and frontend servers
2. Opening the chat interface
3. Sending test messages like:
   - "I'm feeling tired"
   - "It's cold outside"
   - "What tea do you recommend for stress?"

## Future Enhancements
- Add to cart functionality
- Voice input support
- Multi-language support
- Chat history persistence
- Analytics for chat interactions
