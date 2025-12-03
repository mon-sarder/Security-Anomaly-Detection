import api from './api';
import {
  LoginAnalysisRequest,
  LoginAnalysisResponse,
  LoginEvent,
  LoginEventsResponse,
} from '../types/login.types';

class LoginService {
  async analyzeLogin(request: LoginAnalysisRequest): Promise<LoginAnalysisResponse> {
    return await api.post<LoginAnalysisResponse>('/api/login/analyze', request);
  }

  async getLoginEvents(params?: {
    user_id?: string;
    is_anomaly?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<LoginEventsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.is_anomaly !== undefined) queryParams.append('is_anomaly', params.is_anomaly.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    const url = `/api/login/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await api.get<LoginEventsResponse>(url);
  }

  async getLoginEvent(eventId: string): Promise<LoginEvent> {
    return await api.get<LoginEvent>(`/api/login/events/${eventId}`);
  }
}

export const loginService = new LoginService();
export default loginService;