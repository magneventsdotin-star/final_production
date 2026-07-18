import { useState, useEffect, useRef } from 'react';

// Types
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'loading';

export interface KPI {
  title: string;
  value: string;
  status: HealthStatus;
  trend: string;
  isPositive: boolean;
  history: number[];
}

export interface ActivityEvent {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Incident {
  id: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  status: 'investigating' | 'resolved' | 'monitoring';
  resolvedBy?: string;
}

export interface ChartDataPoint {
  time: string;
  dbLatency: number;
  storageLatency: number;
  apiLatency: number;
  serverProcessing: number;
  networkDelay: number;
}

export function useHealthSimulation(refreshIntervalMs: number) {
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(100);
  const [kpis, setKpis] = useState<Record<string, KPI>>({});
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  
  const prevDbLatency = useRef(0);
  const prevStorageLatency = useRef(0);

  // Helper to generate sparkline data
  const generateSparkline = (base: number, variance: number, points = 15) => {
    return Array.from({ length: points }, () => Math.max(0, base + (Math.random() * variance * 2 - variance)));
  };

  // 1. Initial Data Setup
  useEffect(() => {
    // Generate initial history to avoid empty chart
    const initialChartData = Array.from({ length: 20 }, (_, i) => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - (20 - i));
      return {
        time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
        dbLatency: 0,
        storageLatency: 0,
        apiLatency: 0,
        serverProcessing: 0,
        networkDelay: 0
      };
    });
    setChartData(initialChartData);

    setIncidents([]); // clear mock incidents
    setActivities([]); // clear mock activities
  }, []);

  // 2. Fetch Real Data & Tick
  useEffect(() => {
    if (!refreshIntervalMs) return;

    let isMounted = true;

    const tick = async () => {
      let currentDbLatency = prevDbLatency.current;
      let currentStorageLatency = prevStorageLatency.current;
      let realDbStatus = 'healthy';
      let realStorageStatus = 'healthy';
      let serverProcessing = 0;
      let cpuUsage = 0;
      let memUsage = 0;
      
      let usersCount = 0;
      let artistsCount = 0;
      let bookingsCount = 0;
      let pageViewsCount = 0;
      let uniqueVisitorsCount = 0;

      try {
        const res = await fetch('/api/admin/health');
        const json = await res.json();
        
        if (json.database?.latency !== undefined) {
          currentDbLatency = json.database.latency;
          prevDbLatency.current = currentDbLatency;
          realDbStatus = json.database.status;
        }
        if (json.storage?.latency !== undefined) {
          currentStorageLatency = json.storage.latency;
          prevStorageLatency.current = currentStorageLatency;
          realStorageStatus = json.storage.status;
        }
        
        if (json.server) {
          serverProcessing = json.server.latency || 0;
          cpuUsage = json.server.cpuUsagePercent || 0;
          memUsage = json.server.systemMemUsagePercent || 0;
        }

        if (json.counts) {
          usersCount = json.counts.users || 0;
          artistsCount = json.counts.artists || 0;
          bookingsCount = json.counts.bookings || 0;
          pageViewsCount = json.counts.pageViews || 0;
          uniqueVisitorsCount = json.counts.uniqueVisitors || 0;
        }
        
      } catch (err) {
        console.error("Health fetch failed", err);
        realDbStatus = 'error';
        realStorageStatus = 'error';
      }

      if (!isMounted) return;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      // Update Chart Data with real values
      setChartData(prev => {
        const newData = [...prev, {
          time: timeStr,
          dbLatency: currentDbLatency,
          storageLatency: currentStorageLatency,
          apiLatency: serverProcessing, // using server processing time as API latency here
          serverProcessing: serverProcessing,
          networkDelay: 0
        }];
        return newData.slice(-20); // Keep last 20 points
      });

      // Update KPIs with real data
      setKpis({
        overall: { title: 'System Status', value: realDbStatus === 'error' || realStorageStatus === 'error' ? 'Degraded' : 'Operational', status: realDbStatus === 'error' || realStorageStatus === 'error' ? 'warning' : 'healthy', trend: '100% Uptime', isPositive: true, history: [] },
        db: { title: 'Database Health', value: realDbStatus === 'error' ? 'Error' : 'Healthy', status: realDbStatus as any, trend: `${currentDbLatency}ms`, isPositive: realDbStatus !== 'error', history: generateSparkline(currentDbLatency, 10) },
        storage: { title: 'Cloud Storage', value: realStorageStatus === 'error' ? 'Error' : 'Healthy', status: realStorageStatus as any, trend: `${currentStorageLatency}ms`, isPositive: realStorageStatus !== 'error', history: generateSparkline(currentStorageLatency, 30) },
        pageViews: { title: 'Total Page Views', value: pageViewsCount.toLocaleString(), status: 'healthy', trend: 'Live Hits', isPositive: true, history: generateSparkline(pageViewsCount, 0) },
        visitors: { title: 'Unique Visitors', value: uniqueVisitorsCount.toLocaleString(), status: 'healthy', trend: 'Live Hits', isPositive: true, history: generateSparkline(uniqueVisitorsCount, 0) },
        users: { title: 'Total Users', value: usersCount.toLocaleString(), status: 'healthy', trend: 'Profiles', isPositive: true, history: generateSparkline(usersCount, 0) },
        artists: { title: 'Total Artists', value: artistsCount.toLocaleString(), status: 'healthy', trend: 'Registered', isPositive: true, history: generateSparkline(artistsCount, 0) },
        bookings: { title: 'Total Bookings', value: bookingsCount.toLocaleString(), status: 'healthy', trend: 'All Time', isPositive: true, history: generateSparkline(bookingsCount, 0) }
      });

      // Calculate health score based on real statuses
      let newScore = 100;
      if (realDbStatus === 'error') newScore -= 20;
      if (realStorageStatus === 'error') newScore -= 15;
      newScore -= (cpuUsage > 80 ? 5 : 0);
      newScore -= (memUsage > 90 ? 5 : 0);
      setHealthScore(Math.round(newScore));

      setLoading(false);
    };

    tick(); // Initial fetch
    const interval = setInterval(tick, refreshIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshIntervalMs]);

  return {
    loading,
    healthScore,
    kpis,
    chartData,
    activities,
    incidents
  };
}
