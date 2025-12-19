import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { Card } from '../ui/Card';

interface ECGChartProps {
  title: string;
  data: Array<{ timestamp: string; [key: string]: any }>;
  lines: Array<{
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }>;
  height?: number;
  yAxisDomain?: [number, number] | ['auto', 'auto'];
  showGrid?: boolean;
  darkMode?: boolean;
}

export default function ECGChart({
  title,
  data,
  lines,
  height = 200,
  yAxisDomain = ['auto', 'auto'],
  showGrid = true,
  darkMode = true,
}: ECGChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Formatar timestamps para exibição (mostrar apenas hora:minuto:segundo)
    return data.map((point) => {
      const date = new Date(point.timestamp);
      const timeStr = date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      return {
        ...point,
        time: timeStr,
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, darkMode: tooltipDarkMode = darkMode }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${tooltipDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white border-slate-300'} backdrop-blur-sm border rounded-lg p-3 shadow-xl`}>
          <p className={`text-xs mb-2 ${tooltipDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {payload[0]?.payload?.time || ''}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={darkMode ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-200"}>
      <div className="p-4">
        <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? "#374151" : "#e2e8f0"}
                opacity={darkMode ? 0.3 : 0.5}
              />
            )}
            <XAxis
              dataKey="time"
              stroke={darkMode ? "#9ca3af" : "#64748b"}
              tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#64748b' }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              stroke={darkMode ? "#9ca3af" : "#64748b"}
              tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#64748b' }}
              domain={yAxisDomain}
            />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={line.strokeWidth || 2}
                dot={false}
                activeDot={{ r: 4, fill: line.color }}
                animationDuration={300}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

