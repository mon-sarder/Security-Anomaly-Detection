import dashboardService from '../dashboardService';
import api from '../api';

jest.mock('../api');

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should get dashboard stats with default hours', async () => {
      const mockStats = {
        time_range_hours: 24,
        total_logins: 100,
        anomalous_logins: 10,
        anomaly_rate: 0.1,
        active_alerts: 5,
        high_risk_logins: 3,
        avg_risk_score: 0.25,
      };

      (api.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await dashboardService.getStats();

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/stats?hours=24');
      expect(result).toEqual(mockStats);
    });

    it('should get dashboard stats with custom hours', async () => {
      const mockStats = {
        time_range_hours: 48,
        total_logins: 200,
        anomalous_logins: 20,
        anomaly_rate: 0.1,
        active_alerts: 8,
        high_risk_logins: 5,
        avg_risk_score: 0.3,
      };

      (api.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await dashboardService.getStats(48);

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/stats?hours=48');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getAlerts', () => {
    it('should get alerts without filters', async () => {
      const mockResponse = {
        alerts: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await dashboardService.getAlerts();

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/alerts');
      expect(result).toEqual(mockResponse);
    });

    it('should get alerts with severity filter', async () => {
      const mockResponse = {
        alerts: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getAlerts({ severity: 'high' });

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/alerts?severity=high');
    });

    it('should get alerts with resolved filter', async () => {
      const mockResponse = {
        alerts: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getAlerts({ resolved: false });

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/alerts?resolved=false');
    });

    it('should get alerts with limit and skip', async () => {
      const mockResponse = {
        alerts: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getAlerts({ limit: 10, skip: 5 });

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/alerts?limit=10&skip=5');
    });

    it('should get alerts with all filters', async () => {
      const mockResponse = {
        alerts: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getAlerts({
        severity: 'critical',
        resolved: true,
        limit: 20,
        skip: 10,
      });

      expect(api.get).toHaveBeenCalledWith(
        '/api/dashboard/alerts?severity=critical&resolved=true&limit=20&skip=10'
      );
    });
  });

  describe('updateAlert', () => {
    it('should update alert to resolved', async () => {
      const mockResponse = { message: 'Alert updated successfully' };

      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await dashboardService.updateAlert('alert-1', true);

      expect(api.put).toHaveBeenCalledWith('/api/dashboard/alerts/alert-1', { resolved: true });
      expect(result).toEqual(mockResponse);
    });

    it('should update alert to unresolved', async () => {
      const mockResponse = { message: 'Alert updated successfully' };

      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await dashboardService.updateAlert('alert-1', false);

      expect(api.put).toHaveBeenCalledWith('/api/dashboard/alerts/alert-1', { resolved: false });
      expect(result).toEqual(mockResponse);
    });

    it('should handle update error', async () => {
      (api.put as jest.Mock).mockRejectedValue(new Error('Alert not found'));

      await expect(dashboardService.updateAlert('invalid-id', true)).rejects.toThrow(
        'Alert not found'
      );
    });
  });

  describe('getTimeline', () => {
    it('should get timeline with default hours', async () => {
      const mockResponse = {
        timeline: [
          {
            timestamp: '2024-01-15T10:00:00Z',
            total_logins: 50,
            anomalous_logins: 5,
          },
        ],
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await dashboardService.getTimeline();

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/timeline?hours=24');
      expect(result).toEqual(mockResponse);
    });

    it('should get timeline with custom hours', async () => {
      const mockResponse = {
        timeline: [],
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getTimeline(168);

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/timeline?hours=168');
    });
  });

  describe('getTopRisks', () => {
    it('should get top risks without parameters', async () => {
      const mockResponse = {
        top_risks: [],
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await dashboardService.getTopRisks();

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/top-risks');
      expect(result).toEqual(mockResponse);
    });

    it('should get top risks with limit', async () => {
      const mockResponse = {
        top_risks: [],
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getTopRisks({ limit: 5 });

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/top-risks?limit=5');
    });

    it('should get top risks with hours', async () => {
      const mockResponse = {
        top_risks: [],
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getTopRisks({ hours: 48 });

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/top-risks?hours=48');
    });

    it('should get top risks with both parameters', async () => {
      const mockResponse = {
        top_risks: [],
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await dashboardService.getTopRisks({ limit: 10, hours: 72 });

      expect(api.get).toHaveBeenCalledWith('/api/dashboard/top-risks?limit=10&hours=72');
    });
  });
});