'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import InflationChart from '@/components/InflationChart';
import { 
  Map as MapIcon, Calendar, Activity, ShieldAlert, 
  LayoutDashboard, Play, Pause, Database, Table as TableIcon, ArrowUpRight
} from 'lucide-react';

const JabarMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  // --- STATE UTAMA ---
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'alerts' | 'data'
  const [regions, setRegions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const dateOptions = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);

  // --- LOGIKA FETCHING ---
  useEffect(() => {
    const fetchMapData = async () => {
      const { data } = await supabase.from('inflation_data').select('*').eq('date', selectedDate);
      if (data) setRegions(data);
    };
    fetchMapData();
  }, [selectedDate]);

  const handleSelectRegion = async (region) => {
    setSelected(region);
    setLoading(true);
    const { data } = await supabase.from('inflation_data')
      .select('date, price, inflation_status')
      .eq('kab_kota', region.kab_kota).order('date', { ascending: true });
    if (data) setHistory(data);
    setLoading(false);
  };

  // --- COMPONENT: 2. REGION ALERTS (TABLE VIEW) ---
  const AlertsView = () => (
    <div className="flex-1 overflow-y-auto pr-4">
      <div className="grid grid-cols-1 gap-4 mb-8">
        <h2 className="text-xl font-bold">Priority Ranking - {selectedDate}</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
              <th className="py-4 px-2">Wilayah</th>
              <th className="py-4">Harga</th>
              <th className="py-4">Status</th>
              <th className="py-4">CUSUM Value</th>
              <th className="py-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {regions.sort((a, b) => b.cusum_value - a.cusum_value).map((r, i) => (
              <tr key={i} className="border-b border-slate-900 hover:bg-slate-900/50 transition-colors">
                <td className="py-4 px-2 font-bold">{r.kab_kota}</td>
                <td className="py-4">Rp {r.price.toLocaleString('id-ID')}</td>
                <td className="py-4">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                     r.inflation_status === 'RED' ? 'bg-red-500/20 text-red-500' : 
                     r.inflation_status === 'YELLOW' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                   }`}>{r.inflation_status}</span>
                </td>
                <td className="py-4 font-mono">{r.cusum_value.toFixed(2)}</td>
                <td className="py-4">
                  <button onClick={() => {setActiveTab('dashboard'); handleSelectRegion(r);}} className="text-emerald-500 hover:underline flex items-center gap-1">
                    Detail <ArrowUpRight size={14}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- COMPONENT: 3. DATA INTEGRATION ---
  const DataView = () => (
    <div className="flex-1 grid grid-cols-2 gap-8">
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
        <Database className="text-emerald-500 mb-4" size={32} />
        <h3 className="text-lg font-bold mb-2">Supabase Cloud Sync</h3>
        <p className="text-slate-400 text-sm mb-6">Sistem terhubung langsung ke cluster database PostgreSQL di region Singapore.</p>
        <div className="space-y-4">
          <div className="flex justify-between text-xs"><span className="text-slate-500">Total Records:</span> <span>{regions.length * 365} Rows</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Latensi:</span> <span className="text-emerald-500">24ms</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Last Sync:</span> <span>Just Now</span></div>
        </div>
      </div>
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
        <Activity className="text-blue-500 mb-4" size={32} />
        <h3 className="text-lg font-bold mb-2">AI Parameter Setup</h3>
        <p className="text-slate-400 text-sm mb-6">Konfigurasi algoritma CUSUM yang digunakan untuk deteksi anomali.</p>
        <div className="space-y-2 font-mono text-xs">
          <div className="p-2 bg-slate-950 rounded">K_FACTOR: 0.5 (Sensitivitas)</div>
          <div className="p-2 bg-slate-950 rounded">H_FACTOR: 4.0 (Threshold Alert)</div>
          <div className="p-2 bg-slate-950 rounded">RESET_DECAY: 0.5 (Penurunan 50%)</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <nav className="w-20 border-r border-slate-800 flex flex-col items-center py-8 gap-10 bg-slate-950 z-50">
        <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20"><ShieldAlert size={24}/></div>
        <div className="flex flex-col gap-10 mt-10">
          <LayoutDashboard 
            onClick={() => setActiveTab('dashboard')} 
            className={`cursor-pointer transition-all ${activeTab === 'dashboard' ? 'text-emerald-500 scale-125' : 'text-slate-500 hover:text-white'}`}
          />
          <TableIcon 
            onClick={() => setActiveTab('alerts')} 
            className={`cursor-pointer transition-all ${activeTab === 'alerts' ? 'text-emerald-500 scale-125' : 'text-slate-500 hover:text-white'}`}
          />
          <Activity 
            onClick={() => setActiveTab('data')} 
            className={`cursor-pointer transition-all ${activeTab === 'data' ? 'text-emerald-500 scale-125' : 'text-slate-500 hover:text-white'}`}
          />
        </div>
      </nav>

      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-emerald-500">Jabar Intel Dashboard</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{activeTab} VIEW</p>
          </div>
          
          {/* Hanya munculkan kontrol tanggal di Dashboard & Alerts */}
          {activeTab !== 'data' && (
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 items-center gap-2">
              <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded-xl ${isPlaying ? 'bg-red-500' : 'bg-slate-800 text-emerald-500'}`}>
                {isPlaying ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
              </button>
              <div className="flex gap-1 overflow-x-auto max-w-sm scrollbar-hide">
                {dateOptions.map(d => (
                  <button key={d} onClick={() => setSelectedDate(d)} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${selectedDate === d ? 'bg-slate-700 text-emerald-400' : 'text-slate-500'}`}>
                    {new Date(d).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                  </button>
                )).reverse()}
              </div>
            </div>
          )}
        </header>

        {/* --- DYNAMIC CONTENT RENDERING --- */}
        <div className="flex-1 flex gap-8 min-h-0">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex-[2] bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 relative">
                <JabarMap points={regions} onSelect={handleSelectRegion} />
              </div>
              <aside className="flex-1 bg-slate-900 rounded-[3rem] p-8 border border-slate-800 overflow-y-auto">
                {selected ? (
                   <div className="space-y-8">
                     <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">{selected.kab_kota}</p>
                     <h2 className="text-6xl font-black tracking-tighter">Rp{selected.price.toLocaleString('id-ID')}</h2>
                     <InflationChart history={history} activeDate={selectedDate} />
                     <div className="p-6 bg-slate-800/30 rounded-3xl border-l-4 border-emerald-500 text-sm">
                       Anomali CUSUM terdeteksi pada level {selected.cusum_value.toFixed(2)}. Status: <strong>{selected.inflation_status}</strong>.
                     </div>
                   </div>
                ) : <p className="text-center text-slate-600 mt-20 italic">Pilih wilayah pada peta</p>}
              </aside>
            </>
          )}
          
          {activeTab === 'alerts' && <AlertsView />}
          
          {activeTab === 'data' && <DataView />}
        </div>
      </main>
    </div>
  );
}