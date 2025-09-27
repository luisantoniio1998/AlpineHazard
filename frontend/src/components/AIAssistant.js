import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mountain, CloudRain, AlertTriangle, Navigation } from 'lucide-react';
import ragService from '../services/ragService';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const messagesEndRef = useRef(null);

  // Pre-defined scenarios for demo
  const scenarios = [
    {
      id: 'hike-planning',
      title: 'Plan My Hike',
      description: 'Get recommendations for your hiking route',
      prompt: 'I want to hike from Zermatt to Matterhorn Base Camp tomorrow. What should I know about current conditions and safety recommendations?'
    },
    {
      id: 'weather-concern',
      title: 'Weather Conditions',
      description: 'Ask about weather and risks',
      prompt: 'The weather looks uncertain for my ski trip to Verbier. Should I be worried about conditions on the off-piste areas?'
    },
    {
      id: 'emergency-help',
      title: 'Emergency Help',
      description: 'Get help during emergencies',
      prompt: 'I am stuck in bad weather near Jungfraujoch and visibility is very poor. What should I do?'
    },
    {
      id: 'equipment-advice',
      title: 'Equipment Advice',
      description: 'Get gear recommendations',
      prompt: 'What equipment do I need for a winter hike in the Swiss Alps with current conditions?'
    }
  ];

  useEffect(() => {
    // Welcome message
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: `Welcome to Alpine Trail Guardian AI

I can help you with:

- Route planning based on current conditions
- Weather analysis and risk assessment
- Emergency guidance and safety protocols
- Equipment advice for alpine conditions

Ask me anything about Swiss alpine safety, or try one of the scenarios below.`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    scrollToBottom();
  }, []);

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
      const response = await ragService.sendMessage(message, {
        location: selectedScenario?.location,
        activityType: selectedScenario?.activityType,
        weather: selectedScenario?.weather
      });

      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          confidence: response.confidence,
          sources: response.sources,
          responseTime: response.responseTime
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting to my knowledge base. For urgent safety information, please check official sources or call 1414 for emergencies.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Legacy response generator - removed as we now use RAG service
  /*const generateAIResponse = (userMessage) => {
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

    return {
      id: Date.now(),
      type: 'bot',
      content: response,
      timestamp: new Date()
    };
  };*/

  const handleScenarioClick = (scenario) => {
    setSelectedScenario(scenario);
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
          max-width: 800px;
          margin: 0 auto;
        }

        .scenarios {
          margin-bottom: 2rem;
        }

        .scenarios h3 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .scenario-btn {
          padding: 1rem;
          border: 1px solid #eee;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.2s;
        }

        .scenario-btn:hover {
          border-color: #ccc;
        }

        .scenario-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 14px;
          font-weight: 500;
        }

        .scenario-content p {
          margin: 0;
          color: #666;
          font-size: 12px;
        }

        .chat-container {
          height: 500px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: white;
        }

        .chat-header h3 {
          margin: 0;
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: white;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #666;
        }

        .message-content {
          flex: 1;
          max-width: 75%;
        }

        .message.user .message-content {
          text-align: right;
        }

        .message-text {
          background: #f9f9f9;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          line-height: 1.4;
          font-size: 14px;
        }

        .message.user .message-text {
          background: #333;
          color: white;
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
          margin-top: 0.25rem;
          font-size: 11px;
          color: #999;
        }

        .message.user .message-timestamp {
          text-align: right;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 0.75rem 1rem;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ccc;
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
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border-top: 1px solid #eee;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          outline: none;
          font-size: 14px;
        }

        .message-input:focus {
          border-color: #999;
        }

        .send-button {
          width: 36px;
          height: 36px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .send-button:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .scenarios-grid {
            grid-template-columns: 1fr;
          }

          .message-content {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;