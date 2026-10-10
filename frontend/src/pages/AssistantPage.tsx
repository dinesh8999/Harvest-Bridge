// =============================================
// HARVEST BRIDGE — Grounded Agricultural AI Assistant Page
// ChatGPT-Grade Conversational UX with English + Telugu,
// Rich Markdown Parser, Voice Input & Audio Readouts
// =============================================

import { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Send, Loader2,
  Bot, User, Volume2, Sparkles, ShieldCheck
} from 'lucide-react';
import type { AssistantMessage, Language } from '../types';
import { processAssistantQuery } from '../services/ai/assistantEngine';
import { apiClient } from '../services/api';
import { useApp } from '../hooks/useApp';

const QUICK_PROMPTS_EN = [
  'What does high surplus risk mean?',
  'What is the Rescue Window?',
  'How is net farmer earnings calculated?',
  'What government surplus schemes exist in AP?',
  'What is the shelf life of tomatoes in ambient vs cold storage?',
  'Calculate net profit for 2000kg tomato at ₹22/kg with 30km distance',
];

const QUICK_PROMPTS_TE = [
  'అధిక మిగులు ప్రమాదం అంటే ఏమిటి?',
  'రెస్క్యూ విండో అంటే ఏమిటి?',
  'నికర ఆదాయం ఎలా లెక్కిస్తారు?',
  'ఆంధ్రప్రదేశ్‌లో రైతులకు అందుబాటులో ఉన్న పథకాలు ఏమిటి?',
  'టమాటా నిల్వ మార్గదర్శకాలు ఏమిటి?',
];

// Helper to render basic markdown like headers, bold, bullet points, and quotes cleanly
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Horizontal line
        if (trimmed === '---') {
          return <hr key={idx} className="my-2 border-slate-200" />;
        }

        // H3 Header
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="font-bold text-slate-900 text-sm sm:text-base mt-2 mb-1 flex items-center gap-1.5">
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        // H2 / H1 Header
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-bold text-slate-900 text-base sm:text-lg mt-2 mb-1">
              {trimmed.replace(/^#+\s/, '')}
            </h2>
          );
        }

        // Blockquote / Tip
        if (trimmed.startsWith('> ')) {
          return (
            <div key={idx} className="p-2.5 my-1.5 bg-emerald-50/80 border-l-3 border-forest-600 rounded-r-lg text-forest-900 font-medium text-xs">
              {renderInlineStyles(trimmed.replace('> ', ''))}
            </div>
          );
        }

        // Bullet point (unordered)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-forest-600 font-bold mt-0.5">•</span>
              <div className="flex-1">{renderInlineStyles(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered list (e.g. "1. ")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-forest-700 min-w-[1.2rem]">{numMatch[1]}.</span>
              <div className="flex-1">{renderInlineStyles(numMatch[2])}</div>
            </div>
          );
        }

        // Table row fallback display
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const cells = trimmed.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
          if (cells.every((c) => c.match(/^:?-+:?$/))) {
            return null; // separator row
          }
          return (
            <div key={idx} className="grid grid-flow-col auto-cols-fr gap-2 py-1 px-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium">
              {cells.map((cell, cIdx) => (
                <div key={cIdx}>{renderInlineStyles(cell)}</div>
              ))}
            </div>
          );
        }

        // Standard paragraph
        return <p key={idx}>{renderInlineStyles(trimmed)}</p>;
      })}
    </div>
  );
}

