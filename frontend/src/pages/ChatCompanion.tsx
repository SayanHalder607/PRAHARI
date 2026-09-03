import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Send,
  Sparkles,
  Heart,
  Wind,
  Activity,
  Lock,
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  psi_context?: {
    psi_score: number;
    risk_tier: string;
    trend: string;
  };
}

interface OllamaStatus {
  connected: boolean;
  active_model?: string;
}

interface WellnessSummary {
  psi_score: number;
  trend: string;
  factors: Record<string, any>;
  summary: string;
}

const ChatCompanion: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({ connected: false });
  const [wellnessSummary, setWellnessSummary] = useState<WellnessSummary | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCount, setBreathingCount] = useState(4);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message tailored to user
  useEffect(() => {
    const initialGreeting = `Jai Hind, ${user?.username || 'soldier'}. I am PRAHARI Guardian, your confidential welfare companion. Our conversation is 100% private, non-punitive, and will never affect your duty postings or evaluations. How are you feeling today?`;
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    fetchStatus();
    fetchSummary();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Box Breathing cycle
  useEffect(() => {
    if (!showBreathing) return;
    const phases: Array<'Inhale' | 'Hold' | 'Exhale'> = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    let idx = 0;
    let sec = 4;

    const interval = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        idx = (idx + 1) % 4;
        setBreathingPhase(phases[idx]);
        sec = 4;
      }
      setBreathingCount(sec);
    }, 1000);

    return () => clearInterval(interval);
  }, [showBreathing]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/chat/status');
      setOllamaStatus(res.data);
    } catch {
      setOllamaStatus({ connected: false });
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/chat/summary');
      setWellnessSummary(res.data);
    } catch (err) {
      console.error('Failed to load wellness summary', err);
    }
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post('/chat/message', {
        message: textToSend,
        history,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        psi_context: res.data.psi_context,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I received your message, but the local reasoning engine encountered a brief delay. Remember to hydrate and practice steady abdominal breathing. How is your physical fatigue feeling?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Feeling exhausted after night duty, mind is racing.',
    'Guide me through a 2-minute tactical decompression reset.',
    'Explain what my current stress score means.',
    'Trouble sleeping in the barracks due to ambient noise.',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Top Banner Header */}
      <div className="glass rounded-xl p-4 flex items-center justify-between border border-gray-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-wide">PRAHARI AI Companion</h1>
              <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded border border-brand-500/30 font-medium">
                DEFENSE WELFARE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Confidential, non-punitive emotional & operational fatigue support.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Ollama Model Status Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-900/80 border border-gray-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                ollamaStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-gray-300">
              {ollamaStatus.connected ? `Ollama (${ollamaStatus.active_model})` : 'Ollama Offline'}
            </span>
          </div>

          {/* Real-time PSI score badge */}
          {wellnessSummary && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-brand-500/30 text-xs">
              <Activity className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-gray-400 font-medium">LIVE PSI:</span>
              <span className="text-brand-300 font-bold font-mono">
                {wellnessSummary.psi_score.toFixed(1)}
              </span>
            </div>
          )}

          {/* Tactical Breathing Modal Trigger */}
          <button
            onClick={() => setShowBreathing(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition text-xs font-semibold"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Box Breathing</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Left Column: Telemetry & Confidentiality Card */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          {wellnessSummary && (
            <div className="glass rounded-xl p-4 border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Telemetry Briefing
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded capitalize">
                  {wellnessSummary.trend}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {wellnessSummary.summary}
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Contributing Factors
                </span>
                {Object.entries(wellnessSummary.factors).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center text-xs bg-gray-900/50 px-2.5 py-1.5 rounded border border-gray-800/60"
                  >
                    <span className="text-gray-400">{key}</span>
                    <span className="text-brand-300 font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-Punitive Guarantee Box */}
          <div className="glass rounded-xl p-4 border border-emerald-500/20 bg-emerald-950/10 space-y-2 mt-auto">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Welfare Guarantee</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your conversations with PRAHARI Guardian are strictly confidential. No disclosures or stress ratings are ever shared with promotion committees or used for disciplinary action.
            </p>
          </div>
        </div>

        {/* Center/Right Column: Interactive Chat Area */}
        <div className="lg:col-span-3 glass rounded-xl flex flex-col border border-gray-800/80 overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white border border-brand-400/50'
                      : 'bg-gray-800 text-brand-400 border border-gray-700'
                  }`}
                >
                  {msg.role === 'user' ? '🎖️' : '🛡️'}
                </div>

                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-brand-600/30 border-brand-500/40 text-gray-100 rounded-tr-none'
                      : 'bg-gray-900/90 border-gray-800 text-gray-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-4 mb-1 text-[11px] text-gray-400">
                    <span className="font-semibold text-gray-300">
                      {msg.role === 'user' ? user?.username || 'Personnel' : 'PRAHARI Guardian'}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{msg.timestamp}</span>
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Context tag if PSI was integrated */}
                  {msg.psi_context && (
                    <div className="mt-2 pt-2 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="text-brand-400 font-mono">
                        Telemetried PSI: {msg.psi_context.psi_score.toFixed(1)}/100
                      </span>
                      <span className="capitalize">{msg.psi_context.trend} trend</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm text-brand-400">
                  🛡️
                </div>
                <div className="bg-gray-900/90 border border-gray-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-2 text-xs text-gray-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  <span>PRAHARI Guardian is analyzing operational telemetry & formulating response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-gray-800/60 bg-gray-950/40 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap uppercase">
              Quick Scenarios:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs whitespace-nowrap transition disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-gray-800 bg-gray-950/70">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your fatigue level, operational stressors, or ask for tactical coping..."
                disabled={loading}
                className="flex-1 bg-gray-900/90 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tactical Box Breathing Overlay Modal */}
      {showBreathing && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowBreathing(false)}
        >
          <div
            className="glass max-w-md w-full rounded-2xl p-6 border border-gray-700/80 space-y-6 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Tactical Box Breathing (4-4-4-4)</h3>
              </div>
              <button
                onClick={() => setShowBreathing(false)}
                className="text-gray-400 hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Tactical autonomic reset protocol used by special forces. Resets heart rate variability and lowers acute adrenaline spikes.
            </p>

            {/* Breathing Animator Circle */}
            <div className="relative w-48 h-48 flex items-center justify-center my-4">
              <div
                className={`w-36 h-36 rounded-full border-4 border-blue-500/80 bg-blue-500/10 flex flex-col items-center justify-center transition-transform duration-1000 ${
                  breathingPhase === 'Inhale'
                    ? 'scale-125 shadow-2xl shadow-blue-500/40'
                    : breathingPhase === 'Exhale'
                    ? 'scale-90 shadow-none'
                    : 'scale-110 shadow-lg shadow-blue-500/20'
                }`}
              >
                <span className="text-base font-bold text-blue-300 tracking-wider">
                  {breathingPhase}
                </span>
                <span className="text-3xl font-mono font-extrabold text-white">
                  {breathingCount}s
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              <div
                className={`p-2.5 rounded-lg border text-center ${
                  breathingPhase === 'Inhale'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-semibold'
                    : 'border-gray-800 text-gray-400'
                }`}
              >
                1. INHALE (4s)
              </div>
              <div
                className={`p-2.5 rounded-lg border text-center ${
                  breathingPhase === 'Hold' && breathingCount === 4
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-semibold'
                    : 'border-gray-800 text-gray-400'
                }`}
              >
                2. HOLD (4s)
              </div>
              <div
                className={`p-2.5 rounded-lg border text-center ${
                  breathingPhase === 'Exhale'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold'
                    : 'border-gray-800 text-gray-400'
                }`}
              >
                3. EXHALE (4s)
              </div>
              <div
                className={`p-2.5 rounded-lg border text-center ${
                  breathingPhase === 'Hold' && breathingCount !== 4
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-semibold'
                    : 'border-gray-800 text-gray-400'
                }`}
              >
                4. HOLD (4s)
              </div>
            </div>

            <button
              onClick={() => setShowBreathing(false)}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Finish Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatCompanion;
