// src/PatientGraphs.jsx
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { usePatientCollection } from './usePatientCollection.js';

export default function PatientGraphs() {
  const { items: sessions } = usePatientCollection('sessions');
  const { items: checkins } = usePatientCollection('checkins');

  // Format check-in data chronologically for Pain & Fatigue trends
  const trendData = useMemo(() => {
    return checkins
      .slice()
      .reverse()
      .map((item, idx) => ({
        name: `Day ${idx + 1}`,
        Pain: item.painLevel ?? 0,
        Fatigue: item.fatigue ?? 0,
      }));
  }, [checkins]);

  // Format session data chronologically for Heart Rate before vs after
  const heartRateData = useMemo(() => {
    return sessions
      .slice()
      .reverse()
      .filter((s) => s.heartRateBefore != null || s.heartRateAfter != null)
      .map((item, idx) => ({
        name: item.exerciseId || item.exercise || `Session ${idx + 1}`,
        'HR Before': item.heartRateBefore ?? 0,
        'HR After': item.heartRateAfter ?? 0,
      }));
  }, [sessions]);

  if (!checkins.length && !sessions.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
      {/* 1. Pain & Fatigue Line Trend Chart */}
      {trendData.length > 0 && (
        <section className="card">
          <h3>Pain & Fatigue Trends</h3>
          <div style={{ width: '100%', height: 250, marginTop: '15px' }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pain" stroke="#ff4d4f" strokeWidth={2} />
                <Line type="monotone" dataKey="Fatigue" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 2. Heart Rate Response Bar Chart */}
      {heartRateData.length > 0 && (
        <section className="card">
          <h3>Heart Rate Response (BPM)</h3>
          <div style={{ width: '100%', height: 250, marginTop: '15px' }}>
            <ResponsiveContainer>
              <BarChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[40, 180]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="HR Before" fill="#52c41a" />
                <Bar dataKey="HR After" fill="#fa8c16" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
