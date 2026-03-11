import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/* Removed unused StudentInfo */

const HindiLearningChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! 👋 Welcome to Hindi Learning Platform!\n\nI'm here to help you get started with our 48-hour Hindi video course.\n\nTo provide you with the best support, may I know your name?"
    }
  ]);
  const [input, setInput] = useState('');
  /* Removed unused studentInfo and conversationStep */
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* 🔥 Allow Contact page to open chat */
  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener('open-hindi-chat', openChat);
    return () => window.removeEventListener('open-hindi-chat', openChat);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Thanks! 😊 How can I help you with our Hindi course?"
        }
      ]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div
      id="hindi-chat"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
    >
      {/* Chat Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}>
          <img
            src="/aichaticon.png"
            alt="Chat"
            className="w-14 h-14 md:w-20 md:h-20 object-cover"
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all ${isMinimized ? 'h-14' : 'h-[500px] md:h-[600px]'
            } w-[calc(100vw-2rem)] md:w-96 fixed bottom-4 right-4 md:relative`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-t-lg flex justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <div>
                <h3 className="font-semibold">Hindi Learning Assistant</h3>
                <p className="text-xs opacity-90">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)}>
                <Minimize2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-purple-50/30">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border shadow'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  onClick={handleSend}
                  className="bg-purple-600 text-white p-2 rounded-lg"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HindiLearningChat;
