import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { getAdvisorResponse } from '../../lib/ai';
import type { ChatMessage } from '../../types/realEstate';
import {
  Send,
  Bot,
  User,
  Building2,
  Calculator,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

import { YuvnaHeader } from './YuvnaHeader';

const shouldEscalate = (signals: string[]): boolean => {
  const highIntentSignals = ['call_request', 'booking_intent', 'planning_visit'];
  return signals.some(s => highIntentSignals.includes(s));
};

const quickActions = [
  { label: 'Show ROI projections', icon: Calculator },
  { label: 'Best areas for my budget', icon: Building2 },
  { label: 'Explain Golden Visa', icon: Building2 },
  { label: 'Buying process steps', icon: Clock },
];

export function JuvnaChat() {
  const { currentBuyer } = useRealEstateStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check AI availability on mount
  useEffect(() => {
    const checkAI = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        const hasProvider = data.providers?.anthropic || data.providers?.openai || data.providers?.gemini;
        setIsOnline(hasProvider);
        if (!hasProvider) {
          setAiError('AI not configured. Please add an API key.');
        }
      } catch {
        // API might not be available in dev mode, try anyway
        setIsOnline(true);
      }
    };
    checkAI();
  }, []);

  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      conversationId: 'main',
      role: 'advisor',
      content: `Hi ${currentBuyer?.firstName || 'there'}! 👋 I'm your Yuvna Realty investment advisor.\n\nI can see you're interested in ${currentBuyer?.goal || 'property investment'} with a budget of ${currentBuyer?.budgetBand?.replace('-', ' to ').toUpperCase() || 'flexible range'}.\n\nHow can I help you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [currentBuyer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: 'main',
      role: 'buyer',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setAiError(null);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call real AI
      const { content, intentSignals } = await getAdvisorResponse(messageText, {
        persona: currentBuyer?.persona || null,
        budget: currentBuyer?.budgetBand || '500k-1m',
        goal: currentBuyer?.goal || 'investment',
        conversationHistory,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: 'main',
        role: 'advisor',
        content,
        timestamp: new Date(),
        intentSignals,
        escalationTrigger: shouldEscalate(intentSignals),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (shouldEscalate(intentSignals)) {
        setTimeout(() => setShowEscalation(true), 1000);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setAiError(error.message || 'Failed to get response');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: 'main',
        role: 'advisor',
        content: `I apologize, but I'm having trouble connecting right now. Please try again in a moment.\n\nIn the meantime, feel free to explore our ROI Calculator or Property Recommendations.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex flex-col">
      <YuvnaHeader currentPage="chat" />

      {/* AI Status Banner */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-amber-800 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>AI advisor is offline. Responses may be limited.</span>
          </div>
        </div>
      )}

      {aiError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{aiError}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Online indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#7a6a5f]">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-green-500" />
                <span>AI Advisor Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span>Limited Mode</span>
              </>
            )}
          </div>

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === 'buyer' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                message.role === 'buyer' ? 'bg-[#3D2D22]' : 'bg-[#E07F26]/10'
              }`}>
                {message.role === 'buyer' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-[#E07F26]" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'buyer' ? 'bg-[#3D2D22] text-white' : 'bg-white border border-[#E8E4E0]'
              }`}>
                <div className={`whitespace-pre-wrap leading-relaxed text-sm ${
                  message.role === 'buyer' ? 'text-white' : 'text-[#3D2D22]'
                }`}>
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${message.role === 'buyer' ? 'text-white/50' : 'text-[#7a6a5f]'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E07F26]/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#E07F26]" />
              </div>
              <div className="bg-white border border-[#E8E4E0] rounded-2xl p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#E07F26] animate-spin" />
                <span className="text-[#7a6a5f] text-sm">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="border-t border-[#E8E4E0] bg-white">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.label)}
                  disabled={isTyping}
                  className="px-4 py-2 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] text-sm hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <action.icon className="w-4 h-4 text-[#E07F26]" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#E8E4E0] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
              placeholder="Ask anything about Dubai real estate..."
              className="flex-1 px-5 py-3 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26]"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="px-6 py-3 rounded-xl bg-[#E07F26] text-white font-semibold flex items-center gap-2 hover:bg-[#c96e1f] transition-all disabled:opacity-50"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Escalation Modal */}
      <AnimatePresence>
        {showEscalation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setShowEscalation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-[#E07F26]/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-[#E07F26]" />
                </div>
                <h2 className="text-xl font-serif font-bold text-[#3D2D22] mb-2">Ready for the Next Step?</h2>
                <p className="text-[#7a6a5f] text-sm">
                  Connect with one of our licensed property consultants for personalized guidance.
                </p>
              </div>

              <div className="space-y-3">
                <button onClick={() => setShowEscalation(false)} className="w-full py-3 rounded-xl bg-[#E07F26] text-white font-semibold flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" /> Request a Call Back
                </button>
                <button onClick={() => setShowEscalation(false)} className="w-full py-3 rounded-xl border-2 border-[#3D2D22] text-[#3D2D22] font-semibold flex items-center justify-center gap-2 hover:bg-[#3D2D22] hover:text-white transition-all">
                  <Calendar className="w-5 h-5" /> Schedule a Meeting
                </button>
                <button onClick={() => setShowEscalation(false)} className="w-full py-3 text-[#7a6a5f] text-sm hover:text-[#3D2D22] transition-colors">
                  Continue chatting
                </button>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-[#F9F7F5] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#7a6a5f] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#7a6a5f]">Our consultants are RERA licensed. No obligation, just expert advice.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
