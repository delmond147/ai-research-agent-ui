import React, { useState, useEffect, useRef } from 'react';
import type { ResearchResponse } from '../services/researchService';
import { ChartRenderer } from './ChartRenderer';
import SwotGrid from './SwotGrid';
import { Download, Link, ArrowLeft } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ReportScreenProps {
  data: ResearchResponse;
  onReset: () => void;
}

const SECTIONS = [
  { id: 'executive_summary', label: 'Executive Summary' },
  { id: 'overview', label: 'Market Overview' },
  { id: 'target_market', label: 'Target Market' },
  { id: 'competitors', label: 'Competitive Landscape' },
  { id: 'trends', label: 'Market Trends' },
  { id: 'business_model', label: 'Business Model' },
  { id: 'swot', label: 'SWOT Analysis' },
  { id: 'key_takeaways', label: 'Key Takeaways' },
];

const ReportScreen: React.FC<ReportScreenProps> = ({ data, onReset }) => {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const reportRef = useRef<HTMLDivElement>(null);

  // Safety guard
  if (!data || !data.report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6 bg-bg-primary">
         <div className="text-5xl">⚠️</div>
         <h1 className="text-2xl font-bold text-text-primary">Incomplete Data</h1>
         <p className="text-text-muted max-w-sm mx-auto">The research for this topic returned insufficient results. Please try a different query.</p>
         <button onClick={onReset} className="button-primary flex items-center space-x-2 px-6 py-3">
           <ArrowLeft size={18} />
           <span>Back to Search</span>
         </button>
      </div>
    );
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `Research_${data.topic.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt as any).from(element).save();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Report link copied!');
  };

  const dateStr = data.generated_at ? new Date(data.generated_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString();

  return (
    <div className="flex bg-bg-primary min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="sidebar-fixed glass hidden lg:block p-8 overflow-y-auto no-print">
        <div className="space-y-12">
          <button onClick={onReset} className="flex items-center space-x-2 text-xs font-bold text-text-muted hover:text-accent transition-all uppercase tracking-widest border-none bg-none cursor-pointer">
            <ArrowLeft size={14} />
            <span>New Research</span>
          </button>
          
          <div className="space-y-6">
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold opacity-50">Report Structure</div>
            <nav className="flex flex-col space-y-4">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`text-sm transition-all no-underline ${
                    activeSection === section.id 
                    ? 'text-text-primary font-bold border-l-2 border-accent pl-4' 
                    : 'text-text-muted border-l-2 border-transparent pl-4 hover:text-text-primary'
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="pt-8 border-t border-border-color">
             <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center space-x-2 button-primary py-3"
              >
                <Download size={16} />
                <span>Export PDF</span>
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 main-content-offset py-12 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto space-y-20" ref={reportRef}>
          {/* McKinsey-grade Header */}
          <header className="space-y-8 pb-12 border-b border-border-color">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-bold text-text-muted">
                  <span className="text-accent">Market Insight</span>
                  <span>/</span>
                  <span className="text-text-primary">{data.topic}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary capitalize">
                  {data.topic} Strategic Analysis
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-text-muted">
                  <span className="bg-surface border border-border-color px-3 py-1 rounded-full">Proprietary Intel</span>
                  <span>•</span>
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>{data.sources_count || 0} Sources Verified</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 no-print">
                <button
                  onClick={copyLink}
                  className="bg-surface border border-border-color p-3 rounded-xl hover:bg-bg-primary transition-all shadow-sm"
                  title="Copy Link"
                >
                  <Link size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-24">
            {/* Executive Summary as a Premium Callout */}
            <section id="executive_summary" className="scroll-mt-12">
               <div className="bg-accent/10 border-l-4 border-accent p-10 rounded-r-2xl glass">
                <p className="text-xl leading-relaxed text-text-primary italic font-medium">
                  "{data.report?.executive_summary}"
                </p>
              </div>
            </section>

            <section id="overview" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Market Overview</h2>
              <p className="text-text-muted text-lg leading-relaxed">{data.report?.overview}</p>
            </section>

            <section id="target_market" className="scroll-mt-12 space-y-10">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Target Audience</h2>
                <p className="text-text-muted leading-relaxed">{data.report?.target_market}</p>
              </div>
              <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[350px] relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-6">Market Segmentation Analysis</div>
                <ChartRenderer type="bar" data={data.charts?.audience_segments || []} />
              </div>
            </section>

            <section id="competitors" className="scroll-mt-12 space-y-10">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Strategic Landscape</h2>
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[380px] relative overflow-hidden">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-6">Competitive Positioning Radar</div>
                  <ChartRenderer type="radar" data={data.charts?.competitive_radar || { labels: [], datasets: [] }} />
                </div>
                <div className="bg-accent/5 border border-border-color p-8 rounded-2xl space-y-6">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-accent">Landscape Summary</div>
                  <p className="text-base text-text-muted leading-relaxed">{data.report?.competitors}</p>
                </div>
              </div>
            </section>

            <section id="trends" className="scroll-mt-12 space-y-10">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Growth Trajectory</h2>
                <p className="text-text-muted leading-relaxed">{data.report?.trends}</p>
              </div>
              <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[320px] relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-6">Sector Momentum Score</div>
                <ChartRenderer type="line" data={data.charts?.trend_lines || { labels: [], datasets: [] }} />
              </div>
            </section>

            <section id="business_model" className="scroll-mt-12 space-y-10">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Business & Revenue</h2>
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <p className="text-text-muted leading-relaxed">{data.report?.business_model}</p>
                <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[280px] relative overflow-hidden">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-6">Revenue Streams Breakdown</div>
                  <ChartRenderer type="donut" data={data.charts?.revenue_breakdown || []} />
                </div>
              </div>
            </section>

            <section id="swot" className="scroll-mt-12 space-y-10">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">SWOT Analysis</h2>
              <SwotGrid swot={data.report?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] }} />
            </section>

            <section id="key_takeaways" className="scroll-mt-12 space-y-10">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Strategic Key Takeaways</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {(() => {
                  const raw = data.report?.key_takeaways;
                  const takeaways = Array.isArray(raw) 
                    ? raw 
                    : (typeof raw === 'string' ? raw.split(/[•\-\n\.]/) : []);
                  
                  return takeaways
                    .filter(t => t && t.trim().length > 10)
                    .map(t => t.trim())
                    .filter((value, index, self) => self.indexOf(value) === index) // Unique
                    .slice(0, 4)
                    .map((text, i) => (
                      <div key={i} className="flex gap-6 bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm hover:translate-y-[-4px] transition-all">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed">{text}</p>
                      </div>
                    ));
                })()}
              </div>
            </section>
          </div>

          <footer className="pt-16 border-t border-border-color text-center no-print pb-24">
            <button onClick={onReset} className="button-primary flex items-center space-x-3 mx-auto px-8 py-4 text-base shadow-xl">
              <ArrowLeft size={20} />
              <span>Start New Analysis</span>
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ReportScreen;
