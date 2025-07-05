import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  GraduationCap, 
  Search, 
  FileText, 
  CheckCircle,
  Loader2,
  Sparkles,
  MessageCircle
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isTyping?: boolean;
}

interface UserProfile {
  field_of_study: string;
  education_level: string;
  gpa: number;
  location: string;
  citizenship: string;
  financial_need: string;
  extracurriculars: string[];
  research_interests: string[];
  career_goals: string;
}

const CONVERSATION_STAGES = {
  PROFILING: 'profiling',
  SEARCHING: 'searching',
  RESPONDING: 'responding',
  COMPLETE: 'complete'
} as const;

type ConversationStage = typeof CONVERSATION_STAGES[keyof typeof CONVERSATION_STAGES];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🎓 Welcome to your AI-Powered Scholarship Agent! I'm here to help you find personalized scholarships and guide you through the application process. Let's start by getting to know you better - what field are you studying or planning to study?",
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<ConversationStage>(CONVERSATION_STAGES.PROFILING);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [progress, setProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Calculate progress based on profile completeness
    const requiredFields = ['field_of_study', 'education_level', 'location', 'citizenship'];
    const completedFields = requiredFields.filter(field => userProfile[field as keyof UserProfile]);
    setProgress((completedFields.length / requiredFields.length) * 100);
  }, [userProfile]);

  const simulateAgentResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Simple response simulation based on current stage
    if (currentStage === CONVERSATION_STAGES.PROFILING) {
      if (userMessage.toLowerCase().includes('computer') || userMessage.toLowerCase().includes('engineering')) {
        setUserProfile(prev => ({ ...prev, field_of_study: 'Computer Science/Engineering' }));
        return "Great! Computer Science and Engineering have excellent scholarship opportunities. What level of education are you pursuing? (Bachelor's, Master's, PhD)";
      }
      if (userMessage.toLowerCase().includes('bachelor') || userMessage.toLowerCase().includes('master') || userMessage.toLowerCase().includes('phd')) {
        setUserProfile(prev => ({ ...prev, education_level: userMessage }));
        return "Perfect! Now, what is your citizenship/nationality? This is crucial as scholarships have specific eligibility requirements based on citizenship.";
      }
      if (userMessage.toLowerCase().includes('canada') || userMessage.toLowerCase().includes('usa') || userMessage.toLowerCase().includes('india')) {
        setUserProfile(prev => ({ ...prev, citizenship: userMessage }));
        return "Thank you! Where are you planning to study or currently studying? (City, Country)";
      }
      if (userMessage.toLowerCase().includes('toronto') || userMessage.toLowerCase().includes('ottawa') || userMessage.toLowerCase().includes('vancouver')) {
        setUserProfile(prev => ({ ...prev, location: userMessage }));
        setCurrentStage(CONVERSATION_STAGES.SEARCHING);
        return "Excellent! I have enough information to start searching. Let me find relevant scholarships for you...";
      }
    }
    
    if (currentStage === CONVERSATION_STAGES.SEARCHING) {
      setCurrentStage(CONVERSATION_STAGES.RESPONDING);
      return `Based on your profile, I found several excellent scholarship opportunities:

**🎯 Scholarships for ${userProfile.citizenship} Citizens**

1. **Tech Excellence Scholarship** - $5,000
   - Deadline: March 15, 2024
   - For Computer Science students
   - [Source: techscholarships.org]

2. **International Student Merit Award** - $10,000
   - Deadline: April 30, 2024
   - Open to international students in STEM
   - [Source: university-scholarships.ca]

3. **Future Leaders Grant** - $7,500
   - Deadline: May 15, 2024
   - For graduate students in technology
   - [Source: futureleaders.edu]

**📋 Next Steps:**
- Verify eligibility on official websites
- Prepare transcripts and recommendation letters
- Start working on personal statements

Would you like me to provide detailed application support for any of these scholarships?`;
    }
    
    return "I'm here to help! Feel free to ask me anything about scholarships or the application process.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      sender: 'agent',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await simulateAgentResponse(inputValue);
      
      // Remove typing indicator and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          text: response,
          sender: 'agent',
          timestamp: new Date()
        }];
      });
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          text: "I apologize, but I encountered an error. Please try again.",
          sender: 'agent',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStageIcon = () => {
    switch (currentStage) {
      case CONVERSATION_STAGES.PROFILING:
        return <User className="w-5 h-5" />;
      case CONVERSATION_STAGES.SEARCHING:
        return <Search className="w-5 h-5" />;
      case CONVERSATION_STAGES.RESPONDING:
        return <FileText className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStageText = () => {
    switch (currentStage) {
      case CONVERSATION_STAGES.PROFILING:
        return 'Building Your Profile';
      case CONVERSATION_STAGES.SEARCHING:
        return 'Searching Scholarships';
      case CONVERSATION_STAGES.RESPONDING:
        return 'Providing Recommendations';
      default:
        return 'Complete';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AI Scholarship Agent</h1>
                <p className="text-sm text-gray-600">Your intelligent scholarship advisor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {getStageIcon()}
                <span>{getStageText()}</span>
              </div>
              
              {currentStage === CONVERSATION_STAGES.PROFILING && (
                <div className="w-24">
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-4 scrollbar-hide">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`chat-bubble ${
                      message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.text}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="input-field pr-12"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="btn-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>AI-powered scholarship matching</span>
              </div>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-600">
        <p>Powered by AI • Helping students find their perfect scholarships</p>
      </footer>
    </div>
  );
}

export default App;