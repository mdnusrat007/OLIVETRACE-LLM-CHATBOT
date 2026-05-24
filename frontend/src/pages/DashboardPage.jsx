import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Clock, DollarSign, Zap, RefreshCw } from 'lucide-react';
import { metricsApi } from '../api/index.js';

function MetricCard({ title, value, unit, icon: Icon, color }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-500 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{title}</span>
        <div className={`p-2 rounded-lg bg-opacity-20 bg-${color}-500`}>
          <Icon size={18} className={`text-${color}-400`} />
        </div>
      </div>
      <div className="text-3xl font-bold font-mono text-slate-100">
        {value}<span className="text-base text-slate-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}

const RANGES = ['1h', '6h', '24h', '7d'];

export default function DashboardPage() {
  const [range, setRange] = useState('24h');
  const [summary, setSummary] = useState(null);
  const [latency, setLatency] = useState([]);
  const [throughput, setThroughput] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, l, t, p] = await Promise.all([
        metricsApi.summary(range),
        metricsApi.latency(range),
        metricsApi.throughput(range),
        metricsApi.providers(),
      ]);
      setSummary(s.data);
      setLatency(l.data);
      setThroughput(t.data);
      setProviders(p.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Metrics fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const fmtTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
          <button onClick={fetchAll} className="text-slate-400 hover:text-indigo-400 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  range === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Requests" value={summary?.totalRequests ?? '—'} icon={Activity} color="indigo" />
        <MetricCard title="Avg Latency" value={summary?.avgLatencyMs ?? '—'} unit="ms" icon={Clock} color="yellow" />
        <MetricCard title="Success Rate" value={summary?.successRate ?? '—'} unit="%" icon={Zap} color="emerald" />
        <MetricCard title="Total Cost" value={summary?.totalCostUsd ?? '—'} unit="USD" icon={DollarSign} color="rose" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-slate-300 text-sm font-medium mb-4">Latency Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={latency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tickFormatter={fmtTime} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="ms" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelFormatter={fmtTime} />
              <Legend />
              <Line type="monotone" dataKey="avgLatency" stroke="#6366f1" name="Avg (ms)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="p95" stroke="#f59e0b" name="P95 (ms)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-slate-300 text-sm font-medium mb-4">Request Throughput</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={throughput}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="_id" tickFormatter={fmtTime} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelFormatter={fmtTime} />
              <Bar dataKey="requests" fill="#6366f1" name="Requests" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider Comparison */}
      {providers.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-slate-300 text-sm font-medium mb-4">Provider Comparison (7d)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300 font-mono">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-700">
                  <th className="text-left pb-2">Provider</th>
                  <th className="text-right pb-2">Requests</th>
                  <th className="text-right pb-2">Success Rate</th>
                  <th className="text-right pb-2">Avg Latency</th>
                  <th className="text-right pb-2">Total Cost</th>
                  <th className="text-right pb-2">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p._id} className="border-b border-slate-700/50">
                    <td className="py-2 capitalize font-medium text-indigo-400">{p._id}</td>
                    <td className="text-right">{p.totalRequests}</td>
                    <td className="text-right text-emerald-400">
                      {p.totalRequests ? ((p.successCount / p.totalRequests) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="text-right">{Math.round(p.avgLatency)}ms</td>
                    <td className="text-right">${p.totalCost?.toFixed(4)}</td>
                    <td className="text-right">{p.totalTokens?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats summary */}
      {summary && (
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'P95 Latency', value: `${summary.p95LatencyMs}ms` },
            { label: 'Total Tokens', value: (summary.totalTokens || 0).toLocaleString() },
            { label: 'Error Count', value: summary.errorCount },
            { label: 'Active Conversations', value: summary.activeConversations },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-1">{label}</p>
              <p className="text-slate-100 font-mono font-bold text-lg">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
