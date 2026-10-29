import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, HelpCircle } from 'lucide-react';
import { VehicleInput } from '../types';
import { explainPrediction } from '../api';

interface AiChatAssistantProps {
  vehicle: VehicleInput | null;
  predictedPrice: number | null;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
}

const QUICK_QUESTIONS = [
  "How does this mileage affect my negotiation?",
  "What is the difference between clean and salvage titles?",
  "What mechanical checks should I do before buying?",
  "How much can vehicle condition change this price?"
];

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ vehicle, predictedPrice }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your AutoWise AI Assistant. Once you estimate a vehicle's price, you can ask me any follow-up questions regarding the valuation, mileage impact, negotiation, or mechanical due-diligence.",
      source: 'rule_based_engine'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleSend = async (questionText: string) => {
    if (!questionText.trim()) return;
    if (!vehicle || predictedPrice === null) {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: questionText },
        { sender: 'assistant', text: "Please submit vehicle details above first to generate a predicted price before asking follow-up valuation questions." }
      ]);
      setInputQuery('');
      return;
    }

    const q = questionText.trim();
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setIsAsking(true);

    try {
      const resp = await explainPrediction(vehicle, predictedPrice, q);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: resp.summary,
          source: resp.explanation_source
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Apologies, I encountered an issue retrieving the response: ${err.message || 'Server error'}. Please try again.`
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-charcoal-700/60 flex flex-col h-[480px]">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-charcoal-800 shrink-0">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-brand-cyan" />
          <h3 className="text-base font-bold text-white">AI Valuation Q&A Assistant</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Interactive Valuation Guidance
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
        <span className="text-[11px] text-slate-500 flex items-center gap-1 self-center">
          <HelpCircle className="w-3 h-3 text-slate-400" /> Suggestions:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            disabled={isAsking}
            onClick={() => handleSend(q)}
            className="text-[11px] px-2.5 py-1 rounded-md bg-charcoal-900 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-800 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-brand-copper/20 text-brand-copper flex items-center justify-center shrink-0 border border-brand-copper/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-brand-copper/20 text-slate-100 border border-brand-copper/30 rounded-tr-none'
                  : 'bg-charcoal-900 border border-charcoal-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.text}
              {m.source && (
                <div className="mt-1.5 pt-1.5 border-t border-charcoal-800 text-[10px] text-slate-500 font-mono">
                  Engine: {m.source}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-md bg-charcoal-800 text-slate-300 flex items-center justify-center shrink-0 border border-charcoal-700">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isAsking && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
            <div className="w-3 h-3 border-2 border-brand-copper border-t-transparent rounded-full animate-spin" />
            <span>Consulting explanation service...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="mt-3 pt-3 border-t border-charcoal-800 shrink-0 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder={vehicle ? "Ask a question about this valuation..." : "Submit vehicle first to ask questions..."}
          disabled={isAsking}
          className="flex-1 bg-charcoal-900 border border-charcoal-700 focus:border-brand-copper rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
        />
        <button
          type="submit"
          disabled={isAsking || !inputQuery.trim()}
          className="p-2 rounded-xl bg-brand-copper hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
