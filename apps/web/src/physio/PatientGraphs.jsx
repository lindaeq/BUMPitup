import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { WEEKS } from '../data';

const weeks = WEEKS.slice(-8).map(week => ({
  name: week.label,
  Pain: week.pain == null ? null : Number(week.pain.toFixed(1)),
  Minutes: week.mins,
}));

const axis = { fill: '#8b7d82', fontSize: 11 };
const tooltip = { borderRadius: 12, borderColor: '#eadde2' };

export default function PatientGraphs() {
  return <div className="provider-graphs">
    <section className="card">
      <h3>Weekly pain</h3>
      <div className="provider-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeks} margin={{ top: 12, right: 14, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#f0e8eb" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axis} />
            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={axis} />
            <Tooltip contentStyle={tooltip} formatter={value => [`${value}/10`, 'Average pain']} />
            <Line type="monotone" dataKey="Pain" stroke="#bd486b" strokeWidth={3} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
    <section className="card">
      <h3>Weekly exercise minutes</h3>
      <div className="provider-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeks} margin={{ top: 12, right: 14, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="#f0e8eb" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axis} />
            <YAxis axisLine={false} tickLine={false} tick={axis} />
            <Tooltip contentStyle={tooltip} formatter={value => [`${value} min`, 'Exercise']} />
            <Bar dataKey="Minutes" fill="#bd486b" radius={[6, 6, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  </div>;
}
