import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingScreenProps {
  onGenerate: (topic: string) => void;
}

const EXAMPLES = [
  "Notion",
  "AI tools for coaches",
  "Electric vehicle market"
];

const LandingScreen: React.FC<LandingScreenProps> = ({ onGenerate }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGenerate(input.trim());
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 bg-bg-primary text-text-primary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-text-muted">
            <Sparkles size={20} className="text-chart-1" />
            <span className="text-xs font-medium tracking-widest uppercase">AI Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
            Market Research Agent
          </h1>
          <p className="text-text-muted text-lg max-w-lg mx-auto">
            Generate comprehensive, professionally formatted market research reports in seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a business name or market topic..."
            className="w-full py-6 bg-surface card text-xl"
            style={{ paddingLeft: '32px', paddingRight: '160px', outline: 'none' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute button-primary text-base flex items-center space-x-2"
            style={{ right: '12px', top: '12px', bottom: '12px', padding: '0 32px' }}
          >
            <span>Generate</span>
            <Search size={18} />
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => onGenerate(example)}
              className="p-2 py-3 bg-surface card text-sm text-text-muted transition-all"
              style={{ paddingLeft: '16px', paddingRight: '16px', borderRadius: '9999px', cursor: 'pointer' }}
            >
              {example}
            </button>
          ))}
        </div>

        <footer className="pt-12 text-xs text-text-muted font-medium tracking-wider">
          POWERED BY GEMINI + TAVILY
        </footer>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
