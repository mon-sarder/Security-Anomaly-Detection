import React from 'react';
import { formatRiskScore, getSeverityColor, getRiskLevel } from '../../utils/formatters';
import './RiskScoreBadge.css';

interface RiskScoreBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export const RiskScoreBadge: React.FC<RiskScoreBadgeProps> = ({ score, size = 'medium' }) => {
  const riskLevel = getRiskLevel(score);
  const color = getSeverityColor(riskLevel);

  return (
    <span
      className={`risk-badge ${size}`}
      style={{ backgroundColor: color }}
    >
      {formatRiskScore(score)}
    </span>
  );
};

export default RiskScoreBadge;