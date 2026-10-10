// =============================================
// HARVEST BRIDGE — Grounded Agricultural AI Assistant Page
// English + Telugu, voice input + spoken response readouts
// =============================================

import { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Send, Loader2,
  Bot, User, AlertCircle, Volume2, VolumeX, ShieldCheck
} from 'lucide-react';
import type { AssistantMessage, Language } from '../types';
import { processAssistantQuery } from '../services/ai/assistantEngine';
import { useApp } from '../hooks/useApp';

const QUICK_PROMPTS_EN = [
  'What does high surplus risk mean?',
  'What is the Rescue Window?',
  'How is net farmer earnings calculated?',
  'What government surplus schemes exist in AP?',
  'What is the shelf life of tomatoes in ambient vs cold storage?',
];

const QUICK_PROMPTS_TE = [
  'అధిక మిగులు ప్రమాదం అంటే ఏమిటి?',
  'రెస్క్యూ విండో అంటే ఏమిటి?',
  'నికర ఆదాయం ఎలా లెక్కిస్తారు?',
  'ఆంధ్రప్రదేశ్‌లో రైతులకు అందుబాటులో ఉన్న పథకాలు ఏమిటి?',
];

export default function AssistantPage() {
  const { state, speakText, stopSpeaking } = useApp();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Harvest Bridge AI. I can help you understand surplus risk, buyer matching, net earnings calculations, and government support schemes (e-NAM, Operation Greens, RBK). Ask me anything in English or Telugu. 🌱\n\nనమస్కారం! నేను Harvest Bridge AI. పంట మిగులు ప్రమాదం, కొనుగోలుదారుల సరిపోలిక, మరియు ప్రభుత్వ పథకాల గురించి మీకు సహాయపడగలను.',
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

    await new Promise((r) => setTimeout(r, 400));

    const replyObj = processAssistantQuery(query, language, {
      cropName: state.lastPrediction?.cropName || activeCrop?.cropName,
      surplusRisk: state.lastPrediction?.surplusRisk || activeCrop?.surplusRiskScore,
      location: state.lastPrediction?.location || activeCrop?.location,
    });

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
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-4.5rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-forest-600" />
              Grounded AI Agricultural Assistant
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Knowledge base citing ICAR, Department of Agricultural Marketing AP, and e-NAM guidelines
            </p>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-slate-200/80 rounded-xl p-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                language === 'en' ? 'bg-forest-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                language === 'te' ? 'bg-forest-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              తె
            </button>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(language === 'en' ? QUICK_PROMPTS_EN : QUICK_PROMPTS_TE).map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
              msg.role === 'assistant' ? 'bg-forest-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs space-y-2 ${
              msg.role === 'user'
                ? 'bg-forest-600 text-white rounded-tr-xs font-medium'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
            }`}>
              <div className="whitespace-pre-line">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => handleReadMessage(msg.content)}
                    className="flex items-center gap-1 font-semibold text-forest-700 hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Speak Readout
                  </button>
                  <span>Factual Grounded Source</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 text-forest-600 animate-spin" />
              <span className="text-slate-500 text-xs font-medium">Synthesizing agricultural advisory...</span>
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
              ? 'bg-rose-600 text-white animate-pulse'
              : voiceSupported
              ? 'bg-white border border-slate-300 text-forest-700 hover:bg-slate-50 shadow-xs'
              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={language === 'te' ? 'మీ ప్రశ్న టైప్ చేయండి...' : 'Ask about surplus risk, net earnings, or storage techniques...'}
          className="input flex-1 text-xs sm:text-sm"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="btn-primary w-12 h-12 p-0 flex-shrink-0 rounded-2xl"
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
