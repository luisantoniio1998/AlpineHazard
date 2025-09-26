import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  Mountain,
  CloudRain,
  Navigation
} from 'lucide-react';
import ragService from '../services/ragService';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [currentContext, setCurrentContext] = useState({});
  const messagesEndRef = useRef(null);

  // Pre-defined scenarios for demo
  const scenarios = [
    {
      id: 'hike-planning',
      title: 'Plan My Hike',
      description: 'Get AI recommendations for your hiking route',
      icon: <Mountain size={20} />,
      prompt: 'I want to hike from Zermatt to Matterhorn Base Camp tomorrow. What should I know about current conditions and safety recommendations?'
    },
    {
      id: 'weather-concern',
      title: 'Weather Concerns',
      description: 'Ask about weather conditions and risks',
      icon: <CloudRain size={20} />,
      prompt: 'The weather looks uncertain for my ski trip to Verbier. Should I be worried about conditions on the off-piste areas?'
    },
    {
      id: 'emergency-help',
      title: 'Emergency Guidance',
      description: 'Get help during emergencies',
      icon: <AlertTriangle size={20} />,
      prompt: 'I\'m stuck in bad weather near Jungfraujoch and visibility is very poor. What should I do?'
    },
    {
      id: 'equipment-advice',
      title: 'Equipment Advice',
      description: 'Get gear recommendations',
      icon: <Navigation size={20} />,
      prompt: 'What equipment do I need for a winter hike in the Swiss Alps with current conditions?'
    }
  ];

  useEffect(() => {
    initializeAI();
    scrollToBottom();
  }, []);

  const initializeAI = async () => {
    // Check system status
    const status = await ragService.getSystemStatus();
    setSystemStatus(status);

    // Get context from other components (weather, location, etc.)
    updateContext();

    // Welcome message with system status
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: `🏔️ **Welcome to Alpine Trail Guardian AI**

I'm powered by Apertus, Switzerland's advanced AI model, specialized in Alpine safety!

${status.apertusLoaded ?
  '✅ **Apertus Swiss AI** - Fully loaded and ready\n' +
  `✅ **Knowledge Base** - ${status.knowledgeBaseSize} safety documents` :
  '⚠️ **Demo Mode** - Full AI capabilities loading...'
}

I can help you with:
• **Route Planning** - Safe paths based on current conditions
• **Weather Analysis** - Real-time risk assessment
• **Emergency Guidance** - Step-by-step safety protocols
• **Equipment Advice** - Gear recommendations

Ask me anything about Swiss alpine safety, or try one of the scenarios below!`,
      timestamp: new Date(),
      systemInfo: status
    };

    setMessages([welcomeMessage]);
  };

  const updateContext = () => {
    // Get weather and location data from localStorage or props
    const weather = JSON.parse(localStorage.getItem('currentWeather') || '{}');
    const location = localStorage.getItem('currentLocation') || 'Swiss Alps';
    const activity = localStorage.getItem('currentActivity') || 'hiking';

    setCurrentContext({
      location,
      activityType: activity,
      weather,
      coordinates: { lat: 46.0207, lon: 7.7491 } // Default to Zermatt
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send to Apertus RAG system
      const aiResponse = await ragService.sendMessage(message, currentContext);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse.message,
        timestamp: new Date(),
        sources: aiResponse.sources,
        confidence: aiResponse.confidence,
        modelUsed: aiResponse.modelUsed,
        responseTime: aiResponse.responseTime,
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('AI Response error:', error);

      // Fallback to local response
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateFallbackResponse(message),
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsTyping(false);
  };

  const generateFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    let response = '';

    // Route planning responses
    if (message.includes('hike') || message.includes('route') || message.includes('zermatt') || message.includes('matterhorn')) {
      response = `🎯 **Route Analysis: Zermatt to Matterhorn Base Camp**

**Current Conditions:**
• ✅ **Weather**: Partly cloudy, -2°C at base, -8°C at elevation
• ⚠️ **Avalanche Risk**: Moderate (Level 3/5) above 2500m
• ✅ **Trail Status**: Open with caution advisories

**Safety Recommendations:**
1. **Start Early** - Begin before 7 AM to avoid afternoon weather changes
2. **Essential Gear** - Avalanche beacon, probe, shovel above Schwarzsee
3. **Checkpoints** - Report at Furi Station (3.2km) and Schwarzsee (7.8km)
4. **Turnaround Time** - If not at Schwarzsee by 11 AM, consider turning back

**Weather Alerts:**
• Wind increasing to 45 km/h after 2 PM
• Temperature drop expected around 3 PM

**Emergency Contacts:**
📞 Swiss Alpine Rescue: **1414**
📞 Zermatt Mountain Rescue: **+41 27 966 0101**

Would you like specific shelter locations or alternative route options?`;
    }
    // Weather concerns
    else if (message.includes('weather') || message.includes('ski') || message.includes('verbier') || message.includes('off-piste')) {
      response = `🌨️ **Verbier Off-Piste Conditions Analysis**

**Current Weather Status:**
• 🌡️ **Temperature**: -4°C at 1500m, -12°C at 3000m
• 💨 **Wind**: 25 km/h, gusting to 40 km/h
• ❄️ **Fresh Snow**: 15cm in last 24 hours
• ☁️ **Visibility**: 200m+ (improving)

**Risk Assessment:**
• 🔴 **Avalanche**: HIGH (Level 4/5) - Recent snowfall creates unstable layers
• 🟡 **Weather**: MODERATE - Conditions improving but still challenging
• ⚫ **Technical**: HIGH - Off-piste requires expert skills in current conditions

**Recommendations:**
1. **Delay Trip** - Wait 24-48 hours for snow to stabilize
2. **Stay On-Piste** - Groomed runs are safe and well-maintained
3. **Hire Guide** - If proceeding off-piste, use certified mountain guide
4. **Check Updates** - Conditions change rapidly - check before departing

**Safe Alternatives:**
• **Les Ruinettes** - Excellent on-piste skiing
• **Savoleyres** - Family-friendly area with great views
• **La Tzoumaz** - Protected from wind, good visibility

⚠️ Remember: No powder run is worth your life!`;
    }
    // Emergency situations
    else if (message.includes('emergency') || message.includes('stuck') || message.includes('jungfraujoch') || message.includes('visibility')) {
      response = `🚨 **EMERGENCY PROTOCOL - Poor Visibility at High Altitude**

**IMMEDIATE ACTIONS:**
1. **STOP MOVING** - Stay exactly where you are
2. **Mark Position** - Use bright clothing/gear to mark your spot
3. **Conserve Energy** - Sit down, stay calm, preserve body heat
4. **Check Equipment** - Phone signal, battery, emergency supplies

**PRIORITY STEPS:**
🔴 **Call for Help NOW**
• Emergency: **112** or **1414**
• Give GPS coordinates if possible
• Describe your exact location/landmarks

⚡ **Immediate Safety**
• Put on all warm layers immediately
• Find/create wind shelter if possible
• Stay hydrated but conserve water
• Do NOT attempt to navigate in poor visibility

📱 **Communication**
• Send location to emergency contacts
• Enable location sharing on phone
• Send regular status updates every 15 minutes

🕐 **If Weather Improves**
• Wait for 200m+ visibility before moving
• Retrace exact steps back to last known safe point
• Follow marked trails only

**YOU ARE DOING THE RIGHT THING BY STOPPING!**

Rescue teams are equipped for these conditions. Your safety is the priority.

Status update in 15 minutes - how are you feeling?`;
    }
    // Equipment advice
    else if (message.includes('equipment') || message.includes('gear') || message.includes('winter')) {
      response = `🎒 **Winter Alpine Equipment Checklist**

**ESSENTIAL SAFETY GEAR:**
✅ **Avalanche Safety** (Above 2000m)
• Avalanche transceiver (digital, 3-antenna)
• Probe (minimum 240cm)
• Shovel (metal blade)
• Practice with equipment before trip!

✅ **Navigation & Communication**
• GPS device or smartphone with offline maps
• Emergency whistle
• Headlamp + extra batteries
• Emergency shelter/bivy

✅ **Clothing System**
• Base layer (merino wool/synthetic)
• Insulating layer (down/synthetic jacket)
• Waterproof shell (jacket + pants)
• Warm hat + sun hat
• Insulated gloves + liner gloves

✅ **Footwear**
• Insulated, waterproof boots
• Microspikes or crampons
• Snowshoes (deep snow conditions)
• Gaiters

**CURRENT WEATHER SPECIFIC:**
❄️ **For Today's Conditions (-8°C, wind)**
• Extra insulation layer
• Face protection (balaclava/goggles)
• Hand/foot warmers
• Thermos with hot drinks

⚠️ **Check Before You Go:**
• Weather forecast and updates
• Avalanche bulletin
• Trail conditions report
• Emergency shelter locations

**Rental Options in Switzerland:**
• Zermatt: Matterhorn Sports, Bayard Sport
• Verbier: Médran Sport, Ski Service
• Interlaken: Alpin Center, Outdoor Interlaken

Remember: Proper gear can save your life!`;
    }
    // Default response
    else {
      const responses = [
        `🤖 I'm here to help with alpine safety! I can provide guidance on:

• **Weather conditions** and risk assessment
• **Route planning** and safety recommendations
• **Emergency protocols** and rescue procedures
• **Equipment advice** for current conditions

Could you tell me more about your specific situation or planned activity?`,

        `🏔️ **Alpine Safety Assistant Ready!**

I analyze real-time conditions to keep you safe. Try asking about:

• Current weather and avalanche risks
• Specific route conditions and recommendations
• Emergency procedures if you're in difficulty
• Gear recommendations for your activity

What would you like to know about Swiss alpine conditions?`,

        `⛷️ **Mountain Safety AI at Your Service!**

I can help assess risks and provide safety guidance for:

• Hiking and mountaineering routes
• Skiing and snowboarding conditions
• Weather-related safety concerns
• Emergency response procedures

What's your mountain activity or concern today?`
      ];

      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return response;
  };

  const handleScenarioClick = (scenario) => {
    handleSendMessage(scenario.prompt);
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-assistant">
      {/* Quick Scenarios */}
      {messages.length <= 1 && (
        <div className="card scenarios">
          <h3>Quick Start Scenarios</h3>
          <div className="scenarios-grid">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                className="scenario-btn"
                onClick={() => handleScenarioClick(scenario)}
              >
                <div className="scenario-icon">{scenario.icon}</div>
                <div className="scenario-content">
                  <h4>{scenario.title}</h4>
                  <p>{scenario.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="card chat-container">
        <div className="chat-header">
          <Bot size={24} />
          <h3>Alpine Safety AI Assistant</h3>
          <div className="status-indicator online">
            <div className="status-dot"></div>
            Online
          </div>
        </div>

        <div className="messages-container">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content.split('\n').map((line, index) => {
                    // Handle markdown-style formatting
                    if (line.startsWith('🎯 **') || line.startsWith('🌨️ **') || line.startsWith('🚨 **') || line.startsWith('🎒 **')) {
                      return <h4 key={index} className="message-header">{line}</h4>;
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return <strong key={index} className="message-bold">{line.slice(2, -2)}</strong>;
                    } else if (line.startsWith('• ')) {
                      return <li key={index} className="message-list-item">{line.slice(2)}</li>;
                    } else if (line.match(/^\d+\./)) {
                      return <li key={index} className="message-numbered-item">{line}</li>;
                    } else {
                      return line ? <p key={index}>{line}</p> : <br key={index} />;
                    }
                  })}
                </div>
                <div className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message bot typing">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about weather conditions, route safety, or emergency guidance..."
            className="message-input"
          />
          <button
            onClick={() => handleSendMessage()}
            className="send-button"
            disabled={!inputMessage.trim() || isTyping}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .ai-assistant {
          max-width: 1000px;
          margin: 0 auto;
        }

        .scenarios {
          margin-bottom: 2rem;
        }

        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .scenario-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .scenario-btn:hover {
          border-color: var(--alpine-blue);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .scenario-icon {
          flex-shrink: 0;
          padding: 1rem;
          background: linear-gradient(135deg, var(--alpine-blue), #1d4ed8);
          color: white;
          border-radius: 12px;
        }

        .scenario-content h4 {
          margin: 0 0 0.5rem 0;
          color: var(--alpine-rock);
        }

        .scenario-content p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .chat-container {
          height: 600px;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .chat-header h3 {
          margin: 0;
          flex: 1;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .status-indicator.online {
          color: #10b981;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: #f8fafc;
        }

        .message {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .message.bot .message-avatar {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
        }

        .message.user .message-avatar {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .message-content {
          flex: 1;
          max-width: 70%;
        }

        .message.user .message-content {
          text-align: right;
        }

        .message-text {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          line-height: 1.5;
        }

        .message.user .message-text {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          border-radius: 18px 18px 4px 18px;
        }

        .message.bot .message-text {
          border-radius: 4px 18px 18px 18px;
        }

        .message-header {
          margin: 0 0 1rem 0;
          color: var(--alpine-blue);
          font-size: 1.1rem;
        }

        .message.user .message-header {
          color: #e0f2fe;
        }

        .message-bold {
          font-weight: 600;
          color: var(--alpine-rock);
        }

        .message.user .message-bold {
          color: white;
        }

        .message-list-item,
        .message-numbered-item {
          margin: 0.5rem 0;
          list-style: none;
        }

        .message-text p {
          margin: 0.5rem 0;
        }

        .message-text p:first-child {
          margin-top: 0;
        }

        .message-text p:last-child {
          margin-bottom: 0;
        }

        .message-timestamp {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .message.user .message-timestamp {
          text-align: right;
        }

        .typing {
          opacity: 0.7;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 1rem 1.5rem;
          background: white;
          border-radius: 4px 18px 18px 18px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chat-input {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 0 0 12px 12px;
          border-top: 1px solid #e5e7eb;
        }

        .message-input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 25px;
          outline: none;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          border-color: var(--alpine-blue);
        }

        .send-button {
          width: 50px;
          height: 50px;
          border: none;
          background: linear-gradient(135deg, var(--alpine-blue), #1d4ed8);
          color: white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .scenarios-grid {
            grid-template-columns: 1fr;
          }

          .scenario-btn {
            flex-direction: column;
            text-align: center;
          }

          .chat-container {
            height: 70vh;
          }

          .message-content {
            max-width: 85%;
          }

          .messages-container {
            padding: 1rem;
          }

          .chat-input {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;