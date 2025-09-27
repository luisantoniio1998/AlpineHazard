/**
 * RAG Service API client for Apertus Swiss AI integration
 * Handles communication with the Alpine RAG backend
 */

class RAGService {
  constructor() {
    this.baseURL = process.env.REACT_APP_RAG_URL || 'http://localhost:8001';
    this.timeout = 60000; // 60 seconds for AI responses (FLAN-T5 is slow)
  }

  /**
   * Send chat message to Apertus RAG system
   */
  async sendMessage(message, context = {}) {
    try {
      const requestBody = {
        message: message,
        context: this.buildContext(context),
        location: context.location || null,
        activity_type: context.activityType || null,
        language: context.language || 'en',
        session_id: this.getSessionId()
      };

      console.log('RAG Service: Sending request to', this.baseURL);
      console.log('RAG Service: Request body:', requestBody);

      // Create manual abort controller for better compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RAG API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('RAG Service: Response received:', data);
      return this.formatResponse(data);

    } catch (error) {
      console.error('RAG Service error:', error);
      console.error('RAG Service: Error details:', error.message);
      return this.getFallbackResponse(message, error);
    }
  }

  /**
   * Stream chat responses for real-time interaction
   */
  async streamMessage(message, context = {}, onChunk) {
    try {
      const requestBody = {
        message: message,
        context: this.buildContext(context),
        location: context.location || null,
        activity_type: context.activityType || null,
        language: context.language || 'en',
        session_id: this.getSessionId()
      };

      const response = await fetch(`${this.baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Streaming error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        onChunk(chunk);
      }

    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  /**
   * Search knowledge base directly
   */
  async searchKnowledge(query, options = {}) {
    try {
      const params = new URLSearchParams({
        query: query,
        limit: options.limit || 5,
        ...(options.location && { location: options.location }),
        ...(options.activityType && { activity_type: options.activityType })
      });

      const response = await fetch(`${this.baseURL}/knowledge/search?${params}`);

      if (!response.ok) {
        throw new Error(`Knowledge search error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Knowledge search error:', error);
      return { query, results: [], total_found: 0 };
    }
  }

  /**
   * Get system health and model status
   */
  async getSystemStatus() {
    try {
      const [healthResponse, modelResponse] = await Promise.all([
        fetch(`${this.baseURL}/health`),
        fetch(`${this.baseURL}/models/status`)
      ]);

      const health = healthResponse.ok ? await healthResponse.json() : null;
      const models = modelResponse.ok ? await modelResponse.json() : null;

      return {
        health,
        models,
        isOnline: healthResponse.ok,
        apertusLoaded: models?.apertus_model?.loaded || false,
        knowledgeBaseSize: health?.knowledge_base_size || 0
      };

    } catch (error) {
      console.error('System status error:', error);
      return {
        health: null,
        models: null,
        isOnline: false,
        apertusLoaded: false,
        knowledgeBaseSize: 0
      };
    }
  }

  /**
   * Build context object for AI requests
   */
  buildContext(context) {
    const aiContext = {};

    // Weather context
    if (context.weather) {
      aiContext.weather = {
        location: context.weather.location,
        temperature: context.weather.temperature,
        condition: context.weather.condition,
        wind_speed: context.weather.windSpeed,
        visibility: context.weather.visibility,
        avalanche_risk: context.weather.avalancheRisk,
        warnings: context.weather.warnings || []
      };
    }

    // Activity context
    if (context.activity) {
      aiContext.activity = {
        type: context.activity.type,
        difficulty: context.activity.difficulty,
        duration: context.activity.duration,
        group_size: context.activity.groupSize || 1,
        equipment: context.activity.equipment || []
      };
    }

    // Location context
    if (context.location) {
      aiContext.location_details = {
        name: context.location,
        coordinates: context.coordinates,
        elevation: context.elevation,
        region: context.region
      };
    }

    // Route context
    if (context.route) {
      aiContext.route = {
        start_point: context.route.startPoint,
        end_point: context.route.endPoint,
        distance: context.route.distance,
        elevation_gain: context.route.elevationGain,
        difficulty: context.route.difficulty,
        current_progress: context.route.progress || 0
      };
    }

    return aiContext;
  }

  /**
   * Format response from RAG API
   */
  formatResponse(data) {
    return {
      message: data.message,
      sources: data.sources || [],
      confidence: data.confidence || 0.5,
      responseTime: data.response_time || 0,
      modelUsed: data.model_used || 'apertus-8b',
      locationContext: data.location_context,
      suggestions: data.suggestions || [],
      timestamp: new Date()
    };
  }

  /**
   * Get fallback response when RAG service is unavailable
   */
  getFallbackResponse(message, error) {
    const fallbackResponses = {
      weather: "🌤️ I'm currently unable to access real-time weather data. Please check MeteoSwiss (meteoswiss.admin.ch) for current conditions and warnings. For emergencies, call 1414 (Swiss Alpine Rescue).",

      route: "🥾 I can't access live route conditions right now. Please check with local mountain guides or visitor centers for current trail conditions. Always inform someone of your planned route.",

      emergency: "🚨 **SWISS EMERGENCY NUMBERS**:\n\n• **1414** - Swiss Alpine Rescue (REGA) - PRIMARY for mountain emergencies\n• **112** - European Emergency Number\n• **117** - Police\n• **118** - Fire Department\n• **144** - Medical Emergency/Ambulance\n\n**For mountain accidents**: Call 1414 first!\n\nProvide: exact location, number of people, weather conditions, helicopter landing possible?",

      avalanche: "⚠️ For current avalanche conditions, please check the official SLF bulletin at slf.ch. Never venture off-piste without proper equipment and knowledge. When in doubt, stay on marked trails.",

      equipment: "🎒 I can't access equipment recommendations right now. For proper alpine gear, consult local mountain shops or the Swiss Alpine Club (SAC) guidelines. Always carry safety equipment appropriate for conditions.",

      default: "🏔️ I'm temporarily unable to provide detailed guidance. For immediate safety information:\n\n• Weather: meteoswiss.admin.ch\n• Avalanche: slf.ch\n• Emergency: 1414\n• Route conditions: local tourist offices\n\nI'll be back with full AI assistance soon!"
    };

    // Determine response type based on message content
    const messageLC = message.toLowerCase();
    let responseType = 'default';

    if (messageLC.includes('emergency') || messageLC.includes('help') || messageLC.includes('stuck') ||
        messageLC.includes('numbers') || messageLC.includes('contact') || messageLC.includes('rescue') ||
        messageLC.includes('call') || messageLC.includes('1414') || messageLC.includes('112')) {
      responseType = 'emergency';
    } else if (messageLC.includes('weather') || messageLC.includes('forecast')) {
      responseType = 'weather';
    } else if (messageLC.includes('route') || messageLC.includes('trail') || messageLC.includes('hike')) {
      responseType = 'route';
    } else if (messageLC.includes('avalanche') || messageLC.includes('snow')) {
      responseType = 'avalanche';
    } else if (messageLC.includes('equipment') || messageLC.includes('gear')) {
      responseType = 'equipment';
    }

    return {
      message: fallbackResponses[responseType],
      sources: [],
      confidence: 0.3,
      responseTime: 0,
      modelUsed: 'fallback',
      locationContext: null,
      suggestions: [
        "Check weather conditions",
        "Review safety equipment",
        "Contact local guides",
        "Call emergency services if needed"
      ],
      timestamp: new Date(),
      isTemporary: true,
      error: error.message
    };
  }

  /**
   * Get or create session ID for conversation continuity
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('alpine_rag_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('alpine_rag_session', sessionId);
    }
    return sessionId;
  }

  /**
   * Clear session (for new conversations)
   */
  clearSession() {
    sessionStorage.removeItem('alpine_rag_session');
  }

  /**
   * Update knowledge base (admin function)
   */
  async updateKnowledgeBase() {
    try {
      const response = await fetch(`${this.baseURL}/knowledge/update`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Knowledge base update error:', error);
      throw error;
    }
  }

  /**
   * Get suggested questions based on context
   */
  getSuggestedQuestions(context = {}) {
    const suggestions = [];

    if (context.location) {
      suggestions.push(`What are the current conditions at ${context.location}?`);
      suggestions.push(`What should I know about safety at ${context.location}?`);
    }

    if (context.activityType === 'hiking') {
      suggestions.push("What equipment do I need for hiking in current conditions?");
      suggestions.push("How do I recognize signs of altitude sickness?");
    } else if (context.activityType === 'skiing') {
      suggestions.push("What's the current avalanche risk?");
      suggestions.push("How do I stay safe skiing off-piste?");
    }

    // General suggestions
    suggestions.push("What are the emergency numbers in Switzerland?");
    suggestions.push("How do I prepare for sudden weather changes?");
    suggestions.push("What should I do if I get lost?");

    return suggestions.slice(0, 4); // Return max 4 suggestions
  }
}

// Export singleton instance
export default new RAGService();