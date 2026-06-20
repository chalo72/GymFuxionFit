import React, { useState } from 'react';
import { Camera, ScanFace, ScanLine, CheckCircle2, RefreshCw, BarChart2 } from 'lucide-react';

export function PanelAIScanner() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const simulateAnalysis = () => {
    if (!frontImage || !sideImage) return;
    setAnalyzing(true);
    setProgress(0);

    const steps = [
      { p: 25, t: 800 },
      { p: 60, t: 1500 },
      { p: 85, t: 2200 },
      { p: 100, t: 3000 }
    ];

    steps.forEach(({ p, t }) => {
      setTimeout(() => setProgress(p), t);
    });

    setTimeout(() => {
      setAnalyzing(false);
      setResults({
        chest: 102.5,
        waist: 84.0,
        hips: 98.2,
        shoulders: 115.0,
        bodyFat: 14.5
      });
    }, 3200);
  };

  const handleImageUpload = (type: 'front' | 'side') => {
    // Simulamos que el usuario tomó una foto y la guardamos como un placeholder visual
    const mockImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300' fill='%23111'%3E%3Crect width='200' height='300' rx='20' fill='%23000' stroke='%2300FF88' stroke-width='2'/%3E%3Cpath d='M100 50 c -20 0 -20 30 0 30 c 20 0 20 -30 0 -30 M70 100 q 30 20 60 0 l 20 100 h -20 l -10 -50 l -10 50 h -20 l 20 -100' stroke='%2300FF88' stroke-width='4' fill='none' opacity='0.5'/%3E%3C/svg%3E";
    if (type === 'front') setFrontImage(mockImage);
    else setSideImage(mockImage);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>Escáner IA</h2>
          <p style={{ color: 'var(--neon-green)', fontSize: 12, fontWeight: 800 }}>MediaPipe + MiDaS Vision</p>
        </div>
        <ScanFace size={32} color="var(--neon-green)" />
      </div>

      {!results ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24, borderRadius: 24, border: '1px solid rgba(0,255,136,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 950, marginBottom: 16 }}>Captura Biometría</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Asegúrate de vestir ropa ajustada y coloca el celular a la altura de la cintura a 2 metros de distancia.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Foto Frontal */}
              <div 
                onClick={() => handleImageUpload('front')}
                style={{ 
                  height: 200, borderRadius: 16, border: frontImage ? '2px solid var(--neon-green)' : '2px dashed rgba(255,255,255,0.2)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
                  background: frontImage ? `url(${frontImage}) center/cover` : 'rgba(255,255,255,0.02)'
                }}
              >
                {!frontImage && (
                  <>
                    <Camera size={32} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>FOTO FRONTAL</span>
                  </>
                )}
                {frontImage && <CheckCircle2 size={32} color="var(--neon-green)" style={{ background: '#000', borderRadius: '50%' }} />}
              </div>

              {/* Foto Lateral */}
              <div 
                onClick={() => handleImageUpload('side')}
                style={{ 
                  height: 200, borderRadius: 16, border: sideImage ? '2px solid var(--neon-green)' : '2px dashed rgba(255,255,255,0.2)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
                  background: sideImage ? `url(${sideImage}) center/cover` : 'rgba(255,255,255,0.02)'
                }}
              >
                {!sideImage && (
                  <>
                    <Camera size={32} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>FOTO LATERAL</span>
                  </>
                )}
                {sideImage && <CheckCircle2 size={32} color="var(--neon-green)" style={{ background: '#000', borderRadius: '50%' }} />}
              </div>
            </div>
          </div>

          <button 
            onClick={simulateAnalysis}
            disabled={!frontImage || !sideImage || analyzing}
            style={{ 
              padding: 24, borderRadius: 20, border: 'none', 
              background: (!frontImage || !sideImage) ? 'rgba(255,255,255,0.1)' : 'var(--neon-green)',
              color: (!frontImage || !sideImage) ? '#888' : '#000',
              fontWeight: 950, fontSize: 16, cursor: (!frontImage || !sideImage || analyzing) ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
              boxShadow: (frontImage && sideImage && !analyzing) ? '0 10px 30px rgba(0,255,136,0.3)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            {analyzing ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                ANALIZANDO {progress}%
              </>
            ) : (
              <>
                <ScanLine size={20} />
                INICIAR ESCANEO 3D
              </>
            )}
          </button>
          
          {analyzing && (
            <div style={{ padding: 16, background: 'rgba(0,255,136,0.05)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)' }}>
              <div style={{ fontSize: 11, color: 'var(--neon-green)', marginBottom: 8 }}>Log de Sistema:</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {progress > 10 && "> Extrayendo puntos clave MediaPipe... OK\n"}
                {progress > 40 && "> Generando mapa de profundidad MiDaS... OK\n"}
                {progress > 70 && "> Calculando circunferencias y escala... OK"}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 30, borderRadius: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 950, color: '#fff' }}>Reporte Biométrico</h3>
              <p style={{ fontSize: 12, color: 'var(--neon-green)' }}>Precisión estimada: ±2.5cm</p>
            </div>
            <BarChart2 size={32} color="var(--neon-green)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
            {[
              { label: 'PECHO', val: results.chest, unit: 'cm' },
              { label: 'CINTURA', val: results.waist, unit: 'cm' },
              { label: 'CADERA', val: results.hips, unit: 'cm' },
              { label: 'HOMBROS', val: results.shoulders, unit: 'cm' }
            ].map(m => (
              <div key={m.label} style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>{m.label}</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: '#fff' }}>{m.val}<span style={{ fontSize: 14, color: 'var(--neon-green)' }}>{m.unit}</span></div>
              </div>
            ))}
          </div>

          <div style={{ padding: 24, background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, transparent 100%)', borderRadius: 24, border: '1px solid rgba(0,255,136,0.2)', marginBottom: 'auto' }}>
             <div style={{ fontSize: 12, fontWeight: 950, color: 'var(--neon-green)', marginBottom: 8 }}>GRASA CORPORAL ESTIMADA</div>
             <div style={{ fontSize: 48, fontWeight: 950, color: '#fff', letterSpacing: -2 }}>{results.bodyFat}<span style={{ fontSize: 24 }}>%</span></div>
          </div>

          <button 
            onClick={() => { setResults(null); setFrontImage(null); setSideImage(null); }}
            style={{ width: '100%', padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 950, cursor: 'pointer', marginTop: 20 }}
          >
            NUEVO ESCANEO
          </button>
        </div>
      )}
    </div>
  );
}
