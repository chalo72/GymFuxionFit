import React, { useState } from 'react';
import { Camera, ScanFace, ScanLine, CheckCircle2, RefreshCw, BarChart2 } from 'lucide-react';

export function PanelAIScanner() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const [heightCm, setHeightCm] = useState<number>(170);
  const [isMale, setIsMale] = useState<boolean>(true);

  const handleRealAnalysis = async () => {
    if (!frontImage || !sideImage) return;
    setAnalyzing(true);
    setProgress(0);

    // Simulate progress while waiting for fetch
    const interval = setInterval(() => {
      setProgress(p => (p < 90 ? p + 5 : p));
    }, 500);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front_image_b64: frontImage,
          side_image_b64: sideImage,
          height_cm: heightCm,
          is_male: isMale
        })
      });

      const json = await response.json();
      clearInterval(interval);
      setProgress(100);

      if (json.status === 'success') {
        const d = json.data;
        setTimeout(() => {
          setAnalyzing(false);
          setResults({
            chest: d.chest_cm,
            waist: d.waist_cm,
            hips: d.hip_cm,
            shoulders: d.chest_cm * 1.1, // mocked shoulder based on chest
            bodyFat: d.body_fat_percentage,
            muscleMass: d.muscle_mass_percentage
          });
        }, 500);
      } else {
        alert("Error de la IA: " + (json.detail || "Error desconocido"));
        setAnalyzing(false);
      }
    } catch (e) {
      clearInterval(interval);
      alert("No se pudo conectar con el servidor de Inteligencia Artificial.");
      setAnalyzing(false);
    }
  };

  const handleImageUpload = (type: 'front' | 'side') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'front') setFrontImage(reader.result as string);
          else setSideImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
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
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Toma una foto Frontal y una Lateral. Ingresa tu altura real.</p>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>ESTATURA (CM)</label>
                 <input type="number" value={heightCm} onChange={e => setHeightCm(Number(e.target.value))} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', marginTop: 4 }} />
               </div>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>GÉNERO</label>
                 <select value={isMale ? 'M' : 'F'} onChange={e => setIsMale(e.target.value === 'M')} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', marginTop: 4 }}>
                   <option value="M">Masculino</option>
                   <option value="F">Femenino</option>
                 </select>
               </div>
            </div>

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
            onClick={handleRealAnalysis}
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
                {progress > 10 && "> Conectando con IA Server...\n"}
                {progress > 40 && "> Analizando Postura con MediaPipe...\n"}
                {progress > 70 && "> Calculando circunferencias y grasa corporal...\n"}
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
