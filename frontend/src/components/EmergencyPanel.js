import React, { useState } from 'react';
import { Phone, AlertTriangle, MapPin, Clock, X, Zap } from 'lucide-react';

const EmergencyPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [callingNumber, setCallingNumber] = useState(null);

  const emergencyContacts = [
    {
      id: 'rega',
      name: 'REGA Swiss Air Rescue',
      number: '1414',
      description: 'Mountain rescue, helicopter evacuation',
      priority: 'high',
      availability: '24/7',
      languages: ['German', 'French', 'Italian', 'English']
    },
    {
      id: 'emergency',
      name: 'European Emergency',
      number: '112',
      description: 'General emergency services',
      priority: 'high',
      availability: '24/7',
      languages: ['German', 'French', 'Italian', 'English']
    },
    {
      id: 'police',
      name: 'Swiss Police',
      number: '117',
      description: 'Police assistance, crime reporting',
      priority: 'medium',
      availability: '24/7',
      languages: ['German', 'French', 'Italian']
    },
    {
      id: 'fire',
      name: 'Fire Department',
      number: '118',
      description: 'Fire, explosion, hazardous materials',
      priority: 'medium',
      availability: '24/7',
      languages: ['German', 'French', 'Italian']
    },
    {
      id: 'medical',
      name: 'Medical Emergency',
      number: '144',
      description: 'Ambulance, medical emergencies',
      priority: 'high',
      availability: '24/7',
      languages: ['German', 'French', 'Italian', 'English']
    }
  ];

  const handleCall = (contact) => {
    setCallingNumber(contact.number);

    if (window.confirm(
      `🚨 Emergency Call\n\n` +
      `Service: ${contact.name}\n` +
      `Number: ${contact.number}\n` +
      `Purpose: ${contact.description}\n\n` +
      `This will attempt to call emergency services.\n` +
      `Continue?`
    )) {
      // Try to make the call
      window.open(`tel:${contact.number}`);

      // Show calling status
      setTimeout(() => {
        setCallingNumber(null);
      }, 3000);
    } else {
      setCallingNumber(null);
    }
  };

  const emergencyTips = [
    "Stay calm and speak clearly",
    "Give your exact location (GPS coordinates if possible)",
    "Describe the nature of the emergency",
    "Number of people involved",
    "Current weather conditions",
    "Your phone number for callback"
  ];

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        className={`emergency-float-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Emergency Contacts"
      >
        <AlertTriangle size={24} />
        <span className="emergency-pulse"></span>
      </button>

      {/* Emergency Panel Overlay */}
      {isOpen && (
        <div className="emergency-overlay" onClick={() => setIsOpen(false)}>
          <div className="emergency-panel" onClick={(e) => e.stopPropagation()}>
            <div className="emergency-header">
              <div className="emergency-title">
                <AlertTriangle size={28} />
                <h2>Emergency Contacts</h2>
              </div>
              <button
                className="panel-close"
                onClick={() => setIsOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="emergency-warning">
              <Zap size={20} />
              <p>For immediate life-threatening emergencies, call <strong>1414</strong> or <strong>112</strong></p>
            </div>

            <div className="emergency-contacts">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className={`contact-card priority-${contact.priority}`}>
                  <div className="contact-header">
                    <div className="contact-info">
                      <h3 className="contact-name">{contact.name}</h3>
                      <p className="contact-description">{contact.description}</p>
                    </div>
                    <div className="contact-number">
                      {contact.number}
                    </div>
                  </div>

                  <div className="contact-details">
                    <div className="contact-meta">
                      <span className="availability">
                        <Clock size={14} />
                        {contact.availability}
                      </span>
                      <span className="languages">
                        Languages: {contact.languages.join(', ')}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`call-btn ${callingNumber === contact.number ? 'calling' : ''}`}
                    onClick={() => handleCall(contact)}
                    disabled={callingNumber && callingNumber !== contact.number}
                  >
                    <Phone size={18} />
                    {callingNumber === contact.number ? 'Calling...' : 'Call Now'}
                  </button>
                </div>
              ))}
            </div>

            <div className="emergency-tips">
              <h3>When calling emergency services:</h3>
              <ul>
                {emergencyTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="emergency-footer">
              <p>
                <MapPin size={16} />
                Your approximate location will be shared with emergency services when available
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .emergency-float-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          border: none;
          border-radius: 50%;
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .emergency-float-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 35px rgba(220, 38, 38, 0.6);
        }

        .emergency-float-btn.active {
          background: linear-gradient(135deg, #059669, #047857);
          box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
        }

        .emergency-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.3);
          animation: pulse 2s infinite;
        }

        .emergency-float-btn.active .emergency-pulse {
          background: rgba(5, 150, 105, 0.3);
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          70% {
            transform: scale(1.4);
            opacity: 0;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .emergency-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .emergency-panel {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .emergency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30px 30px 20px 30px;
          border-bottom: 2px solid #f3f4f6;
        }

        .emergency-title {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #dc2626;
        }

        .emergency-title h2 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .panel-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .panel-close:hover {
          background: #f3f4f6;
        }

        .emergency-warning {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 2px solid #fca5a5;
          border-radius: 12px;
          margin: 0 30px 25px 30px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          color: #dc2626;
        }

        .emergency-warning p {
          margin: 0;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .emergency-contacts {
          padding: 0 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .contact-card {
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          background: white;
        }

        .contact-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }

        .priority-high {
          border-color: #fca5a5;
          background: linear-gradient(135deg, #fef2f2, #ffffff);
        }

        .priority-high:hover {
          border-color: #dc2626;
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
        }

        .contact-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .contact-info {
          flex: 1;
        }

        .contact-name {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .contact-description {
          margin: 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .contact-number {
          font-size: 2rem;
          font-weight: 900;
          color: #dc2626;
          font-family: 'Monaco', 'Menlo', monospace;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          padding: 10px 20px;
          border-radius: 12px;
          border: 2px solid #fca5a5;
        }

        .contact-details {
          margin-bottom: 15px;
        }

        .contact-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .availability {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .languages {
          font-style: italic;
        }

        .call-btn {
          width: 100%;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          border: none;
          padding: 15px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .call-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #b91c1c, #991b1b);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
        }

        .call-btn.calling {
          background: linear-gradient(135deg, #059669, #047857);
          animation: calling 1s infinite;
        }

        .call-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes calling {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .emergency-tips {
          margin: 30px;
          padding: 25px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border: 2px solid #bae6fd;
          border-radius: 16px;
        }

        .emergency-tips h3 {
          margin: 0 0 15px 0;
          color: #0c4a6e;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .emergency-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #0c4a6e;
        }

        .emergency-tips li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .emergency-footer {
          padding: 20px 30px 30px 30px;
          border-top: 2px solid #f3f4f6;
          background: #f9fafb;
          border-radius: 0 0 20px 20px;
        }

        .emergency-footer p {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 0.875rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .emergency-float-btn {
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
          }

          .emergency-panel {
            margin: 10px;
            max-height: 95vh;
          }

          .emergency-header {
            padding: 20px;
          }

          .emergency-title h2 {
            font-size: 1.5rem;
          }

          .emergency-contacts {
            padding: 0 20px;
          }

          .contact-header {
            flex-direction: column;
            gap: 15px;
          }

          .contact-number {
            font-size: 1.5rem;
            text-align: center;
          }

          .emergency-tips {
            margin: 20px;
            padding: 20px;
          }

          .emergency-footer {
            padding: 15px 20px 20px 20px;
          }
        }
      `}</style>
    </>
  );
};

export default EmergencyPanel;