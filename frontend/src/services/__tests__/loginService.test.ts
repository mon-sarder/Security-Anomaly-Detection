import loginService from '../loginService';
import api from '../api';

jest.mock('../api');

describe('LoginService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeLogin', () => {
    it('should analyze login successfully', async () => {
      const mockRequest = {
        user_id: 'user-1',
        username: 'testuser',
        ip_address: '192.168.1.100',
        device_info: {
          browser: 'Chrome',
          os: 'Windows',
          device_type: 'desktop',
        },
      };

      const mockResponse = {
        login_event_id: 'event-1',
        is_anomaly: false,
        risk_score: 0.15,
        severity: 'normal',
        reasons: [],
        message: 'Login analyzed successfully',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await loginService.analyzeLogin(mockRequest);

      expect(api.post).toHaveBeenCalledWith('/api/login/analyze', mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should handle analysis error', async () => {
      const mockRequest = {
        user_id: 'user-1',
        username: 'testuser',
        ip_address: '192.168.1.100',
        device_info: {
          browser: 'Chrome',
          os: 'Windows',
          device_type: 'desktop',
        },
      };

      (api.post as jest.Mock).mockRejectedValue(new Error('Analysis failed'));

      await expect(loginService.analyzeLogin(mockRequest)).rejects.toThrow('Analysis failed');
    });
  });

  describe('getLoginEvents', () => {
    it('should get login events without filters', async () => {
      const mockResponse = {
        events: [
          {
            _id: 'event-1',
            user_id: 'user-1',
            username: 'testuser',
            timestamp: '2024-01-15T10:00:00Z',
            ip_address: '192.168.1.100',
            location: { latitude: 37.7749, longitude: -122.4194, city: 'SF', country: 'USA' },
            device_info: { browser: 'Chrome', os: 'Windows', device_type: 'desktop' },
            success: true,
            risk_score: 0.1,
            is_anomaly: false,
            anomaly_reasons: [],
          },
        ],
        count: 1,
        total: 1,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await loginService.getLoginEvents();

      expect(api.get).toHaveBeenCalledWith('/api/login/events');
      expect(result).toEqual(mockResponse);
    });

    it('should get login events with user_id filter', async () => {
      const mockResponse = {
        events: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await loginService.getLoginEvents({ user_id: 'user-1' });

      expect(api.get).toHaveBeenCalledWith('/api/login/events?user_id=user-1');
    });

    it('should get login events with is_anomaly filter', async () => {
      const mockResponse = {
        events: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await loginService.getLoginEvents({ is_anomaly: true });

      expect(api.get).toHaveBeenCalledWith('/api/login/events?is_anomaly=true');
    });

    it('should get login events with limit and skip', async () => {
      const mockResponse = {
        events: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await loginService.getLoginEvents({ limit: 10, skip: 20 });

      expect(api.get).toHaveBeenCalledWith('/api/login/events?limit=10&skip=20');
    });

    it('should get login events with all filters', async () => {
      const mockResponse = {
        events: [],
        count: 0,
        total: 0,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await loginService.getLoginEvents({
        user_id: 'user-1',
        is_anomaly: false,
        limit: 50,
        skip: 0,
      });

      expect(api.get).toHaveBeenCalledWith(
        '/api/login/events?user_id=user-1&is_anomaly=false&limit=50&skip=0'
      );
    });
  });

  describe('getLoginEvent', () => {
    it('should get specific login event', async () => {
      const mockEvent = {
        _id: 'event-1',
        user_id: 'user-1',
        username: 'testuser',
        timestamp: '2024-01-15T10:00:00Z',
        ip_address: '192.168.1.100',
        location: { latitude: 37.7749, longitude: -122.4194, city: 'SF', country: 'USA' },
        device_info: { browser: 'Chrome', os: 'Windows', device_type: 'desktop' },
        success: true,
        risk_score: 0.1,
        is_anomaly: false,
        anomaly_reasons: [],
      };

      (api.get as jest.Mock).mockResolvedValue(mockEvent);

      const result = await loginService.getLoginEvent('event-1');

      expect(api.get).toHaveBeenCalledWith('/api/login/events/event-1');
      expect(result).toEqual(mockEvent);
    });

    it('should handle error when event not found', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Event not found'));

      await expect(loginService.getLoginEvent('nonexistent')).rejects.toThrow('Event not found');
    });
  });
});