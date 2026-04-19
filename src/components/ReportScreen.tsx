import React, { useState, useEffect, useRef } from 'react';
import type { ResearchResponse } from '../services/researchService.ts';
import { ChartRenderer } from './ChartRenderer.tsx';
import SwotGrid from './SwotGrid.tsx';
import { Download, Link as LinkIcon, ArrowLeft } from 'lucide-react';
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

  // Safety guard: If data structure is invalid, show graceful error instead of crashing
  if (!data || !data.report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-2xl font-medium text-text-primary">Unable to display report</h1>
        <p className="text-text-muted max-w-md">There was an issue processing the research data. Please try generating a new report.</p>
        <button onClick={onReset} className="button-primary flex items-center space-x-2">
          <ArrowLeft size={18} />
          <span>Research another topic</span>
        </button>
      </div>
    );
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(prev => {
              if (prev !== entry.target.id) return entry.target.id;
              return prev;
            });
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

    // Add a loading state if needed, but for now just trigger
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${data.topic.replace(/\s+/g, '_')}_Market_Report.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 1200
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard');
  };

  return (
    <div className="flex bg-bg-primary min-h-screen">
      {/* Sidebar TOC - Desktop Only */}
      <aside className="fixed h-full bg-surface p-8 overflow-y-auto z-10" style={{ width: '220px', borderRight: '0.5px solid var(--border-color)', display: 'none' }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          @media (min-width: 1024px) {
            aside { display: block !important; }
          }
        ` }} />
        <div style={{ marginBottom: '48px' }}>
          <button onClick={onReset} className="flex items-center space-x-2 text-xs font-medium text-text-muted transition-all" style={{ marginBottom: '32px', border: 'none', background: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={14} />
            <span>NEW RESEARCH</span>
          </button>
          <div className="text-xs uppercase tracking-widest text-text-muted font-semibold" style={{ fontSize: '10px', marginBottom: '16px' }}>Table of Contents</div>
          <nav className="space-y-6">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm transition-all"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  textDecoration: 'none',
                  color: activeSection === section.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: activeSection === section.id ? '600' : '450',
                  paddingLeft: activeSection === section.id ? '12px' : '0',
                  borderLeft: activeSection === section.id ? '2px solid var(--accent)' : 'none',
                  opacity: activeSection === section.id ? 1 : 0.8,
                  marginBottom: '16px'
                }}
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6" style={{ marginLeft: window.innerWidth >= 1024 ? '220px' : '0' }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          @media (min-width: 1024px) {
            main { margin-left: 220px !important; padding-left: 48px !important; padding-right: 48px !important; }
          }
        ` }} />
        <div className="max-w-4xl mx-auto space-y-16" ref={reportRef}>
          {/* Header */}
          <header className="space-y-6" style={{ paddingBottom: '32px', borderBottom: '0.5px solid var(--border-color)' }}>
            <div className="flex flex-col md:flex-row items-end justify-between gap-6" style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-text-muted text-xs uppercase tracking-widest">
                  <span>Intelligence Report</span>
                  <span>/</span>
                  <span className="font-medium text-text-primary" style={{ textTransform: 'capitalize' }}>{data.topic}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-text-primary" style={{ textTransform: 'capitalize' }}>{data.topic} Market Analysis</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-medium">
                  <span className="bg-surface card" style={{ padding: '4px 8px' }}>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  <span>•</span>
                  <span>{data.generated_at && !isNaN(new Date(data.generated_at).getTime()) 
                    ? new Date(data.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
                    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{data.sources_count} Reliable Sources</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 no-print">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 bg-surface card text-sm font-medium transition-all"
                  style={{ padding: '10px 16px', cursor: 'pointer' }}
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={copyLink}
                  className="bg-surface card transition-all"
                  style={{ padding: '10px', cursor: 'pointer' }}
                >
                  <LinkIcon size={16} />
                </button>
              </div>
            </div>
          </header>

          {/* Sections */}
          <div className="space-y-24 pb-24">
            {/* Section 1 - Executive Summary */}
            <section id="executive_summary" className="scroll-mt-12 space-y-6">
              <div className="pl-6 border-l-4 border-accent bg-surface/50 p-8 rounded-r-xl">
                <p className="text-lg leading-relaxed text-text-primary">{data.report?.executive_summary || 'No executive summary available.'}</p>
              </div>
            </section>

            {/* Section 2 - Overview */}
            <section id="overview" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight" style={{ paddingBottom: '16px', borderBottom: '0.5px solid var(--border-color)' }}>Market Overview</h2>
              <div className="text-text-muted" style={{ lineHeight: '1.6', fontSize: '0.925rem' }}>
                {data.report?.overview || 'No market overview available.'}
              </div>
            </section>

            {/* Section 3 - Target Market */}
            <section id="target_market" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Target Market & Customers</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report?.target_market || 'No target market information available.'}
              </div>
              <div className="bg-surface border-[0.5px] border-border-color p-8 rounded-xl" style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Audience Segmentation (%)</div>
                <ChartRenderer type="bar" data={data.charts?.audience_segments || []} />
              </div>
            </section>

            {/* Section 4 - Competitors */}
            <section id="competitors" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Competitive Landscape</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report?.competitors || 'No competitive analysis available.'}
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-surface border-[0.5px] border-border-color p-8 rounded-xl" style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Competitive Positioning Strategy</div>
                  <ChartRenderer type="radar" data={data.charts?.competitive_radar || { labels: [], datasets: [] }} />
                </div>
                <div className="bg-surface card p-8 space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Strategic Landscape Summary</div>
                  <div className="text-sm text-text-muted leading-relaxed prose prose-sm max-w-none">
                    {data.report?.competitors || 'Summarized competitive data is currently unavailable.'}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 - Trends */}
            <section id="trends" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Market Trends</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report?.trends || 'No market trend data available.'}
              </div>
              <div className="bg-surface border-[0.5px] border-border-color p-8 rounded-xl" style={{ height: '260px', position: 'relative', overflow: 'hidden' }}>
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Market Trajectory (Relative Growth)</div>
                <ChartRenderer type="line" data={data.charts?.trend_lines || { labels: [], datasets: [] }} />
              </div>
            </section>

            {/* Section 6 - Business Model */}
            <section id="business_model" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Business Model & Pricing</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report?.business_model || 'No business model analysis available.'}
              </div>
              <div className="bg-surface border-[0.5px] border-border-color p-8 rounded-xl" style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Revenue Breakdown</div>
                <ChartRenderer type="donut" data={data.charts?.revenue_breakdown || []} />
              </div>
            </section>

            {/* Section 7 - SWOT */}
            <div className="html2pdf__page-break"></div>
            <section id="swot" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">SWOT Analysis</h2>
              <SwotGrid swot={data.report?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] }} />
            </section>

            {/* Section 8 - Key Takeaways */}
            <div className="html2pdf__page-break"></div>
            <section id="key_takeaways" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Strategic Key Takeaways</h2>
              <div className="grid gap-6">
                {(data.report?.key_takeaways || "").split(/[•\-\n\.]/).filter(t => t.trim().length > 10).slice(0, 4).map((text, i) => (
                  <div key={i} className="flex space-x-6 bg-surface border-[0.5px] border-border-color p-8 rounded-xl group hover:border-text-muted transition-all">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-[0.5px] border-border-color flex items-center justify-center text-xl font-medium group-hover:bg-accent group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-text-primary">Strategic Insight 0{i + 1}</div>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {text.trim()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="pt-12 border-t-[0.5px] border-border-color flex justify-center no-print">
            <button
              onClick={onReset}
              className="button-primary flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Research another topic</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportScreen;
