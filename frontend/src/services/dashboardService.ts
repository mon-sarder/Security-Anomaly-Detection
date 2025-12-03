import api from './api';
import {
  DashboardStats,
  AlertsResponse,
  TimelineResponse,
  TopRisksResponse,
  Alert,
} from '../types/dashboard.types';

class DashboardService {
  async getStats(hours: number = 24): Promise<DashboardStats> {
    return await api.get<DashboardStats>(`/api/dashboard/stats?hours=${hours}`);
  }

  async getAlerts(params?: {
    severity?: string;
    resolved?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<AlertsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    const url = `/api/dashboard/alerts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await api.get<AlertsResponse>(url);
  }

  async updateAlert(alertId: string, resolved: boolean): Promise<{ message: string }> {
    return await api.put<{ message: string }>(`/api/dashboard/alerts/${alertId}`, { resolved });
  }

  async getTimeline(hours: number = 24): Promise<TimelineResponse> {
    return await api.get<TimelineResponse>(`/api/dashboard/timeline?hours=${hours}`);
  }

  async getTopRisks(params?: { limit?: number; hours?: number }): Promise<TopRisksResponse> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.hours) queryParams.append('hours', params.hours.toString());

    const url = `/api/dashboard/top-risks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await api.get<TopRisksResponse>(url);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;