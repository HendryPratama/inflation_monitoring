'use client';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, Dot
} from 'recharts';

export default function InflationChart({ history, activeDate}: { 
                                        history: any[], 
                                        activeDate: string 
                                        }) {
  const getColor = (status: string) => {
    if (status === 'RED') return '#ef4444';
    if (status === 'YELLOW') return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
          
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
            itemStyle={{ fontSize: '10px' }}
            formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Harga']}
          />
          
          {/* Garis Tren Dasar */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#1e293b" 
            strokeWidth={2} 
            dot={false} 
          />

          {/* Garis Vertikal Penanda Waktu (Scanning Line) */}
          <ReferenceLine 
            x={activeDate} 
            stroke="#10b981" 
            strokeDasharray="3 3" 
            label={{ position: 'top', value: 'SCANNING', fill: '#10b981', fontSize: 8, fontWeight: 'bold' }} 
          />

          {/* Titik-titik Status */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="none" 
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              // Efek Glowing jika titik sama dengan tanggal yang sedang aktif
              const isActive = payload.date === activeDate;
              
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isActive ? 6 : 2} 
                  fill={getColor(payload.inflation_status)} 
                  className={isActive ? "animate-pulse shadow-lg" : ""}
                  style={{ 
                    filter: isActive ? `drop-shadow(0 0 8px ${getColor(payload.inflation_status)})` : 'none',
                    transition: 'all 0.5s ease'
                  }}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}