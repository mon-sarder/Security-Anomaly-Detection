import {
  formatDate,
  formatRelativeTime,
  formatRiskScore,
  formatPercentage,
  getRiskLevel,
  getSeverityColor,
  truncateText,
} from '../formatters';

describe('Formatters Utils', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const dateString = '2024-01-15T14:30:00Z';
      const result = formatDate(dateString);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle ISO format dates', () => {
      const dateString = '2024-12-25T00:00:00.000Z';
      const result = formatDate(dateString);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Just now" for very recent dates', () => {
      const now = new Date().toISOString();
      const result = formatRelativeTime(now);
      expect(result).toBe('Just now');
    });

    it('should return minutes ago for recent dates', () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 5);
      const result = formatRelativeTime(date.toISOString());
      expect(result).toContain('minute');
      expect(result).toContain('ago');
    });

    it('should return hours ago for dates within 24 hours', () => {
      const date = new Date();
      date.setHours(date.getHours() - 3);
      const result = formatRelativeTime(date.toISOString());
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('should return days ago for dates within a week', () => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      const result = formatRelativeTime(date.toISOString());
      expect(result).toContain('day');
      expect(result).toContain('ago');
    });

    it('should return formatted date for dates older than a week', () => {
      const date = new Date();
      date.setDate(date.getDate() - 10);
      const result = formatRelativeTime(date.toISOString());
      expect(result).not.toContain('ago');
    });
  });

  describe('formatRiskScore', () => {
    it('should format risk score as percentage', () => {
      expect(formatRiskScore(0.75)).toBe('75.0%');
      expect(formatRiskScore(0.5)).toBe('50.0%');
      expect(formatRiskScore(0.123)).toBe('12.3%');
    });

    it('should handle edge cases', () => {
      expect(formatRiskScore(0)).toBe('0.0%');
      expect(formatRiskScore(1)).toBe('100.0%');
    });

    it('should round to one decimal place', () => {
      expect(formatRiskScore(0.7777)).toBe('77.8%');
      expect(formatRiskScore(0.3333)).toBe('33.3%');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(0.25)).toBe('25.0%');
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.99)).toBe('99.0%');
    });

    it('should handle zero and one', () => {
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(1)).toBe('100.0%');
    });
  });

  describe('getRiskLevel', () => {
    it('should return "low" for scores below 0.3', () => {
      expect(getRiskLevel(0.1)).toBe('low');
      expect(getRiskLevel(0.29)).toBe('low');
      expect(getRiskLevel(0)).toBe('low');
    });

    it('should return "medium" for scores between 0.3 and 0.6', () => {
      expect(getRiskLevel(0.3)).toBe('medium');
      expect(getRiskLevel(0.45)).toBe('medium');
      expect(getRiskLevel(0.59)).toBe('medium');
    });

    it('should return "high" for scores between 0.6 and 0.8', () => {
      expect(getRiskLevel(0.6)).toBe('high');
      expect(getRiskLevel(0.7)).toBe('high');
      expect(getRiskLevel(0.79)).toBe('high');
    });

    it('should return "critical" for scores 0.8 and above', () => {
      expect(getRiskLevel(0.8)).toBe('critical');
      expect(getRiskLevel(0.9)).toBe('critical');
      expect(getRiskLevel(1.0)).toBe('critical');
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct colors for severity levels', () => {
      expect(getSeverityColor('critical')).toBe('#dc2626');
      expect(getSeverityColor('high')).toBe('#ea580c');
      expect(getSeverityColor('medium')).toBe('#f59e0b');
      expect(getSeverityColor('low')).toBe('#10b981');
    });

    it('should be case insensitive', () => {
      expect(getSeverityColor('CRITICAL')).toBe('#dc2626');
      expect(getSeverityColor('High')).toBe('#ea580c');
      expect(getSeverityColor('MeDiUm')).toBe('#f59e0b');
    });

    it('should return default color for unknown severity', () => {
      expect(getSeverityColor('unknown')).toBe('#6b7280');
      expect(getSeverityColor('')).toBe('#6b7280');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const text = 'This is a long text that needs to be truncated';
      expect(truncateText(text, 20)).toBe('This is a long text ...');
    });

    it('should not truncate text shorter than maxLength', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars';
      expect(truncateText(text, 20)).toBe('Exactly twenty chars');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });
});