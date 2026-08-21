import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { FiveDimScore } from '@/types';

interface FiveDimensionRadarProps {
  scores: FiveDimScore;
  size?: number;
}

export function FiveDimensionRadar({ scores, size = 260 }: FiveDimensionRadarProps) {
  const data = [
    { dim: '內容安全', value: scores.content },
    { dim: '語言表達', value: scores.language },
    { dim: '文化適切', value: scores.culture },
    { dim: '倫理規範', value: scores.ethics },
    { dim: '商業合規', value: scores.commercial },
  ];

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e3e7ec" />
        <PolarAngleAxis
          dataKey="dim"
          tick={{ fontSize: 12, fontFamily: 'Noto Sans TC, sans-serif', fill: '#5b6470' }}
        />
        <Radar
          name="評分"
          dataKey="value"
          stroke="#c8912f"
          fill="#c8912f"
          fillOpacity={0.18}
          strokeWidth={2}
          dot={{ fill: '#c8912f', r: 3 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
