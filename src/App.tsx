import React, { useState, useEffect } from 'react';
import LandingScreen from './components/LandingScreen.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import ReportScreen from './components/ReportScreen.tsx';
import { researchService } from './services/researchService.ts';
import type { ResearchResponse } from './services/researchService.ts';
import { Moon, Sun } from 'lucide-react';

type Screen = 'landing' | 'loading' | 'report';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const [topic, setTopic] = useState('');
  const [reportData, setReportData] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGenerate = async (searchTopic: string) => {
    setTopic(searchTopic);
    setError(null);
    setScreen('loading');

    try {
      const data = await researchService.generateReport(searchTopic);
      setReportData(data);
      setScreen('report');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
      setScreen('landing');
    }
  };

  const handleReset = () => {
    setScreen('landing');
    setTopic('');
    setReportData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-2 rounded-full card hover:opacity-80 transition-all z-50 text-text-primary"
        style={{ borderRadius: '9999px', cursor: 'pointer' }}
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {error && (
        <div className="fixed top-6 text-sm font-medium z-50 animate-bounce" style={{ left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {screen === 'landing' && (
        <LandingScreen onGenerate={handleGenerate} />
      )}

      {screen === 'loading' && (
        <LoadingScreen topic={topic} />
      )}

      {screen === 'report' && reportData && (
        <ReportScreen data={reportData} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;
