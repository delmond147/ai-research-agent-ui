import React, { useState, useEffect, useRef } from 'react';
import type { ResearchResponse } from '../services/researchService';
import { ChartRenderer } from './ChartRenderer';
import SwotGrid from './SwotGrid';
import { Download, Link as LinkIcon, ArrowLeft, Building2, Users2, MapPin, Briefcase } from 'lucide-react';
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
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
      margin: [15, 15, 15, 15] as [number, number, number, number],
      filename: `${data.topic.replace(/\s+/g, '_')}_Research_Report.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
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
        <style dangerouslySetInnerHTML={{ __html: `
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
          <nav className="space-y-4">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-sm transition-all"
                style={{ 
                  fontSize: '13px',
                  textDecoration: 'none',
                  color: activeSection === section.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: activeSection === section.id ? '500' : '400',
                  paddingLeft: activeSection === section.id ? '8px' : '0',
                  borderLeft: activeSection === section.id ? '2px solid var(--accent)' : 'none'
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
        <style dangerouslySetInnerHTML={{ __html: `
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
                  <span className="font-medium text-text-primary">{data.topic}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-text-primary">{data.topic} Market Analysis</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-medium">
                  <span className="bg-surface card" style={{ padding: '4px 8px' }}>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  <span>•</span>
                  <span>{new Date(data.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
                <p className="text-lg leading-relaxed text-text-primary">{data.report.executive_summary}</p>
              </div>
            </section>

            {/* Section 2 - Overview */}
            <section id="overview" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight" style={{ paddingBottom: '16px', borderBottom: '0.5px solid var(--border-color)' }}>Market Overview</h2>
              <div className="text-text-muted" style={{ lineHeight: '1.6', fontSize: '0.925rem' }}>
                {data.report.overview}
              </div>
              <div className="flex flex-wrap gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {[
                  { label: 'Market Stage', value: 'Growth', icon: Building2 },
                  { label: 'CAGR', value: '14.2%', icon: Users2 },
                  { label: 'TAM', value: '$24.5B', icon: MapPin },
                  { label: 'Reg. Status', value: 'Moderate', icon: Briefcase },
                ].map((stat, i) => (
                  <div key={i} className="bg-surface card p-4 space-y-2">
                    <stat.icon size={16} className="text-text-muted" />
                    <div className="text-xs uppercase tracking-widest text-text-muted font-semibold" style={{ fontSize: '10px' }}>{stat.label}</div>
                    <div className="text-lg font-medium text-text-primary">{stat.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3 - Target Market */}
            <section id="target_market" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Target Market & Customers</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report.target_market}
              </div>
              <div className="h-[300px] w-full bg-surface border-[0.5px] border-border-color p-8 rounded-xl">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Audience Segmentation (%)</div>
                <ChartRenderer type="bar" data={data.charts.audience_segments} />
              </div>
            </section>

            {/* Section 4 - Competitors */}
            <section id="competitors" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Competitive Landscape</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report.competitors}
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-[350px] bg-surface border-[0.5px] border-border-color p-8 rounded-xl">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Market Positioning</div>
                  <ChartRenderer type="radar" data={data.charts.competitive_radar} />
                </div>
                <div className="bg-surface card" style={{ overflow: 'hidden' }}>
                  <table className="w-full text-left" style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead className="bg-bg-primary">
                      <tr>
                        <th className="p-4 font-semibold uppercase tracking-wider" style={{ borderBottom: '0.5px solid var(--border-color)' }}>Competitor</th>
                        <th className="p-4 font-semibold uppercase tracking-wider" style={{ borderBottom: '0.5px solid var(--border-color)' }}>Strength</th>
                        <th className="p-4 font-semibold uppercase tracking-wider" style={{ borderBottom: '0.5px solid var(--border-color)' }}>Weakness</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-muted">
                      {['Market Leader', 'Aggressive Challenger', 'Niche Player'].map((_, i) => (
                        <tr key={i} style={{ borderBottom: '0.5px solid var(--border-color)' }}>
                          <td className="p-4 font-medium text-text-primary">Competitor {i+1}</td>
                          <td className="p-4">Brand Presence</td>
                          <td className="p-4">Innovation Lag</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 5 - Trends */}
            <section id="trends" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Market Trends</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report.trends}
              </div>
              <div className="h-[350px] w-full bg-surface border-[0.5px] border-border-color p-8 rounded-xl">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Market Trajectory (Relative Growth)</div>
                <ChartRenderer type="line" data={data.charts.trend_lines} />
              </div>
            </section>

            {/* Section 6 - Business Model */}
            <section id="business_model" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Business Model & Pricing</h2>
              <div className="prose prose-sm text-text-muted leading-relaxed max-w-none">
                {data.report.business_model}
              </div>
              <div className="h-[300px] w-full bg-surface border-[0.5px] border-border-color p-8 rounded-xl">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Revenue Breakdown</div>
                <ChartRenderer type="donut" data={data.charts.revenue_breakdown} />
              </div>
            </section>

            {/* Section 7 - SWOT */}
            <section id="swot" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">SWOT Analysis</h2>
              <SwotGrid swot={data.report.swot} />
            </section>

            {/* Section 8 - Key Takeaways */}
            <section id="key_takeaways" className="scroll-mt-12 space-y-8">
              <h2 className="text-2xl font-medium tracking-tight border-b-[0.5px] border-border-color pb-4">Strategic Key Takeaways</h2>
              <div className="grid gap-6">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex space-x-6 bg-surface border-[0.5px] border-border-color p-8 rounded-xl group hover:border-text-muted transition-all">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-[0.5px] border-border-color flex items-center justify-center text-xl font-medium group-hover:bg-accent group-hover:text-white transition-all">
                      {num}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-text-primary">Strategic Priority 0{num}</div>
                      <p className="text-sm text-text-muted leading-relaxed">
                        Implement high-level strategic integration of AI-driven tools to enhance market efficiency and drive customer engagement across all vertical segments.
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
