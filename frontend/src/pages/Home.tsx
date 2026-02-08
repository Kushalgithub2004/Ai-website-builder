import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sparkles, Code2, AlertTriangle } from 'lucide-react';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('gemini'); // 'gemini' or 'anthropic'
  const navigate = useNavigate();

  useEffect(() => {
    const storedKey = localStorage.getItem('llm_api_key');
    const storedProvider = localStorage.getItem('llm_provider');
    if (storedKey) setApiKey(storedKey);
    if (storedProvider) setProvider(storedProvider);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      localStorage.setItem('llm_api_key', apiKey);
      localStorage.setItem('llm_provider', provider);
      navigate('/builder', { state: { prompt, provider } });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse"></div>
              <Wand2 className="w-16 h-16 text-white relative z-10" />
            </div>
          </div>
          <h1 className="text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Prompt, click, and watch your dream website come to life.
            Powered by advanced AI to turn your ideas into production-ready code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          {/* Model Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setProvider('gemini')}
              className={`p-4 rounded-xl border transition-all ${provider === 'gemini'
                ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'bg-gray-900 border-white/10 hover:border-white/20'
                }`}
            >
              <div className="font-semibold text-white">Google Gemini</div>
              <div className="text-xs text-gray-400 mt-1">Free Tier Available</div>
            </button>
            <button
              type="button"
              onClick={() => setProvider('anthropic')}
              className={`p-4 rounded-xl border transition-all ${provider === 'anthropic'
                ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'bg-gray-900 border-white/10 hover:border-white/20'
                }`}
            >
              <div className="font-semibold text-white">Anthropic Claude</div>
              <div className="text-xs text-gray-400 mt-1">High Performance</div>
            </button>
          </div>

          {/* API Key Input */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-30 group-hover:opacity-75 transition duration-500 blur"></div>
            <div className="relative bg-gray-900 rounded-xl p-1">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'Anthropic'} API Key (Required)`}
                className="w-full bg-black/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-0 placeholder-gray-500 border border-white/10"
                required
              />
            </div>
            {/* Warning Note */}
            <div className="absolute top-full left-0 mt-2 text-xs text-orange-400 flex items-center gap-1 opacity-80">
              <AlertTriangle className="w-3 h-3" />
              <span>Ensure the key matches the selected provider ({provider === 'gemini' ? 'Google AI Studio' : 'Anthropic Console'}).</span>
            </div>
          </div>

          <div className="relative group pt-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-1000 blur group-hover:blur-md"></div>
            <div className="relative bg-gray-900 rounded-2xl p-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your perfect website..."
                className="w-full h-40 p-6 bg-black/50 text-lg text-white border-0 rounded-xl focus:ring-0 resize-none placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-white text-black text-lg font-bold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-blue-600" />
            Generate Website Plan
          </button>
        </form>

        <div className="mt-16 flex justify-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span>Export to React/Node</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Generation</span>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2025 Kushal. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}