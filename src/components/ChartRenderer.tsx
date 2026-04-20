import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Radar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  type: 'bar' | 'radar' | 'line' | 'donut';
  data: any;
}

export const ChartRenderer = React.memo(({ type, data }: ChartProps) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type !== 'bar',
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { family: 'Poppins', size: 12 },
          color: 'var(--text-muted)',
        },
      },
      tooltip: {
        backgroundColor: 'var(--surface)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-muted)',
        borderColor: 'var(--border-color)',
        borderWidth: 0.5,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: type === 'bar' ? {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-muted)', font: { family: 'Poppins' } }
      },
      y: {
        grid: { color: 'var(--border-color)', borderDash: [2, 2] as number[] },
        ticks: { color: 'var(--text-muted)', font: { family: 'Poppins' } }
      }
    } : type === 'radar' ? {
      r: {
        angleLines: { color: 'var(--border-color)' },
        grid: { color: 'var(--border-color)' },
        pointLabels: { color: 'var(--text-muted)', font: { size: 11, family: 'Poppins' } },
        ticks: { display: false }
      }
    } : type === 'line' ? {
      x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { family: 'Poppins' } } },
      y: { grid: { color: 'var(--border-color)', borderDash: [2, 2] }, ticks: { color: 'var(--text-muted)', font: { family: 'Poppins' } } }
    } : undefined,
  };

  // Robust data sanitization
  const safeLabels = (data?.labels || (Array.isArray(data) ? data.map((d: any) => d?.label) : []))
    .map((l: any) => l || 'Category');
    
  const safeDatasets = data?.datasets 
    ? data.datasets.map((ds: any, i: number) => ({
        ...ds,
        label: ds.label || `Dataset ${i + 1}`,
        data: ds.data || [],
        backgroundColor: ds.backgroundColor || [
          '#378ADD', '#1D9E75', '#D85A30', '#7F77DD', '#BA7517'
        ][i % 5],
        borderColor: ds.borderColor || 'transparent',
        borderWidth: ds.borderWidth || 0,
      }))
    : [{
        label: 'Analysis Data',
        data: Array.isArray(data) ? data.map((d: any) => d?.value || 0) : [],
        backgroundColor: [
          '#378ADD', '#1D9E75', '#D85A30', '#7F77DD', '#BA7517'
        ],
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: type === 'bar' ? 4 : 0,
      }];

  const chartData = {
    labels: safeLabels,
    datasets: safeDatasets,
  };

  switch (type) {
    case 'bar': return <Bar data={chartData} options={options as any} />;
    case 'radar': return <Radar data={chartData} options={options as any} />;
    case 'line': return <Line data={chartData} options={options as any} />;
    case 'donut': return <Doughnut data={chartData} options={options as any} />;
    default: return null;
  }
});
