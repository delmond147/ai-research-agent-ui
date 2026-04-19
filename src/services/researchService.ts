/**
 * Research Service
 * Handles communication with the AI Research Agent API.
 */

const API_BASE_URL = 'https://ai-research-agent-api-grtx.onrender.com';

export interface ResearchRequest {
  topic: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface RadarData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface TrendLineData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
  }[];
}

export interface ResearchResponse {
  topic: string;
  generated_at: string;
  sources_count: number;
  report: {
    executive_summary: string;
    overview: string;
    target_market: string;
    competitors: string;
    trends: string;
    business_model: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    key_takeaways: string;
  };
  charts: {
    audience_segments: ChartDataPoint[];
    competitive_radar: RadarData;
    trend_lines: TrendLineData;
    revenue_breakdown: ChartDataPoint[];
  };
}

export const researchService = {
  /**
   * Pings the backend to wake it up (Render cold-start mitigation)
   */
  async ping(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/docs`, { mode: 'no-cors' });
    } catch (e) {
      // Ignore errors for ping
    }
  },

  async generateReport(topic: string, retries = 3): Promise<ResearchResponse> {
    let lastError: any;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/research`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to generate report. Please try again.');
        }

        return await response.json();
      } catch (error: any) {
        lastError = error;
        // If it's a fetch error (like "Failed to fetch"), wait and retry
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          console.log(`Rate limit or cold start hit. Retrying attempt ${i + 1}/${retries}...`);
          await new Promise(res => setTimeout(res, 2000 * (i + 1))); // Exponential-ish backoff
          continue;
        }
        throw error; // If it's a specific API error, throw it
      }
    }

    throw lastError || new Error('Maximum retries reached. Backend might be down.');
  },
};
