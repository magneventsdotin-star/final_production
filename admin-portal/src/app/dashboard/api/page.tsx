"use client";

import { useState } from 'react';
import { 
  Server, 
  Play, 
  Copy, 
  Activity, 
  Database, 
  ShieldAlert, 
  ChevronRight, 
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Stethoscope,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JsonViewer } from '@/components/ui/JsonViewer';

const APIS = [
  {
    id: 'health-check',
    name: 'System Health Check',
    method: 'GET',
    endpoint: '/api/admin/health',
    description: 'Checks the health and uptime of the admin panel server.',
    authRequired: false,
    status: 'active',
    category: 'Admin Panel',
    headers: {},
    params: {},
    sampleBody: null,
    sampleResponse: {
      "status": "healthy",
      "timestamp": "2026-07-04T00:00:00.000Z",
      "uptime": 3600,
      "memoryUsage": {}
    }
  },
  {
    id: 'internal-update-user',
    name: 'Update User Profile',
    method: 'POST',
    endpoint: '/api/admin/update-user',
    description: 'Updates an internal admin profile. Requires Super Admin privileges.',
    authRequired: true,
    status: 'active',
    category: 'Admin Panel',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {},
    sampleBody: {
      "userId": "uuid",
      "full_name": "New Name",
      "role": "admin"
    },
    sampleResponse: {
      "message": "User updated successfully"
    }
  },
  {
    id: 'admin-delete-user',
    name: 'Delete User',
    method: 'POST',
    endpoint: '/api/admin/delete-user',
    description: 'Deletes a user from Auth and the database. Requires Super Admin privileges.',
    authRequired: true,
    status: 'active',
    category: 'Admin Panel',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "userId": "uuid" },
    sampleResponse: { "message": "User deleted successfully from both Auth and Database" }
  },
  {
    id: 'admin-upload',
    name: 'Upload File to R2',
    method: 'POST',
    endpoint: '/api/upload',
    description: 'Uploads an image or video file to Cloudflare R2 bucket.',
    authRequired: true,
    status: 'active',
    category: 'Admin Panel',
    headers: {},
    params: {},
    sampleBody: null,
    sampleResponse: { "url": "https://pub-your-bucket.r2.dev/talent-track/artists/uuid.jpg" }
  },
  {
    id: 'admin-upload-url',
    name: 'Upload File via URL',
    method: 'POST',
    endpoint: '/api/upload-url',
    description: 'Uploads an image to R2 from a public URL.',
    authRequired: true,
    status: 'active',
    category: 'Admin Panel',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "url": "https://example.com/image.jpg" },
    sampleResponse: { "url": "https://pub-your-bucket.r2.dev/talent-track/artists/uuid.jpg" }
  },
  {
    id: 'admin-delete-image',
    name: 'Delete File from R2',
    method: 'POST',
    endpoint: '/api/delete-image',
    description: 'Deletes a file from the Cloudflare R2 bucket.',
    authRequired: true,
    status: 'active',
    category: 'Admin Panel',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "url": "https://pub-your-bucket.r2.dev/talent-track/artists/uuid.jpg" },
    sampleResponse: { "message": "Image deleted successfully" }
  },
  {
    id: 'admin-update-video',
    name: 'Update Service Video',
    method: 'POST',
    endpoint: '/api/update-video',
    description: 'Updates a promotional video for a service category.',
    authRequired: true,
    status: 'active',
    category: 'Admin Panel',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "id": "video_id", "title": "New Title", "video_url": "url", "category_id": "cat_id" },
    sampleResponse: { "message": "Video updated successfully" }
  },
  {
    id: 'get-artists',
    name: 'Get All Artists',
    method: 'GET',
    endpoint: 'https://ecwaqfsjajeidhslybdi.supabase.co/rest/v1/artists?select=id,name,category',
    description: 'Retrieves a list of all verified artists available for booking.',
    authRequired: true,
    status: 'active',
    category: 'Artist Page',
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'}`
    },
    params: {},
    sampleBody: null,
    sampleResponse: {
      "data": [
        { "id": "1", "name": "The Midnight Rockers", "category": "Live Band" },
        { "id": "2", "name": "DJ Snake", "category": "Club DJs" }
      ]
    }
  },
  {
    id: 'get-categories',
    name: 'Get Categories',
    method: 'GET',
    endpoint: 'https://ecwaqfsjajeidhslybdi.supabase.co/rest/v1/service_categories?select=*',
    description: 'Fetches all service categories for the platform.',
    authRequired: true,
    status: 'active',
    category: 'Artist Page',
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'}`
    },
    params: {},
    sampleBody: null,
    sampleResponse: {
      "id": "uuid",
      "title": "Live Band",
      "slug": "live-band"
    }
  },
  {
    id: 'user-contact',
    name: 'Submit Contact/Booking Form',
    method: 'POST',
    endpoint: 'https://magnevents.in/api/contact',
    description: 'Sends an email notification and creates a pending booking request in the database from the client site.',
    authRequired: false,
    status: 'active',
    category: 'Artist Page',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: {
      "type": "booking",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "eventType": "Wedding",
      "date": "2026-12-01",
      "location": "Mumbai",
      "budget": "5L_plus",
      "message": "Looking for a premium live band.",
      "selectedArtist": null
    },
    sampleResponse: { "success": true, "message": "Request processed successfully!" }
  }
];

