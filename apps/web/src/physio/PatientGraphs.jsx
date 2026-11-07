import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { displayTime, usePatientCollection } from './usePatientCollection.js';

export default function PatientGraphs() {
  const { items: sessions } = usePatientCollection('sessions');
  const { items: checkins } = usePatientCollection('checkins');

  const trendData = useMemo(() => checkins.slice(0, 7).reverse().map(item => ({
    name: displayTime(item.createdAt),
    label: item.createdAt?.toDate?.().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) ?? '',
    Pain: Number(item.painLevel),
    Fatigue: Number(item.fatigue),
  })), [checkins]);

  const heartRateData = useMemo(() => sessions.slice().reverse()
    .filter(item => item.heartRateBefore != null || item.heartRateAfter != null)
    .slice(-5).map((item, index) => ({
      name: `Session ${index + 1}`,
      'HR Before': item.heartRateBefore ?? null,
      'HR After': item.heartRateAfter ?? null,
    })), [sessions]);

  if (!trendData.length && !heartRateData.length) return null;

  return <div className="provider-graphs">
    {trendData.length > 0 && <section className="card">
      <h3>Pain &amp; fatigue</h3>
      <div className="provider-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#f0e8eb" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8b7d82', fontSize: 11 }} />
            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#8b7d82', fontSize: 11 }} />
            <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''} contentStyle={{ borderRadius: 12, borderColor: '#eadde2' }} /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Pain" stroke="#bd486b" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Fatigue" stroke="#8a7397" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>}
    {heartRateData.length > 0 && <section className="card">
      <h3>Heart rate</h3>
      <div className="provider-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={heartRateData} margin={{ top: 10, right: 12, bottom: 0, left: -12 }} barGap={5}>
            <CartesianGrid stroke="#f0e8eb" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b7d82', fontSize: 11 }} /><YAxis domain={[0, 180]} axisLine={false} tickLine={false} tick={{ fill: '#8b7d82', fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#eadde2' }} /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="HR Before" fill="#bb8f9f" radius={[6, 6, 0, 0]} maxBarSize={48} />
            <Bar dataKey="HR After" fill="#bd486b" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>}
  </div>;
}