// Inline markdown helper for **bold**, *italic*, and `code`
function renderInlineStyles(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-forest-800 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function AssistantPage() {
  const { state, speakText, stopSpeaking } = useApp();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am Harvest Bridge AI. I can help you understand surplus risk, buyer matching, net earnings calculations, and government support schemes (e-NAM, Operation Greens, RBK). Ask me anything in English or Telugu. 🌱\n\nనమస్కారం! నేను Harvest Bridge AI. పంట మిగులు ప్రమాదం, కొనుగోలుదారుల సరిపోలిక, మరియు ప్రభుత్వ పథకాల గురించి మీకు సహాయపడగలను.',
      language: 'en',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>(state.language || 'en');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeCrop = state.crops.find((c) => c.status === 'active') || state.crops[0];

  useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text ?? input.trim();
    if (!query) return;

    const userMsg: AssistantMessage = {
      role: 'user',
      content: query,
      language,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const contextPayload = {
      cropName: state.lastPrediction?.cropName || activeCrop?.cropName || 'Tomato',
      surplusRisk: state.lastPrediction?.surplusRisk || activeCrop?.surplusRiskScore || 78,
      location: state.lastPrediction?.location || activeCrop?.location || 'Chittoor, AP',
      farmerName: state.currentUser?.name || 'Farmer',
    };

    try {
      // 1. First attempt backend conversational AI service
      const response = await apiClient.sendAssistantMessage(query, language, contextPayload);
      if (response && response.content) {
        const botMsg: AssistantMessage = {
          role: 'assistant',
          content: response.content,
          language,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // Graceful fallback to client-side engine if backend unreachable
    }

    // 2. Client-side Grounded Engine
    await new Promise((r) => setTimeout(r, 250));
    const replyObj = processAssistantQuery(query, language, contextPayload);

    const botMsg: AssistantMessage = {
      role: 'assistant',
      content: replyObj.content,
      language,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  const startListening = () => {
    if (!voiceSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-US';
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleReadMessage = (content: string) => {
    if (state.isSpeaking) {
      stopSpeaking();
    } else {
      speakText(content);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 h-[calc(100vh-4.5rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-800 via-forest-700 to-ai-600 text-white flex items-center justify-center shadow-glow-forest flex-shrink-0">
              <Bot className="w-5 h-5 text-ai-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-bold text-slate-900">
                  Grounded AI Agricultural Assistant
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-ai-50 text-ai-700 border border-ai-200 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-ai-600" /> Neural v2.5
                </span>
              </div>
              <p className="text-slate-500 text-[11px] sm:text-xs">
                Verified with ICAR, AP Agricultural Marketing Board & e-NAM Mandi Standards
              </p>
            </div>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-slate-100/90 rounded-xl p-1 shadow-inner self-start sm:self-auto">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'en' ? 'bg-forest-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'te' ? 'bg-forest-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto pr-1">
        {(language === 'en' ? QUICK_PROMPTS_EN : QUICK_PROMPTS_TE).map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 bg-white hover:bg-ai-50/70 hover:border-ai-300 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs text-left flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-ai-600 flex-shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-forest-800 to-ai-600 text-white ring-2 ring-ai-100 shadow-glow-forest'
                  : 'bg-slate-800 text-white shadow-2xs'
              }`}
            >
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-ai-200" /> : <User className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] px-4 py-3.5 rounded-2xl shadow-xs space-y-2 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-white rounded-tr-xs font-medium'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs'
              }`}
            >
              {msg.role === 'assistant' ? (
                <FormattedMessage text={msg.content} />
              ) : (
                <div className="whitespace-pre-line text-xs sm:text-sm">{msg.content}</div>
              )}

              {msg.role === 'assistant' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => handleReadMessage(msg.content)}
                    className="flex items-center gap-1 font-semibold text-forest-700 hover:text-forest-800 hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-ai-600" /> Speak Readout
                  </button>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Grounded Neural Source
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-800 to-ai-600 text-white flex items-center justify-center ring-2 ring-ai-100 shadow-glow-forest">
              <Bot className="w-4 h-4 text-ai-200" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-2xs">
              <Loader2 className="w-4 h-4 text-ai-600 animate-spin" />
              <span className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-ai-500 animate-pulse" />
                Synthesizing grounded agricultural advisory...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!voiceSupported}
          title={voiceSupported ? 'Voice input' : 'Voice not supported in this browser'}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg'
              : voiceSupported
              ? 'bg-white border border-slate-300 text-forest-700 hover:bg-slate-50 shadow-2xs'
              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            language === 'te'
              ? 'మీ ప్రశ్న టైప్ చేయండి (ఉదా: "హాయ్", "నికర ఆదాయం లెక్కింపు")...'
              : 'Ask about surplus risk, net earnings, storage techniques, or type "hi"...'
          }
          className="input flex-1 text-xs sm:text-sm focus:ring-ai-500/80 focus:border-ai-500"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="btn-ai w-12 h-12 p-0 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {isListening && (
        <div className="text-center text-xs text-rose-600 mt-2 font-bold animate-pulse">
          🎙️ Listening... speak in {language === 'te' ? 'Telugu' : 'English'}
        </div>
      )}
    </div>
  );
}