import Link from 'next/link';

export default function ApiDashboard() {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Admin Panel' | 'Artist Page'>('Admin Panel');
  const [selectedApi, setSelectedApi] = useState<any | null>(null);
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
  
  // Test State
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testTime, setTestTime] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testHeaders, setTestHeaders] = useState<any>(null);

  const filteredApis = APIS.filter(api => activeCategory === 'All' || api.category === activeCategory);

  const getMethodColor = (method: string) => {
    switch(method) {
      case 'GET': return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'POST': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'PUT': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleRunApiClick = (api: any) => {
    setSelectedApi(api);
    setTestResponse(null);
    setTestStatus(null);
    setTestTime(null);
    setTestError(null);
    setTestHeaders(null);
    setIsTestPanelOpen(true);
  };

  const executeApi = async () => {
    if (!selectedApi) return;
    setTestLoading(true);
    setTestResponse(null);
    setTestError(null);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: selectedApi.method,
        headers: selectedApi.headers || {},
      };

      if (selectedApi.method !== 'GET' && selectedApi.sampleBody) {
        options.body = JSON.stringify(selectedApi.sampleBody);
      }

      const res = await fetch(selectedApi.endpoint, options);
      const endTime = performance.now();
      
      setTestTime(Math.round(endTime - startTime));
      setTestStatus(res.status);

      // Extract headers
      const headersObj: any = {};
      res.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      setTestHeaders(headersObj);

      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP Error ${res.status}`);
      }

      setTestResponse(data);
    } catch (err: any) {
      setTestError(err.message);
      setTestResponse({ error: err.message, cause: "Check network tab or endpoint configuration." });
    } finally {
      setTestLoading(false);
    }
  };

  const downloadJson = () => {
    if (!testResponse) return;
    const blob = new Blob([JSON.stringify(testResponse, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${selectedApi.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Refined Header & Health Check */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <span className="section-label m-0">Developer Tools</span>
          </div>
          <h1 className="section-title text-slate-900">
            API Management
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
            Test, monitor, and manage backend endpoints for the platform.
          </p>
        </div>
        
        <Link 
          href="/dashboard/health"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <Stethoscope size={16} />
          View Health Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-hide">
        {['Admin Panel', 'Artist Page', 'All'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeCategory === cat 
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" 
                : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            )}
          >
            {cat} APIs
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredApis.map((api) => (
          <div key={api.id} className="luxe-card p-5 flex flex-col md:flex-row gap-5 items-start hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 space-y-3 w-full">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border", getMethodColor(api.method))}>
                  {api.method}
                </span>
                <h3 className="text-base font-black text-slate-900">{api.name}</h3>
                
                <span className="flex items-center gap-1.5 ml-auto md:ml-2 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                  {api.category}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Database size={14} className="text-slate-400 shrink-0" />
                <span className="truncate flex-1">{api.endpoint}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(api.endpoint)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                  title="Copy Endpoint"
                >
                  <Copy size={14} />
                </button>
              </div>

              <p className="text-sm font-medium text-slate-500 leading-relaxed">{api.description}</p>
            </div>

            <div className="flex md:flex-col gap-2 w-full md:w-40 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
               <button
                 onClick={() => handleRunApiClick(api)}
                 className="flex-1 md:flex-none flex items-center justify-center gap-1.5 h-10 rounded-lg bg-[#5B5AF7] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
               >
                 <Play size={14} fill="currentColor" />
                 Run
               </button>
               <button
                 className="flex-1 md:flex-none flex items-center justify-center gap-1.5 h-10 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider transition-all"
                 onClick={() => {
                   setSelectedApi(api);
                   setIsTestPanelOpen(true);
                 }}
               >
                 <Activity size={14} />
                 Details
               </button>
            </div>
          </div>
        ))}
      </div>


      {/* API Testing Slide-over Panel */}
      {isTestPanelOpen && selectedApi && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTestPanelOpen(false)} />
          
          <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B5AF7] flex items-center justify-center border border-indigo-100 shadow-sm">
                  <Server size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">API Testing Console</h2>
                  <p className="text-xs font-bold text-slate-500">{selectedApi.name}</p>
                </div>
              </div>
              <button onClick={() => setIsTestPanelOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-lg shadow-sm transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Request Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ChevronRight size={16} className="text-sky-500" /> Request Details
                </h3>
                
                <div className="flex items-center gap-3 p-1 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ml-1", getMethodColor(selectedApi.method))}>
                    {selectedApi.method}
                  </span>
                  <input 
                    type="text" 
                    value={selectedApi.endpoint}
                    readOnly
                    className="flex-1 bg-transparent border-none text-xs font-mono font-medium text-slate-600 focus:ring-0 p-0"
                  />
                </div>

                {selectedApi.sampleBody && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Request Body (JSON)</p>
                    <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                      <pre className="text-emerald-400 font-mono text-xs overflow-x-auto">
                        {JSON.stringify(selectedApi.sampleBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedApi.headers && Object.keys(selectedApi.headers).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Headers</p>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      {Object.entries(selectedApi.headers).map(([k, v]) => (
                        <div key={k} className="flex gap-4 text-xs font-mono mb-2 last:mb-0">
                          <span className="text-slate-500 min-w-[120px] font-bold">{k}:</span>
                          <span className="text-slate-700 break-all">{typeof v === 'string' && v.startsWith('Bearer') ? 'Bearer ********' : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-center border-y border-slate-100 py-6">
                <button
                  onClick={executeApi}
                  disabled={testLoading}
                  className="w-full max-w-xs flex items-center justify-center gap-2 h-12 rounded-xl bg-[#5B5AF7] hover:bg-[#4338CA] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Executing...</>
                  ) : (
                    <><Play size={16} fill="currentColor" /> Send Request</>
                  )}
                </button>
              </div>

              {/* Response Section */}
              {testStatus !== null && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ChevronRight size={16} className="text-emerald-500" /> Response
                    </h3>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">Status:</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md uppercase tracking-widest border",
                          testStatus >= 200 && testStatus < 300 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                        )}>
                          {testStatus} {testStatus >= 200 && testStatus < 300 ? 'OK' : 'Error'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">Time:</span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{testTime}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mb-2">
                    <button onClick={downloadJson} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                      <Download size={14} /> Download JSON
                    </button>
                    <button onClick={() => setTestResponse(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-200 hover:text-rose-600 text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                      <XCircle size={14} /> Clear Response
                    </button>
                  </div>

                  <JsonViewer data={testResponse} />
                  
                  {testHeaders && (
                     <div className="mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Response Headers</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-40 overflow-y-auto custom-scrollbar">
                           {Object.entries(testHeaders).map(([k, v]) => (
                           <div key={k} className="flex gap-4 text-xs font-mono mb-1.5 last:mb-0">
                              <span className="text-slate-400 min-w-[140px] font-bold truncate" title={k}>{k}:</span>
                              <span className="text-slate-600 break-all">{String(v)}</span>
                           </div>
                           ))}
                        </div>
                     </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

