import {
  REFRESH_INTERVAL,
  SEVERITY_LEVELS,
  ALERT_TYPES,
  RISK_THRESHOLDS,
  PAGE_SIZES,
  TIME_RANGES,
} from '../constants';

describe('Constants', () => {
  describe('REFRESH_INTERVAL', () => {
    it('should have a valid refresh interval', () => {
      expect(typeof REFRESH_INTERVAL).toBe('number');
      expect(REFRESH_INTERVAL).toBeGreaterThan(0);
    });
  });

  describe('SEVERITY_LEVELS', () => {
    it('should have all severity levels defined', () => {
      expect(SEVERITY_LEVELS.LOW).toBe('low');
      expect(SEVERITY_LEVELS.MEDIUM).toBe('medium');
      expect(SEVERITY_LEVELS.HIGH).toBe('high');
      expect(SEVERITY_LEVELS.CRITICAL).toBe('critical');
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(SEVERITY_LEVELS)).toBe(true);
    });
  });

  describe('ALERT_TYPES', () => {
    it('should have all alert types defined', () => {
      expect(ALERT_TYPES.SUSPICIOUS_LOGIN).toBe('suspicious_login');
      expect(ALERT_TYPES.UNUSUAL_LOCATION).toBe('unusual_location');
      expect(ALERT_TYPES.OFF_HOURS).toBe('off_hours');
      expect(ALERT_TYPES.FAILED_ATTEMPTS).toBe('failed_attempts');
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(ALERT_TYPES)).toBe(true);
    });
  });

  describe('RISK_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(RISK_THRESHOLDS.LOW).toBe(0.3);
      expect(RISK_THRESHOLDS.MEDIUM).toBe(0.6);
      expect(RISK_THRESHOLDS.HIGH).toBe(0.8);
    });

    it('should have thresholds in ascending order', () => {
      expect(RISK_THRESHOLDS.LOW).toBeLessThan(RISK_THRESHOLDS.MEDIUM);
      expect(RISK_THRESHOLDS.MEDIUM).toBeLessThan(RISK_THRESHOLDS.HIGH);
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(RISK_THRESHOLDS)).toBe(true);
    });
  });

  describe('PAGE_SIZES', () => {
    it('should have all page sizes defined', () => {
      expect(PAGE_SIZES.SMALL).toBe(10);
      expect(PAGE_SIZES.MEDIUM).toBe(20);
      expect(PAGE_SIZES.LARGE).toBe(50);
    });

    it('should have page sizes in ascending order', () => {
      expect(PAGE_SIZES.SMALL).toBeLessThan(PAGE_SIZES.MEDIUM);
      expect(PAGE_SIZES.MEDIUM).toBeLessThan(PAGE_SIZES.LARGE);
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(PAGE_SIZES)).toBe(true);
    });
  });

  describe('TIME_RANGES', () => {
    it('should have all time ranges defined', () => {
      expect(TIME_RANGES).toHaveLength(5);
    });

    it('should have correct time range values', () => {
      expect(TIME_RANGES[0]).toEqual({ label: 'Last Hour', hours: 1 });
      expect(TIME_RANGES[1]).toEqual({ label: 'Last 6 Hours', hours: 6 });
      expect(TIME_RANGES[2]).toEqual({ label: 'Last 24 Hours', hours: 24 });
      expect(TIME_RANGES[3]).toEqual({ label: 'Last 7 Days', hours: 168 });
      expect(TIME_RANGES[4]).toEqual({ label: 'Last 30 Days', hours: 720 });
    });

    it('should have hours in ascending order', () => {
      for (let i = 0; i < TIME_RANGES.length - 1; i++) {
        expect(TIME_RANGES[i].hours).toBeLessThan(TIME_RANGES[i + 1].hours);
      }
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(TIME_RANGES)).toBe(true);
    });
  });
});