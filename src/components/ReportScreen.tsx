import React, { useState, useEffect, useRef } from 'react';
import type { ResearchResponse } from '../services/researchService';
import { ChartRenderer } from './ChartRenderer';
import SwotGrid from './SwotGrid';
import { Download, Share2, ArrowLeft, Sparkles, Clock, Globe, Target, TrendingUp, Briefcase, ListChecks } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ReportScreenProps {
  data: ResearchResponse;
  onReset: () => void;
}

const SECTIONS = [
  { id: 'executive_summary', label: 'Executive Summary', icon: ListChecks },
  { id: 'overview', label: 'Market Overview', icon: Globe },
  { id: 'target_market', label: 'Target Market', icon: Target },
  { id: 'competitors', label: 'Competitive Landscape', icon: Briefcase },
  { id: 'trends', label: 'Market Trends', icon: TrendingUp },
  { id: 'business_model', label: 'Business Model', icon: Briefcase },
  { id: 'swot', label: 'SWOT Analysis', icon: Sparkles },
  { id: 'key_takeaways', label: 'Key Takeaways', icon: ListChecks },
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
    <div className="flex bg-bg-primary min-h-screen text-text-primary">
      {/* Sidebar Navigation */}
      <aside className="sidebar-fixed glass no-print hidden lg:flex">
        {/* Sidebar Header: Branding */}
        <div className="p-8 border-b border-border-color">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Sparkles size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight uppercase">MarketInsight</h2>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-[0.2em] opacity-60">Intelligence Hub</p>
            </div>
          </div>

          <button 
            onClick={onReset} 
            className="group flex items-center space-x-2 text-[10px] font-bold text-text-muted hover:text-accent transition-all uppercase tracking-widest border-none bg-none cursor-pointer p-0"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            <span>New Research</span>
          </button>
        </div>

        {/* Sidebar Content: Navigation & Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <div className="px-4 mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold opacity-40">Active Analysis</span>
              <h3 className="text-xs font-bold mt-1 text-text-primary line-clamp-2">{data.topic}</h3>
            </div>
            <nav className="space-y-1">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
                >
                  <section.icon size={16} className="mr-3 opacity-70" />
                  <span>{section.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Stats Block */}
          <div className="px-4 pt-4 border-t border-border-color/50">
            <div className="flex items-center space-x-3 text-text-muted">
              <Clock size={14} className="opacity-50" />
              <span className="text-[10px] uppercase tracking-wider font-medium">{dateStr}</span>
            </div>
            <div className="flex items-center space-x-3 text-text-muted mt-2">
              <ListChecks size={14} className="opacity-50" />
              <span className="text-[10px] uppercase tracking-wider font-medium">{data.sources_count || 0} Sources Verified</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Actions */}
        <div className="p-6 border-t border-border-color space-y-3">
          <button 
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center space-x-2 button-primary py-3 text-xs font-bold uppercase tracking-wider"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
          <button 
            onClick={copyLink}
            className="w-full flex items-center justify-center space-x-2 py-3 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors border border-border-color rounded-lg hover:bg-surface"
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-offset min-h-screen">
        {/* Transparent Header for Mobile or context */}
        <header className="sticky top-0 z-30 no-print glass border-b border-border-color/10 lg:hidden px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles size={18} className="text-accent" />
            <h1 className="text-sm font-bold uppercase tracking-tight">MarketInsight</h1>
          </div>
          <button onClick={onReset} className="text-text-muted hover:text-accent">
            <ArrowLeft size={20} />
          </button>
        </header>

        {/* Report Content Container */}
        <div className="max-w-5xl mx-auto px-6 py-8 lg:px-20 lg:py-16">
          <article ref={reportRef} className="space-y-16 bg-transparent animate-fade-in">
            {/* Report Header */}
            <header className="space-y-10 border-b border-border-color/20 pb-16">
              <div className="space-y-4">
                <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted opacity-60">
                  <span>Market Insight</span>
                  <span className="opacity-30">/</span>
                  <span className="text-accent">Strategic Analysis</span>
                </nav>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-text-primary leading-[1.05]">
                  {data.topic}
                </h1>
              </div>
            </header>

          <div className="space-y-16">
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
              <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[250px] relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-4">Market Segmentation Analysis</div>
                <ChartRenderer type="bar" data={data.charts?.audience_segments || []} />
              </div>
            </section>

            <section id="competitors" className="scroll-mt-12 space-y-10">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Strategic Landscape</h2>
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[250px] relative overflow-hidden">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-4">Competitive Positioning Radar</div>
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
              <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[220px] relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-4">Sector Momentum Score</div>
                <ChartRenderer type="line" data={data.charts?.trend_lines || { labels: [], datasets: [] }} />
              </div>
            </section>

            <section id="business_model" className="scroll-mt-12 space-y-10">
              <h2 className="text-2xl font-bold text-text-primary border-b border-border-color pb-4">Business & Revenue</h2>
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <p className="text-text-muted leading-relaxed">{data.report?.business_model}</p>
                <div className="bg-surface border border-border-color p-8 rounded-2xl glass shadow-sm h-[220px] relative overflow-hidden">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-4">Revenue Streams Breakdown</div>
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
        </article>
      </div>

      <footer className="pt-16 border-t border-border-color text-center no-print pb-24">
            <button onClick={onReset} className="button-primary flex items-center space-x-3 mx-auto px-8 py-4 text-base shadow-xl">
              <ArrowLeft size={20} />
              <span>Start New Analysis</span>
            </button>
          </footer>
        </main>
      </div>
  );
};

export default ReportScreen;
