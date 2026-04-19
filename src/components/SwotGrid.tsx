import React from 'react';

interface SwotGridProps {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

const SwotGrid = React.memo(({ swot }: SwotGridProps) => {
  const categories = [
    { key: 'strengths', label: 'Strengths', color: 'var(--chart-2)', bg: '#ECFDF5' },
    { key: 'weaknesses', label: 'Weaknesses', color: 'var(--chart-3)', bg: '#FEF2F2' },
    { key: 'opportunities', label: 'Opportunities', color: 'var(--chart-1)', bg: '#EFF6FF' },
    { key: 'threats', label: 'Threats', color: 'var(--chart-4)', bg: '#F5F3FF' },
  ] as const;

  return (
    <div className="grid md:grid-cols-2 gap-6" style={{ display: 'grid' }}>
      {categories.map((cat) => (
        <div key={cat.label} className="card p-6 space-y-4" style={{ backgroundColor: cat.bg, borderTop: `4px solid ${cat.color}` }}>
          <h3 className="text-sm font-semibold tracking-widest uppercase" style={{ color: cat.color }}>{cat.label}</h3>
          <ul className="space-y-2" style={{ listStyle: 'none' }}>
            {(swot?.[cat.key] || []).map((item: string, i: number) => (
              <li key={i} className="text-sm text-text-primary flex space-x-2">
                <span style={{ color: cat.color }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
});

export default SwotGrid;
