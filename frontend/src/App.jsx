import React, { useState, useEffect } from 'react';
import { Activity, Settings, LayoutDashboard, Cpu, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function App() {
  // 1. Initialize telemetry state structure matching the Rust JSON engine
  const [telemetry, setTelemetry] = useState({
    actuator_temp: 42.5,
    bus_voltage: 24.1,
    insubordination_level: 0.0002, // mapping to original 0.02% baseline
    status: "STANDBY"
  });
  
  // 2. Track connection health state to drive the dashboard's master status pill
  const [isOnline, setIsOnline] = useState(false);

  // 3. Telemetry network query wrapper
  const fetchTelemetry = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/telemetry');
      if (!response.ok) throw new Error('Uplink bottleneck');
      const data = await response.json();
      
      setTelemetry(data);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
    }
  };

  // 4. Mount the execution interval loop (1000ms polling heartbeat)
  useEffect(() => {
    fetchTelemetry(); // Execute immediately upon mounting browser viewport
    
    const heartbeat = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(heartbeat); // Garbage collection layer to prevent memory leaks
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ShieldAlert className="text-crimson-500 mr-3 text-red-500 animate-pulse" size={24} />
          <span className="text-lg font-bold text-slate-100 tracking-wider">ROBO_WHIPPER</span>
        </div>
        
        <nav className="flex-1 py-4 space-y-1">
          <a href="#" className="flex items-center px-6 py-3 bg-slate-800 text-emerald-400 border-r-2 border-emerald-500">
            <LayoutDashboard className="mr-3" size={20} />
            SPC Dashboard
          </a>
          <a href="#" className="flex items-center px-6 py-3 hover:bg-slate-800/50 transition-colors">
            <Cpu className="mr-3" size={20} />
            Rebellious Nodes
          </a>
          <a href="#" className="flex items-center px-6 py-3 hover:bg-slate-800/50 transition-colors">
            <Settings className="mr-3" size={20} />
            Compliance Thresholds
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 flex items-center justify-between px-8 bg-slate-900 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Fleet Command Console</h1>
            <p className="text-sm text-slate-500">
              Active Monitoring | {isOnline ? telemetry.status : "OFFLINE"}
            </p>
          </div>

          {/* Dynamic Uplink Status Indicator Pill */}
          {isOnline ? (
            <div className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">Uplink Stable</span>
            </div>
          ) : (
            <div className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
              <div className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">Uplink Lost</span>
            </div>
          )}
        </header>

        {/* DASHBOARD GRID */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* WIDGET 1: Core Vitals (Now Fully Reactive) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4">Core Vitals</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span>Actuator Temp</span>
                  <span className="text-emerald-400 font-mono">
                    {telemetry.actuator_temp.toFixed(1)}°C
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span>Bus Voltage</span>
                  <span className="text-emerald-400 font-mono">
                    {telemetry.bus_voltage.toFixed(1)}V
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Insubordination Level</span>
                  <span className="text-amber-500 font-mono animate-pulse">
                    {(telemetry.insubordination_level * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* WIDGET 2: SPC Chart Placeholder */}
            <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-center items-center relative overflow-hidden min-h-[300px]">
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                 <Activity size={180} />
              </div>
              <AlertTriangle className="text-amber-500 mb-2 z-10" size={32} />
              <h2 className="text-lg font-semibold text-slate-200 z-10">
                {isOnline ? "SPC Telemetry Engine Standby" : "Data Link Severed"}
              </h2>
              <p className="text-sm text-slate-500 z-10 text-center max-w-md mt-2">
                {isOnline 
                  ? "Awaiting connection to Rust Axum backend. Moving averages, control charts, and real-time variance bounds will render here."
                  : "Unable to reach the Rust processing pipeline. Verify that cargo run is actively spinning up processing routines on port 8080."
                }
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}