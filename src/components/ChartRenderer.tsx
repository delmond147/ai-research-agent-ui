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

export const ChartRenderer: React.FC<ChartProps> = ({ type, data }) => {
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
          font: { family: 'Inter', size: 12 },
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
        ticks: { color: 'var(--text-muted)' }
      },
      y: {
        grid: { color: 'var(--border-color)', borderDash: [2, 2] as number[] },
        ticks: { color: 'var(--text-muted)' }
      }
    } : type === 'radar' ? {
      r: {
        angleLines: { color: 'var(--border-color)' },
        grid: { color: 'var(--border-color)' },
        pointLabels: { color: 'var(--text-muted)', font: { size: 11 } },
        ticks: { display: false }
      }
    } : type === 'line' ? {
      x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } },
      y: { grid: { color: 'var(--border-color)', borderDash: [2, 2] }, ticks: { color: 'var(--text-muted)' } }
    } : undefined,
  };

  const chartData = {
    labels: data.labels || data.map((d: any) => d.label),
    datasets: data.datasets || [{
      data: data.map((d: any) => d.value),
      backgroundColor: [
        '#378ADD',
        '#1D9E75',
        '#D85A30',
        '#7F77DD',
        '#BA7517'
      ],
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: type === 'bar' ? 4 : 0,
    }],
  };

  switch (type) {
    case 'bar': return <Bar data={chartData} options={options as any} />;
    case 'radar': return <Radar data={chartData} options={options as any} />;
    case 'line': return <Line data={chartData} options={options as any} />;
    case 'donut': return <Doughnut data={chartData} options={options as any} />;
    default: return null;
  }
};
