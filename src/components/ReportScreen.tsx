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

  // Ultimate safety guard
  if (!data || !data.report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6 bg-bg-primary">
         <div className="text-4xl">⚠️</div>
         <h1 className="text-2xl font-medium text-text-primary">Incomplete Report Data</h1>
         <p className="text-text-muted max-w-md">We couldn't generate a full report for this topic. Please try a different query.</p>
         <button onClick={onReset} className="button-primary flex items-center space-x-2">
           <ArrowLeft size={18} />
           <span>Try Again</span>
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
      { threshold: 0.2 }
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
      filename: `${data.topic.replace(/\s+/g, '_')}_Report.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 1200 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  };

  // Safe Date string
  const dateStr = data.generated_at ? new Date(data.generated_at).toDateString() : new Date().toDateString();

  return (
    <div className="flex bg-bg-primary min-h-screen">
      {/* Sidebar TOC - Desktop Only */}
      <aside className="fixed h-full bg-surface p-8 overflow-y-auto z-10 hidden lg:block" style={{ width: '220px', borderRight: '0.5px solid var(--border-color)' }}>
        <div style={{ marginBottom: '48px' }}>
          <button onClick={onReset} className="flex items-center space-x-2 text-xs font-medium text-text-muted hover:text-text-primary transition-all" style={{ marginBottom: '32px', border: 'none', background: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={14} />
            <span>NEW RESEARCH</span>
          </button>
          
          <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Contents</div>
          <nav className="space-y-4">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`block text-sm transition-all text-decoration-none ${activeSection === section.id ? 'text-text-primary font-semibold border-l-2 border-accent pl-3' : 'text-text-muted border-l-2 border-transparent pl-3'}`}
                style={{ paddingBottom: '4px' }}
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6 lg:ml-[220px] lg:px-16">
        <div className="max-w-4xl mx-auto space-y-20" ref={reportRef}>
          {/* Header */}
          <header className="space-y-8 pb-8 border-b border-border-color">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-text-muted">
                  <span className="font-semibold text-accent">Market Insight</span>
                  <span>/</span>
                  <span className="capitalize">{data.topic}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-text-primary capitalize">
                  {data.topic} Analysis
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-medium">
                  <span className="bg-surface border border-border-color px-2 py-1 rounded">Report Generated</span>
                  <span>•</span>
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>{data.sources_count || 0} Sources Verified</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 no-print">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 bg-surface border border-border-color px-4 py-2 rounded-lg text-sm font-medium hover:bg-bg-secondary transition-all"
                >
                  <Download size={16} />
                  <span>PDF Export</span>
                </button>
                <button
                  onClick={copyLink}
                  className="bg-surface border border-border-color p-2 rounded-lg hover:bg-bg-secondary transition-all"
                >
                  <Link size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-24">
            <section id="executive_summary" className="scroll-mt-12">
              <div className="pl-6 border-l-4 border-accent bg-surface/30 p-8 rounded-r-xl">
                <p className="text-lg leading-relaxed text-text-primary italic">
                  "{data.report?.executive_summary || 'Executive summary pending data validation.'}"
                </p>
              </div>
            </section>

            <section id="overview" className="scroll-mt-12 space-y-6">
              <h2 className="text-2xl font-medium text-text-primary border-b border-border-color pb-4">Market Overview</h2>
              <p className="text-text-muted leading-relaxed">{data.report?.overview}</p>
            </section>

            <section id="target_market" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium text-text-primary border-b border-border-color pb-4">Target Audience</h2>
              <p className="text-text-muted leading-relaxed">{data.report?.target_market}</p>
              <div className="bg-surface border border-border-color p-8 rounded-xl h-[300px] relative overflow-hidden">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Market Share Distribution</div>
                <ChartRenderer type="bar" data={data.charts?.audience_segments || []} />
              </div>
            </section>

            <section id="competitors" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium text-text-primary border-b border-border-color pb-4">Strategic Landscape</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-surface border border-border-color p-8 rounded-xl h-[350px] relative overflow-hidden">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Positioning Radar</div>
                  <ChartRenderer type="radar" data={data.charts?.competitive_radar || { labels: [], datasets: [] }} />
                </div>
                <div className="bg-surface border border-border-color p-8 rounded-xl space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Analysis Summary</div>
                  <p className="text-sm text-text-muted leading-relaxed">{data.report?.competitors}</p>
                </div>
              </div>
            </section>

            <section id="trends" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium text-text-primary border-b border-border-color pb-4">Growth Trajectory</h2>
              <p className="text-text-muted leading-relaxed">{data.report?.trends}</p>
              <div className="bg-surface border border-border-color p-8 rounded-xl h-[280px] relative overflow-hidden">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Relative Sector Growth</div>
                <ChartRenderer type="line" data={data.charts?.trend_lines || { labels: [], datasets: [] }} />
              </div>
            </section>

            <section id="business_model" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium text-text-primary border-b border-border-color pb-4">Business & Revenue</h2>
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <p className="text-text-muted leading-relaxed">{data.report?.business_model}</p>
                <div className="bg-surface border border-border-color p-8 rounded-xl h-[240px] relative overflow-hidden">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">Revenue Mix</div>
                  <ChartRenderer type="donut" data={data.charts?.revenue_breakdown || []} />
                </div>
              </div>
            </section>

            <section id="swot" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium text-text-primary border-b border-border-color pb-4">SWOT Matrix</h2>
              <SwotGrid swot={data.report?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] }} />
            </section>

            <section id="key_takeaways" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium text-text-primary border-b border-border-color pb-4">Key Takeaways</h2>
              <div className="grid gap-6">
                {(data.report?.key_takeaways || "").split(/[•\-\n\.]/).filter(t => t.trim().length > 10).slice(0, 4).map((text, i) => (
                  <div key={i} className="flex gap-6 bg-surface border border-border-color p-8 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                      {i + 1}
                    </div>
                    <p className="flex-1 text-sm text-text-muted leading-relaxed">{text.trim()}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <footer className="pt-12 border-t border-border-color text-center no-print">
            <button onClick={onReset} className="button-primary flex items-center space-x-2 mx-auto">
              <ArrowLeft size={18} />
              <span>New Analysis</span>
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ReportScreen;
