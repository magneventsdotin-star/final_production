import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import os from 'os';

// Initialize S3 Client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_S3_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

function getCpuUsage(): number {
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) return 0;
  
  let totalUser = 0;
  let totalSystem = 0;
  let totalNice = 0;
  let totalIdle = 0;
  let totalIrq = 0;

  for (let cpu of cpus) {
    totalUser += cpu.times.user;
    totalSystem += cpu.times.sys;
    totalNice += cpu.times.nice;
    totalIdle += cpu.times.idle;
    totalIrq += cpu.times.irq;
  }

  const total = totalUser + totalSystem + totalNice + totalIdle + totalIrq;
  const active = total - totalIdle;
  
  return total > 0 ? (active / total) * 100 : 0;
}

export async function GET() {
  const serverStart = performance.now();
  
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = totalMem > 0 ? (usedMem / totalMem) * 100 : 0;
  
  const serverStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    sysUptime: os.uptime(),
    memoryUsage: process.memoryUsage(),
    systemMemUsagePercent: memUsagePercent,
    cpuUsagePercent: getCpuUsage(),
    latency: 0
  };

  const dbStatus = { status: 'healthy', latency: 0, error: null as any };
  const storageStatus = { status: 'healthy', latency: 0, error: null as any };
  
  const counts = {
    users: 0,
    artists: 0,
    bookings: 0
  };

  // 1. Check Database
  try {
    const dbStart = performance.now();
    // simple lightweight query to check connection
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    // Also fetch counts in parallel for real metrics
    const [
      { count: usersCount },
      { count: artistsCount },
      { count: bookingsCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('artists').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true })
    ]);

    counts.users = usersCount || 0;
    counts.artists = artistsCount || 0;
    counts.bookings = bookingsCount || 0;

    const dbEnd = performance.now();
    if (error) throw error;
    dbStatus.latency = Math.round(dbEnd - dbStart);
  } catch (err: any) {
    dbStatus.status = 'error';
    dbStatus.error = err.message;
  }

  // 2. Check Storage (R2)
  try {
    const storageStart = performance.now();
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME || '',
      MaxKeys: 1,
    });
    await r2Client.send(command);
    const storageEnd = performance.now();
    storageStatus.latency = Math.round(storageEnd - storageStart);
  } catch (err: any) {
    storageStatus.status = 'error';
    storageStatus.error = err.message;
  }

  serverStatus.latency = Math.round(performance.now() - serverStart);

  const overallStatus = (dbStatus.status === 'healthy' && storageStatus.status === 'healthy') ? 'healthy' : 'degraded';

  return NextResponse.json({
    status: overallStatus,
    timestamp: serverStatus.timestamp,
    server: serverStatus,
    database: dbStatus,
    storage: storageStatus,
    counts
  }, { status: overallStatus === 'healthy' ? 200 : 503 });
}
