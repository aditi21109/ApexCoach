import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Dumbbell, Loader2, ArrowRight } from 'lucide-react';
import { coachService } from '../services/api';

const QUICK_PROMPTS = [
  "Analyze my training frequency",
  "Am I training legs enough?",
  "Check my weight progression"
];

export default function AICoach({ userId, workoutCount }) {
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: "Hello! I'm **Aegis**, your AI Fitness Coach. I can analyze your workout history, track lift progressions, identify imbalanced muscle splits, and offer personalized, science-backed workout plans.\n\nWhat can I help you achieve today?",
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await coachService.askCoach(userId, textToSend);
      
      const coachMessage = {
        sender: 'coach',
        text: response.response,
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        sender: 'coach',
        text: "Sorry, I ran into an issue communicating with my analytical engine. Please check your network connection or try again later.",
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\/g/, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  return (
    <div className="light-panel flex flex-col h-[480px] overflow-hidden animate-fade-in">
      {/* Coach Header */}
      <div className="p-4 bg-[#FAF6EE]/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-[#131313] rounded-xl text-[#FAF6EE]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#131313] tracking-wide">Aegis AI Coach</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Virtual Coach</p>
          </div>
        </div>
        <div className="text-[9px] text-[#131313] font-bold bg-[#FBE39A] px-2.5 py-1 rounded-full">
          {workoutCount} logs loaded
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#FAF6EE]/20">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`p-2 rounded-xl h-7 w-7 flex items-center justify-center shrink-0 text-xs ${
              msg.sender === 'user' ? 'bg-slate-200 text-slate-700' : 'bg-[#131313] text-[#FAF6EE]'
            }`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Dumbbell className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div className="space-y-0.5">
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#131313] text-[#FAF6EE] font-semibold rounded-tr-none'
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                {msg.sender === 'user' ? (
                  msg.text
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                )}
              </div>
              <p className={`text-[9px] text-slate-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="p-2 rounded-xl h-7 w-7 flex items-center justify-center shrink-0 bg-[#131313] text-[#FAF6EE]">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none text-slate-400 text-xs flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
              <span>Aegis is analyzing telemetry...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && !loading && (
        <div className="px-4 py-2 border-t border-slate-50 bg-[#FAF6EE]/30">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="text-[10px] bg-white border border-slate-200 hover:border-[#131313] transition duration-150 px-2.5 py-1 rounded-full text-slate-600 font-semibold flex items-center gap-1 group"
              >
                <span>{prompt}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition duration-150" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Send Input Panel */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
        className="p-3 bg-[#FAF6EE]/50 border-t border-slate-50 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask about target muscle progressions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-grow bg-white border border-slate-200 focus:border-[#131313] rounded-xl px-3 py-2.5 text-xs outline-none text-slate-800 placeholder-slate-400 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-[#131313] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#FAF6EE] p-2.5 rounded-xl transition duration-150 flex items-center justify-center font-bold active:scale-[0.96]"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
