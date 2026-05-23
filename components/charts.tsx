'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card } from '@/components/ui/card';

const defaultColors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fece95', '#22c55e', '#06b6d4', '#8b5cf6'];

export function SalesTrendChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Sales Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function PopularItemsChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Popular Items</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
          />
          <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
            {data.map((item, index) => (
              <Cell key={`cell-${index}`} fill={item.color || defaultColors[index % defaultColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function RevenueBreakdownChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Revenue Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${value})`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((item, index) => (
              <Cell key={`cell-${index}`} fill={item.color || defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function PeakHoursChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Peak Ordering Hours</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#f97316"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
