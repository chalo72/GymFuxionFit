import React, { useState, useEffect } from 'react';
import { Scan, Activity, ShieldCheck, Target, Zap, Rotate3d } from 'lucide-react';

export default function GenesisScan() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('READY TO SCAN');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (scanning) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setScanning(false);
            setScanStatus('ANALYSIS COMPLETE');
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  const startScan = () => {
    setProgress(0);
    setScanning(true);
    setScanStatus('TRACKING 33 KEYPOINTS...');
  };

  return (
    <div className="animate-fade-in">
      {/* ─── HEADER ─── */}
      <div className="glass-card-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="navbar-title">Genesis Scan <span style={{ color: 'var(--electric-cyan)', fontSize: '1rem', marginLeft: 8 }}>v3.1 Elite</span></h1>
          <p className="glass-card-subtitle">Análisis Biométrico y Tracking de Keypoints en Tiempo Real</p>
        </div>
        <button className="btn btn-glow" onClick={startScan} disabled={scanning}>
          {scanning ? <Activity className="animate-spin" /> : <Scan />}
          {scanning ? 'SCANNING...' : 'INICIAR ESCANEO'}
        </button>
      </div>

      <div className="dashboard-grid">
        {/* ─── VISTA SCANNER (SIMULADA) ─── */}
        <div className="glass-card" style={{ height: 600, position: 'relative', overflow: 'hidden', border: '2px solid var(--cyan-15)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {/* Simulación de malla 3D/Wireframe */}
             <div style={{ width: '100%', height: '100%', border: '1px solid var(--cyan-5)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 200, height: 400, border: '2px dashed var(--cyan-20)', borderRadius: '100px 100px 40px 40px' }}>
                    {/* Keypoints simulados */}
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          position: 'absolute', 
                          top: `${Math.random() * 80 + 10}%`, 
                          left: `${Math.random() * 80 + 10}%`, 
                          width: 8, 
                          height: 8, 
                          background: 'var(--electric-cyan)', 
                          borderRadius: '50%',
                          boxShadow: 'var(--glow-cyan)',
                          opacity: scanning ? 1 : 0.3,
                          transition: 'opacity 0.3s'
                        }} 
                      />
                    ))}
                </div>
                {scanning && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      width: '100%', 
                      height: '2px', 
                      background: 'var(--electric-cyan)', 
                      boxShadow: 'var(--glow-cyan-strong)',
                      top: `${progress}%`,
                      transition: 'top 0.05s linear'
                    }} 
                  />
                )}
             </div>
          </div>
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              <span style={{ color: 'var(--electric-cyan)' }}>{scanStatus}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* ─── RESULTADOS LATERALES ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 className="glass-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck style={{ color: 'var(--success-green)' }} />
              Estado Bio-Mecánico
            </h3>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Postura Columna', value: 'ÓPTIMA', color: 'var(--success-green)' },
                { label: 'Balance de Carga', value: '48% L / 52% R', color: 'var(--electric-cyan)' },
                { label: 'Fatiga Muscular', value: 'BAJA (12%)', color: 'var(--success-green)' },
                { label: 'Keypoints Activos', value: '33/33', color: 'var(--electric-cyan)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--space-medium)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 700, fontSize: 'var(--text-sm)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ flex: 1 }}>
            <h3 className="glass-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Target style={{ color: 'var(--energy-orange)' }} />
              Avatar 3D Preview
            </h3>
            <div style={{ height: 200, marginTop: 16, background: 'var(--space-dark)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--cyan-15)' }}>
               <Rotate3d size={48} style={{ color: 'var(--text-muted)', animation: 'float-slow 3s infinite' }} />
               <p style={{ position: 'absolute', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 80 }}>Esperando Renderizado 3D...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
