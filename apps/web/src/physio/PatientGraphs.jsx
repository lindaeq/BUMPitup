import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { displayTime, usePatientCollection } from './usePatientCollection.js';

export default function PatientGraphs() {
  const { items: sessions } = usePatientCollection('sessions');
  const { items: checkins } = usePatientCollection('checkins');

  const trendData = useMemo(() => checkins.slice().reverse().map(item => ({
    name: displayTime(item.createdAt),
    Pain: Number(item.painLevel),
    Fatigue: Number(item.fatigue),
  })), [checkins]);

  const heartRateData = useMemo(() => sessions.slice().reverse()
    .filter(item => item.heartRateBefore != null || item.heartRateAfter != null)
    .map((item, index) => ({
      name: item.exerciseId || item.exercise || `Session ${index + 1}`,
      'HR Before': item.heartRateBefore ?? null,
      'HR After': item.heartRateAfter ?? null,
    })), [sessions]);

  if (!trendData.length && !heartRateData.length) return null;

  return <div className="provider-graphs">
    {trendData.length > 0 && <section className="card">
      <h3>Pain &amp; Fatigue Trends</h3>
      <div className="provider-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis domain={[0, 10]} />
            <Tooltip /><Legend />
            <Line type="monotone" dataKey="Pain" stroke="#d14f66" strokeWidth={2} />
            <Line type="monotone" dataKey="Fatigue" stroke="#397da0" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>}
    {heartRateData.length > 0 && <section className="card">
      <h3>Heart Rate Response (BPM)</h3>
      <div className="provider-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={heartRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis domain={[40, 180]} />
            <Tooltip /><Legend />
            <Bar dataKey="HR Before" fill="#52a870" />
            <Bar dataKey="HR After" fill="#e9a34e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>}
  </div>;
}
