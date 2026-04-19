import React, { useState, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import LandingScreen from './components/LandingScreen';
import LoadingScreen from './components/LoadingScreen';
import ReportScreen from './components/ReportScreen';
import { researchService } from './services/researchService';
import type { ResearchResponse } from './services/researchService';
import { Moon, Sun } from 'lucide-react';

// Specialized Error Boundary to expose hidden crashes
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("DEBUG CATCH:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#0F172A', color: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🧨</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>Renderer Exception</h1>
          <p style={{ maxWidth: '500px', marginBottom: '32px', color: '#94A3B8' }}>The application encountered a runtime error while building the report. Please share the details below.</p>
          <div style={{ background: '#1E293B', padding: '24px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'left', marginBottom: '32px', width: '100%', maxWidth: '700px', overflowX: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <code style={{ fontSize: '13px', color: '#F1F5F9', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{this.state.error?.stack || this.state.error?.message}</code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '12px 32px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            Restart Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      console.log("DEBUG API RESULT:", data);
      setReportData(data);
      setScreen('report');
    } catch (err: any) {
      console.error("DEBUG API ERROR:", err);
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
    <ErrorBoundary>
      <div className="min-h-screen">
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
    </ErrorBoundary>
  );
};

export default App;
