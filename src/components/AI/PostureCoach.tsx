import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, VERSION, Results } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { calculateAngle, createDebouncer } from '../../utils/ai/geometry';
import { Activity, Camera as CameraIcon, CheckCircle, RefreshCcw, Shield, X, AlertTriangle } from 'lucide-react';

export function PostureCoach() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('Prepárate frente a la cámara');
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [formQuality, setFormQuality] = useState<'perfect' | 'warning' | 'error'>('perfect');
  
  const debouncer = useRef(createDebouncer(800)).current;

  useEffect(() => {
    let camera: Camera | null = null;
    let pose: Pose | null = null;

    const initAI = async () => {
      pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${VERSION}/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      if (webcamRef.current && webcamRef.current.video) {
        camera = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current && webcamRef.current.video) {
              await pose!.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
        setIsReady(true);
      }
    };

    initAI();

    return () => {
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, []);

  const onResults = (results: Results) => {
    if (!canvasRef.current || !webcamRef.current?.video) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    
    // Draw Video Frame (Optional, webcam already shows it, but we draw it to layer the skeleton exactly)
    // Actually, webcam component shows video natively, we just need to draw the skeleton on a transparent canvas overlay.
    
    if (results.poseLandmarks) {
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF88', lineWidth: 4 });
      drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF3D57', lineWidth: 2, radius: 4 });

      // Lógica de Sentadillas (Squats) - Traducida de FitFusion
      // Hombro (11, 12), Cadera (23, 24), Rodilla (25, 26), Tobillo (27, 28)
      // Usaremos el lado izquierdo (impares) o derecho (pares) dependiendo de la visibilidad
      
      const leftHip = results.poseLandmarks[23];
      const leftKnee = results.poseLandmarks[25];
      const leftAnkle = results.poseLandmarks[27];
      
      const rightHip = results.poseLandmarks[24];
      const rightKnee = results.poseLandmarks[26];
      const rightAnkle = results.poseLandmarks[28];

      // Seleccionar el lado más visible
      const useLeft = (leftHip.visibility || 0) > (rightHip.visibility || 0);
      
      const hip = useLeft ? leftHip : rightHip;
      const knee = useLeft ? leftKnee : rightKnee;
      const ankle = useLeft ? leftAnkle : rightAnkle;
      const shoulder = useLeft ? results.poseLandmarks[11] : results.poseLandmarks[12];

      if (hip.visibility! > 0.5 && knee.visibility! > 0.5 && ankle.visibility! > 0.5) {
        // 1. Ángulo de la rodilla (para contar reps)
        const kneeAngle = calculateAngle(hip, knee, ankle);
        
        // 2. Ángulo de la cadera (Hombro-Cadera-Rodilla) para evaluar inclinación del torso
        const hipAngle = calculateAngle(shoulder, hip, knee);

        // Lógica de conteo y feedback
        if (kneeAngle > 160) {
          if (stage === 'down') {
            if (debouncer()) {
              setReps(prev => prev + 1);
            }
          }
          setStage('up');
          setFeedback('Baja lentamente...');
          setFormQuality('perfect');
        } 
        else if (kneeAngle < 90) {
          setStage('down');
          setFeedback('¡Sube con fuerza!');
          
          if (hipAngle < 50) {
            setFeedback('¡Cuidado! Mantén el pecho arriba');
            setFormQuality('warning');
          } else {
            setFormQuality('perfect');
          }
        }
        else if (kneeAngle < 140 && kneeAngle >= 90) {
          setFeedback('Sigue bajando (Rompe el paralelo)');
          setFormQuality('perfect');
        }

        // HUD Visual - Mostrar Ángulo
        canvasCtx.font = '24px "Space Grotesk"';
        canvasCtx.fillStyle = formQuality === 'perfect' ? '#00FF88' : '#FF3D57';
        canvasCtx.fillText(`${Math.round(kneeAngle)}°`, knee.x * videoWidth + 20, knee.y * videoHeight);
      } else {
        setFeedback('Alejate un poco. Necesito ver tu cuerpo completo.');
        setFormQuality('error');
      }
    } else {
      setFeedback('No se detecta a nadie. Colócate frente a la cámara.');
      setFormQuality('error');
    }

    canvasCtx.restore();
  };

  return (
    <div className="ai-coach-container" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '600px', backgroundColor: '#000', borderRadius: '24px', overflow: 'hidden' }}>
      
      {/* HEADER HUD */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Activity color="var(--neon-green)" />
          <h2 style={{ margin: 0, color: 'white', fontSize: 20, letterSpacing: '2px' }}>AI POSTURE COACH</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>{reps}</span> <span style={{ color: 'var(--text-muted)' }}>REPS</span>
        </div>
      </div>

      {/* WEBCAM & CANVAS STACK */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {!isReady && (
          <div style={{ position: 'absolute', zIndex: 5, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <RefreshCcw className="spinner" size={48} color="var(--neon-green)" />
            <p>Iniciando Motor Cuántico MediaPipe...</p>
          </div>
        )}
        
        <Webcam
          ref={webcamRef}
          mirrored={true}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: isReady ? 1 : 0, transition: 'opacity 0.5s' }}
        />
        
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 2, transform: 'scaleX(-1)' }} // Espejo para coincidir con la webcam
        />
      </div>

      {/* FOOTER FEEDBACK HUD */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 10 }}>
        <div style={{ 
          background: formQuality === 'perfect' ? 'rgba(0,255,136,0.1)' : formQuality === 'warning' ? 'rgba(255,170,0,0.1)' : 'rgba(255,61,87,0.1)', 
          border: `1px solid ${formQuality === 'perfect' ? 'var(--neon-green)' : formQuality === 'warning' ? '#FFAA00' : 'var(--neon-red)'}`,
          padding: '20px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          transition: 'all 0.3s'
        }}>
          {formQuality === 'perfect' ? <CheckCircle color="var(--neon-green)" size={32} /> : formQuality === 'warning' ? <AlertTriangle color="#FFAA00" size={32} /> : <X color="var(--neon-red)" size={32} />}
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: 18 }}>{feedback}</h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
              {stage === 'up' ? 'Fase Concéntrica (Preparación)' : 'Fase Excéntrica (Tensión)'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
