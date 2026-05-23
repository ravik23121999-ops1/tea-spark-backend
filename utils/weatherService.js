const axios = require('axios');

// Default location (can be made dynamic based on user location)
const DEFAULT_LOCATION = 'New York, US';

class WeatherService {
  static async getWeatherData(location = DEFAULT_LOCATION) {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      if (!apiKey) {
        console.warn('Weather API key not found, using default weather');
        return this.getDefaultWeather();
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );

      const weather = response.data;
      
      return {
        temperature: Math.round(weather.main.temp),
        condition: weather.weather[0].main.toLowerCase(),
        description: weather.weather[0].description.toLowerCase(),
        humidity: weather.main.humidity,
        location: weather.name,
        isHot: weather.main.temp > 25,
        isCold: weather.main.temp < 15,
        isRainy: weather.weather[0].main.toLowerCase().includes('rain')
      };

    } catch (error) {
      console.error('Error fetching weather:', error.message);
      return this.getDefaultWeather();
    }
  }

  static getDefaultWeather() {
    // Fallback weather data when API fails
    return {
      temperature: 22,
      condition: 'partly cloudy',
      description: 'partly cloudy',
      humidity: 60,
      location: 'Unknown',
      isHot: false,
      isCold: false,
      isRainy: false
    };
  }

  static getWeatherContext(weatherData) {
    if (!weatherData) return '';
    
    let context = `Current weather in ${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.description}.`;
    
    if (weatherData.isHot) {
      context += ' It\'s hot outside.';
    } else if (weatherData.isCold) {
      context += ' It\'s cold outside.';
    } else if (weatherData.isRainy) {
      context += ' It\'s rainy.';
    }
    
    return context;
  }
}

module.exports = WeatherService;
