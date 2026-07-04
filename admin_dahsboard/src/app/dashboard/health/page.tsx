"use client";

import { useState, useMemo } from 'react';
import { 
  Server, 
  Database, 
  Cloud, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Cpu,
  ChevronDown,
  Globe,
  HardDrive,
  Network,
  Users,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  MonitorPlay,
  TerminalSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useHealthSimulation } from './useHealthSimulation';

export default function HealthDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [timeRange, setTimeRange] = useState('1h');
  const [environment, setEnvironment] = useState('production');
  const [serverRegion, setServerRegion] = useState('ap-south-1');
  
  // Interactive Chart Toggles
  const [showDb, setShowDb] = useState(true);
  const [showStorage, setShowStorage] = useState(true);
  const [showApi, setShowApi] = useState(true);
  const [showServer, setShowServer] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);

  const {
    loading,
    healthScore,
    kpis,
    chartData,
    activities,
    incidents
  } = useHealthSimulation(refreshInterval);

  // Components
  const StatusBadge = ({ status, text }: { status: string, text?: string }) => {
    let colors = 'bg-slate-100 text-slate-500 border-slate-200';
    if (status === 'healthy') colors = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (status === 'warning') colors = 'bg-amber-50 text-amber-600 border-amber-200';
    if (status === 'critical' || status === 'error') colors = 'bg-rose-50 text-rose-600 border-rose-200';
    
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border", colors)}>
        {text || status}
      </span>
    );
  };

  const getStatusIcon = (status: string, size = 16) => {
    if (status === 'healthy') return <CheckCircle2 size={size} className="text-emerald-500" />;
    if (status === 'loading') return <RefreshCw size={size} className="text-slate-400 animate-spin" />;
    if (status === 'warning') return <AlertTriangle size={size} className="text-amber-500" />;
    return <ShieldAlert size={size} className="text-rose-500" />;
  };

  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    if (!data || data.length === 0) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (((val - min) / range) * 100);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-8 preserve-3d" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="animate-in fade-in duration-700"
        />
      </svg>
    );
  };

  const scoreColor = healthScore >= 95 ? '#10b981' : healthScore >= 80 ? '#f59e0b' : '#f43f5e';
  const scoreData = [
    { name: 'Score', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore }
  ];

  if (loading && !kpis.overall) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm font-bold text-slate-500 animate-pulse">Initializing Telemetry Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER & GLOBAL FILTERS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/50 backdrop-blur-xl border border-slate-200/60 p-4 sm:p-6 rounded-[24px] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">Infrastructure</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MonitorPlay size={24} className="text-slate-700" />
            System Monitor
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Environment Filter */}
          <div className="relative group">
            <select 
              value={environment}
              onChange={e => setEnvironment(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl pl-8 pr-8 py-2.5 outline-none transition-all shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Region Filter */}
          <div className="relative group hidden sm:block">
            <select 
              value={serverRegion}
              onChange={e => setServerRegion(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl pl-8 pr-8 py-2.5 outline-none transition-all shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="ap-south-1">ap-south-1 (Mumbai)</option>
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
            </select>
            <MapPinIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Auto Refresh */}
          <div className="relative group">
            <select 
              value={refreshInterval}
              onChange={e => setRefreshInterval(Number(e.target.value))}
              className="appearance-none bg-indigo-50 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl pl-8 pr-8 py-2.5 outline-none transition-all shadow-sm focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value={0}>Auto-Refresh: Off</option>
              <option value={5000}>Refresh: 5s</option>
              <option value={10000}>Refresh: 10s</option>
              <option value={30000}>Refresh: 30s</option>
              <option value={60000}>Refresh: 1m</option>
            </select>
            <RefreshCw size={14} className={cn("absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none", refreshInterval ? "text-indigo-500 animate-spin-slow" : "text-indigo-300")} />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* TOP SUMMARY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Overall Health Score Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 rounded-[24px] shadow-luxe-soft flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 z-10">Overall Health</h3>
          <div className="relative w-32 h-32 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={scoreColor} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900" style={{ color: scoreColor }}>{healthScore}<span className="text-sm">%</span></span>
            </div>
          </div>
          <div className="mt-4 z-10">
            <StatusBadge status={healthScore >= 95 ? 'healthy' : healthScore >= 80 ? 'warning' : 'critical'} text={healthScore >= 95 ? 'System Healthy' : healthScore >= 80 ? 'Degraded Performance' : 'Critical Issues'} />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(kpis).filter(([k]) => k !== 'overall').map(([key, kpi]) => (
            <div key={key} className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between mb-4 relative z-10">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1 pr-2">{kpi.title}</h4>
                {getStatusIcon(kpi.status, 14)}
              </div>
              
              <div className="relative z-10">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">{kpi.value}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-auto">
                  <span className={cn(
                    "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    kpi.isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                  )}>
                    {kpi.isPositive ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                    {kpi.trend}
                  </span>
                </div>
              </div>

              {/* Sparkline Background */}
              <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkline data={kpi.history} color={kpi.isPositive ? '#10b981' : '#f43f5e'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LATENCY ANALYTICS */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 rounded-[24px] shadow-luxe-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" />
              Latency Analytics
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Real-time Response Times (ms)</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
             {/* Custom Legend/Toggles */}
             {[
               { id: 'db', label: 'Database', color: '#0ea5e9', state: showDb, setState: setShowDb },
               { id: 'storage', label: 'Storage', color: '#f59e0b', state: showStorage, setState: setShowStorage },
               { id: 'api', label: 'API Gateway', color: '#8b5cf6', state: showApi, setState: setShowApi },
               { id: 'server', label: 'Server Proc.', color: '#10b981', state: showServer, setState: setShowServer },
               { id: 'network', label: 'Network', color: '#f43f5e', state: showNetwork, setState: setShowNetwork },
             ].map(item => (
               <button
                 key={item.id}
                 onClick={() => item.setState(!item.state)}
                 className={cn(
                   "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                   item.state ? "bg-white shadow-sm border-slate-200 text-slate-700" : "bg-slate-50 border-transparent text-slate-400 opacity-60 hover:opacity-100"
                 )}
               >
                 <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                 {item.label}
               </button>
             ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorServer" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}
                labelStyle={{ fontWeight: 900, color: '#475569', marginBottom: '8px', fontSize: '12px' }}
                itemStyle={{ fontWeight: 700, fontSize: '12px', padding: '2px 0' }}
              />
              {showDb && <Area type="monotone" dataKey="dbLatency" name="Database (ms)" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorDb)" isAnimationActive={false} />}
              {showStorage && <Area type="monotone" dataKey="storageLatency" name="Storage (ms)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorStorage)" isAnimationActive={false} />}
              {showApi && <Area type="monotone" dataKey="apiLatency" name="API Gateway (ms)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorApi)" isAnimationActive={false} />}
              {showServer && <Area type="monotone" dataKey="serverProcessing" name="Server (ms)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorServer)" isAnimationActive={false} />}
              {showNetwork && <Area type="monotone" dataKey="networkDelay" name="Network (ms)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorNetwork)" isAnimationActive={false} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TWO COLUMN DEEP DIVES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* SERVER PERFORMANCE & ALERTS */}
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 rounded-[24px] shadow-luxe-soft">
             <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-6">
               <Server size={16} className="text-slate-500" />
               Server Performance
             </h3>
             <div className="space-y-5">
               {/* Progress Bar Item */}
               {[
                 { label: 'System CPU Usage', val: parseFloat(kpis.cpu?.value) || 0, color: 'bg-indigo-500' },
                 { label: 'System Memory (RAM)', val: parseFloat(kpis.mem?.value) || 0, color: 'bg-emerald-500' },
               ].map((item, i) => (
                 <div key={i}>
                   <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                     <span>{item.label}</span>
                     <span className="text-slate-700">{item.val.toFixed(1)}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className={cn("h-full transition-all duration-1000 ease-out", item.color)} style={{ width: `${item.val}%` }} />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 rounded-[24px] shadow-luxe-soft h-[300px] flex flex-col">
             <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 shrink-0">
               <AlertTriangle size={16} className="text-rose-500" />
               Recent Incidents
             </h3>
             <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-3">
               {incidents.map(inc => (
                 <div key={inc.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <StatusBadge status={inc.severity === 'critical' ? 'error' : inc.severity === 'medium' ? 'warning' : 'healthy'} text={inc.severity} />
                       <span className="text-[10px] font-bold text-slate-400">{inc.time}</span>
                     </div>
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{inc.status}</span>
                   </div>
                   <p className="text-xs font-bold text-slate-900">{inc.component}</p>
                   <p className="text-[11px] font-medium text-slate-500 mt-1">{inc.description}</p>
                 </div>
               ))}
               {incidents.length === 0 && (
                 <div className="text-center text-sm font-bold text-slate-400 py-8">No recent incidents. System is stable.</div>
               )}
             </div>
          </div>
        </div>

        {/* API ANALYTICS & ACTIVITY LOG */}
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 rounded-[24px] shadow-luxe-soft grid grid-cols-2 gap-6">
            <div className="col-span-2 flex items-center justify-between mb-2">
               <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                 <Network size={16} className="text-slate-500" />
                 API Gateway Analytics
               </h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 24h</span>
            </div>
            
            <div className="flex flex-col justify-center h-32 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={[
                       { name: '2xx Success', value: 98.4 },
                       { name: '4xx Errors', value: 1.2 },
                       { name: '5xx Errors', value: 0.4 },
                     ]}
                     cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value" stroke="none"
                   >
                     <Cell fill="#10b981" />
                     <Cell fill="#f59e0b" />
                     <Cell fill="#f43f5e" />
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traffic</span>
               </div>
            </div>

            <div className="flex flex-col justify-center space-y-3">
               {[
                 { label: '2xx Success', val: '98.4%', color: 'bg-emerald-500' },
                 { label: '4xx Client Errors', val: '1.2%', color: 'bg-amber-500' },
                 { label: '5xx Server Errors', val: '0.4%', color: 'bg-rose-500' },
               ].map((stat, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className={cn("w-2 h-2 rounded-full", stat.color)} />
                     <span className="text-[11px] font-bold text-slate-600">{stat.label}</span>
                   </div>
                   <span className="text-[11px] font-black text-slate-900">{stat.val}</span>
                 </div>
               ))}
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Slowest Endpoints</h4>
               <div className="space-y-2">
                 {[
                   { path: '/api/v1/analytics/export', time: '1240ms' },
                   { path: '/api/admin/bookings/bulk', time: '890ms' },
                 ].map((ep, i) => (
                   <div key={i} className="flex justify-between items-center text-[11px] font-bold bg-slate-50 px-3 py-2 rounded-lg">
                     <span className="text-slate-700 font-mono">{ep.path}</span>
                     <span className="text-amber-600">{ep.time}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[24px] shadow-luxe-soft h-[300px] flex flex-col relative overflow-hidden text-slate-300">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
             <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4 shrink-0 relative z-10">
               <TerminalSquare size={16} className="text-indigo-400" />
               Live Activity Stream
             </h3>
             <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-1 font-mono text-[11px] relative z-10">
               {activities.map(act => (
                 <div key={act.id} className="flex items-start gap-3 py-1 animate-in slide-in-from-left-2 duration-300">
                   <span className="text-slate-500 shrink-0 mt-0.5">[{act.time}]</span>
                   <span className={cn(
                     "break-words",
                     act.type === 'error' ? 'text-rose-400' :
                     act.type === 'warning' ? 'text-amber-400' :
                     act.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                   )}>
                     {act.message}
                   </span>
                 </div>
               ))}
               {activities.length === 0 && (
                 <div className="text-slate-500 italic py-4">Waiting for events...</div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal MapPin icon used in header
function MapPinIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
