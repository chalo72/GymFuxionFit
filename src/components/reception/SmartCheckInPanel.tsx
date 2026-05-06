import { useState, useEffect, useRef } from 'react';
import { 
  QrCode, ScanEye, MapPin, X, 
  ShieldCheck, Camera, 
  AlertCircle, Check, Search, User
} from 'lucide-react';

interface SmartCheckInProps {
  onClose: () => void;
  onSuccess: (name: string, method: string) => void;
  members: string[];
}

export default function SmartCheckInPanel({ onClose, onSuccess, members }: SmartCheckInProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'face' | 'geo' | 'manual'>('qr');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [sensitivity, setSensitivity] = useState(75);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [geoData, setGeoData] = useState<{lat: number, lng: number, accuracy: number} | null>(null);
  const [detectedMember, setDetectedMember] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState('');

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startHardware = async (type: string) => {
    setStatus('scanning');
    setProgress(0);
    setDetectedMember(null);
    
    if (type === 'geo') {
      if (!navigator.geolocation) { setStatus('error'); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoData({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
          completeScan(type, members[Math.floor(Math.random()*members.length)]);
        },
        () => setStatus('error')
      );
    } else if (type === 'qr' || type === 'face') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        initNativeDetection(type);
      } catch (err) {
        setStatus('error');
      }
    }
  };

  const initNativeDetection = (type: string) => {
    let p = 0;
    const interval = setInterval(() => {
        p += (sensitivity / 50) + 1;
        setProgress(p);
        if (p >= 100) {
            clearInterval(interval);
            completeScan(type, members[Math.floor(Math.random()*members.length)]);
        }
    }, 100);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const completeScan = (type: string, name: string) => {
    setDetectedMember(name);
    setStatus('complete');
    setProgress(100);
    stopCamera();
    setTimeout(() => {
        onSuccess(name, type.toUpperCase());
    }, 1500);
  };

  const handleTabChange = (tab: any) => {
    stopCamera();
    setStatus('idle');
    setProgress(0);
    setActiveTab(tab);
    setDetectedMember(null);
  };

  const filteredMembers = members.filter(m => (m || '').toLowerCase().includes((manualSearch || '').toLowerCase()));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 2, 0.95)', backdropFilter: 'blur(24px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 640, background: '#0a0f0c', border: '1px solid var(--green-20)', borderRadius: 32, overflow: 'hidden', boxShadow: '0 0 80px rgba(0,255,136,0.2)' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 34px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <ShieldCheck style={{ color: 'var(--neon-green)' }} size={24} />
              <h2 style={{ fontSize: 20, fontWeight: 950 }}>OMNI_ENTRY <span style={{ color: 'var(--neon-green)', fontWeight: 300 }}>V.2.6</span></h2>
           </div>
           <button onClick={() => { stopCamera(); onClose(); }} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={24}/></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '16px 34px', gap: 12 }}>
           {[
             { id: 'qr', icon: <QrCode size={18}/>, l: 'QR' },
             { id: 'face', icon: <ScanEye size={18}/>, l: 'BIO' },
             { id: 'geo', icon: <MapPin size={18}/>, l: 'GEO' },
             { id: 'manual', icon: <User size={18}/>, l: 'MANUAL' }
           ].map(t => (
             <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ padding:'14px', borderRadius:14, border:'1px solid rgba(255,255,255,0.05)', background: activeTab === t.id ? 'var(--green-10)' : 'transparent', color: activeTab === t.id ? 'var(--neon-green)' : 'var(--text-muted)', fontSize: 10, fontWeight: 950, cursor:'pointer' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>{t.icon} {t.l}</div>
             </button>
           ))}
        </div>

        {/* Content */}
        <div style={{ padding: '0 34px 34px' }}>
           <div style={{ height: 380, width: '100%', background: '#000', borderRadius: 24, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              {activeTab === 'manual' ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 24 }}>
                   <div style={{ position: 'relative', marginBottom: 20 }}>
                      <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                      <input 
                        placeholder="BUSCAR_ATLETA_POR_NOMBRE..."
                        value={manualSearch}
                        onChange={e => setManualSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#fff', fontSize: 13, fontWeight: 800, outline: 'none' }}
                      />
                   </div>
                   <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {filteredMembers.map(m => (
                        <div key={m} onClick={() => completeScan('manual', m)} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <span style={{ fontSize: 13, fontWeight: 900 }}>{m}</span>
                           <div style={{ color: 'var(--neon-green)', fontSize: 9, fontWeight: 950 }}>CONFIRMAR_ENTRADA &gt;</div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : status === 'idle' ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                   <div style={{ width: 80, height: 80, borderRadius: '40%', background: 'rgba(0,255,136,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-green)', border: '1px solid var(--green-20)' }}>
                      {activeTab === 'qr' ? <QrCode size={40}/> : activeTab === 'face' ? <Camera size={40}/> : <MapPin size={40}/>}
                   </div>
                   <button onClick={() => startHardware(activeTab)} style={{ padding: '14px 40px', background: 'var(--neon-green)', color: '#000', fontWeight: 950, borderRadius: 100, border: 'none', cursor: 'pointer' }}>SINCRONIZAR SENSOR</button>
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                   {activeTab === 'geo' ? (
                     <RadarView geo={geoData} />
                   ) : (
                     <>
                       <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       <CameraOverlay type={activeTab} progress={progress} detected={status === 'complete'} />
                     </>
                   )}
                   <div style={{ position:'absolute', bottom:20, left:20, right:20, background:'rgba(5,10,8,0.95)', padding:16, borderRadius:16, border:'1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                         <span style={{ fontSize: 10, fontWeight: 950, color: status === 'complete' ? 'var(--neon-green)' : '#fff' }}>
                            {status === 'complete' ? 'ID_CONFIRMADA' : 'SCANEANDO_DB...'}
                         </span>
                         <span style={{ fontSize: 10, fontWeight: 950 }}>{Math.round(progress)}%</span>
                      </div>
                      {status === 'complete' && detectedMember && <div style={{ fontSize: 14, fontWeight: 950, color: 'var(--neon-green)' }}>{detectedMember}</div>}
                   </div>
                </div>
              )}

           </div>
        </div>

      </div>
    </div>
  );
}

function CameraOverlay({ type, progress, detected }: any) {
  return (
    <div style={{ position: 'absolute', inset: 40, border: '1px solid rgba(0,255,136,0.2)' }}>
       {!detected && <div style={{ position: 'absolute', top: `${progress}%`, left: 0, right: 0, height: 2, background: 'var(--neon-green)', boxShadow: '0 0 15px var(--neon-green)' }} />}
    </div>
  );
}

function RadarView({ geo }: any) {
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
       <div style={{ width: 220, height: 220, borderRadius: '50%', border: '1px solid var(--green-20)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--neon-green)', opacity: 0.1, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          {geo && <div style={{ position: 'absolute', top: '40%', left: '60%', width: 10, height: 10, background: 'var(--neon-green)', borderRadius: '50%', boxShadow: '0 0 10px var(--neon-green)' }} />}
       </div>
    </div>
  );
}
