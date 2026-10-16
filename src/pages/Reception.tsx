import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  DollarSign, Search, AlertTriangle,
  CheckCircle2, CreditCard, Smartphone, Banknote,
  TrendingUp, Users, X, Plus, ShoppingBag,
  LogIn, LogOut, Eye, Phone, Mail, MapPin,
  Calendar, BarChart2, Trash2, MinusCircle,
  QrCode, ScanEye, Camera, ShieldCheck, Activity,
  Zap, Database, Map as MapIcon, RefreshCcw, User,
  AlertCircle, HeartPulse, ChevronRight, Dumbbell,
  Contact, Star, Target, Clock, History, Edit2, UserX, Check, UserPlus
} from 'lucide-react';
import { useGymData, Member, roundPrice } from '../hooks/useGymData';
import { initials } from '../lib/safeText';
import { canEnterGym, diasMoratoria, memberFromQr, memberQrPayload } from '../lib/accessGate';
import { asignarNumeros, leerPasos, registrarPaso, type PasoPuerta } from '../lib/puerta';
import { aplicarAbono, fichaCuenta, mergeTab, sumarCredito, tabTotal } from '../lib/cuentaPiso';
import { useGymConfig, DEFAULT_PRODUCTS } from '../contexts/GymConfigContext';
import { AiAssist } from '../components/AiAssist';
import Empieza from '../components/layout/Empieza';
import { Link } from 'react-router-dom';
import QuickRegisterModal from '../components/reception/QuickRegisterModal';
import { PosCart } from '../components/reception/PosCart';
import { MembersList } from '../components/reception/MembersList';


/* ══════════════════════════════════════════
   TIPOS & MOCKS HIDRINOS
   ══════════════════════════════════════════ */
type CheckInMethod = 'qr' | 'facial' | 'geo' | 'manual';

/* ══════════════════════════════════════════
   COMPONENTES AUXILIARES
   ══════════════════════════════════════════ */
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
};

const diasPlan = (duration?: string) => {
  if (duration === 'semana') return 7;
  if (duration === 'quincena') return 15;
  if (duration === 'mes') return 30;
  return 1;
};

const catPlan = (duration?: string) => (duration === 'dia' ? 'daypass' : 'membership');

/* ══════════════════════════════════════════
   HYBRID RECEPTION HUB (FUSION v5.0 - PREMIUM GLASS)
   ══════════════════════════════════════════ */
export default function Reception() {
  const { members, transactions, clearMemberDebt, injectTransaction, products, registerProductSale, updateMemberStatus, plans, plansConfig, addMember } = useGymData();
  const { products: configProducts } = useGymConfig();

  /* ── KPIs del día calculados en tiempo real ── */
  const todayStr = new Date().toISOString().split('T')[0];
  const todayKpis = useMemo(() => {
    const todayTx = transactions.filter(t => t.date === todayStr && t.type === 'income');
    const total = todayTx.reduce((acc, t) => acc + t.amount, 0);
    const count = todayTx.length;
    const methodMap: Record<string, number> = {};
    todayTx.forEach(t => { methodMap[t.method] = (methodMap[t.method] || 0) + 1; });
    const topMethod = Object.entries(methodMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '--';
    const prodMap: Record<string, number> = {};
    todayTx.forEach(t => {
      const k = t.description?.replace(/^(Servicio: |Venta: )/, '') ?? 'Servicio';
      prodMap[k] = (prodMap[k] || 0) + 1;
    });
    const topProd = Object.entries(prodMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '--';
    return { total, count, topMethod, topProd };
  }, [transactions, todayStr]);

  const enSala = useMemo(() => members.filter((m) => m.presence?.inGym), [members]);
  const numeros = useMemo(() => asignarNumeros(members.map((m) => m.id)), [members]);
  const [pasos, setPasos] = useState<PasoPuerta[]>(() => leerPasos());
  const entraronHoy = useMemo(() => {
    const ids = new Set(pasos.filter((p) => p.date === todayStr && p.action === 'ENTRADA').map((p) => p.memberId));
    members.forEach((m) => { if (String(m.lastVisit || '').startsWith(todayStr)) ids.add(m.id); });
    return ids.size;
  }, [pasos, members, todayStr]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<CheckInMethod>('manual');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [alertMember, setAlertMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [cart, setCart] = useState<{ id: string, name: string, price: number, qty: number, category: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Nequi' | 'Crédito'>('Efectivo');
  const [productSearch, setProductSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [abonoAmount, setAbonoAmount] = useState('');
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Calcular posición fixed del dropdown de sugerencias
  useEffect(() => {
    if (suggestions.length > 0 && searchContainerRef.current) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    } else {
      setDropdownRect(null);
    }
  }, [suggestions]);

  // Timer de sala — no depende de cameraStream
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Limpieza de cámara e interval de escaneo al desmontar
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'manual') { setSuggestions([]); return; }
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = norm(search);
    const digits = search.replace(/\D/g, '');
    const filtered = [...members]
      .filter((m) => {
        if (!q) return true;
        const num = numeros[m.id] || '';
        return (m.name && norm(m.name).includes(q)) || (!!digits && (num === digits.padStart(3, '0') || num.endsWith(digits) || num.includes(digits)));
      })
      .sort((a, b) => Number(!!b.presence?.inGym) - Number(!!a.presence?.inGym) || (a.name || '').localeCompare(b.name || ''))
      .slice(0, 40);
    setSuggestions(filtered);
  }, [search, members, activeTab, numeros]);

  const startScanning = async (type: CheckInMethod) => {
    setActiveTab(type);
    if (type === 'manual') return;
    setStatus('idle');
    setProgress(0);
    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  };

  const handleSuccess = async (nameOrMember: string | Member, method: CheckInMethod) => {
    let masterMember: Member | undefined;
    if (typeof nameOrMember === 'string') {
      const digits = nameOrMember.replace(/\D/g, '');
      masterMember = digits
        ? members.find((m) => numeros[m.id] === digits.padStart(3, '0') || numeros[m.id] === digits)
        : undefined;
      if (!masterMember) masterMember = members.find(m => m.name && nameOrMember && m.name.toLowerCase() === nameOrMember.toLowerCase());
      if (!masterMember && method === 'manual') {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }
    } else {
      masterMember = nameOrMember;
    }

    if (!masterMember) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    setCart([]);
    setSelectedMember(masterMember);
    const live = members.find((x) => x.id === masterMember!.id) || masterMember;
    const yaDentro = !!live.presence?.inGym;

    if (!yaDentro) {
      const gate = canEnterGym(masterMember);
      if (!gate.ok) {
        setAlertMember(masterMember);
        setStatus('complete');
        setTimeout(() => { setStatus('idle'); stopCamera(); }, 1000);
        return;
      }
      if (gate.moratoria) {
        showToast(`Entra en moratoria: lleva ${gate.diasVencido} día(s) vencido. Cortesía de ${diasMoratoria()} días.`);
      }
    }

    const nameToUse = masterMember.name;
    const hora = new Date().toLocaleTimeString().slice(0, 5);
    const fecha = new Date().toISOString().slice(0, 10);
    const numero = numeros[masterMember.id] || '—';
    if (yaDentro) {
      await updateMemberStatus(masterMember.id, {
        presence: { inGym: false, enteredAt: live.presence?.enteredAt || Date.now(), method, doing: undefined },
      });
      setPasos(registrarPaso({ memberId: masterMember.id, name: nameToUse, numero, action: 'SALIDA', time: hora, date: fecha, method }));
      setLogs((prev) => [{ id: Date.now(), name: nameToUse, action: 'SALIDA', time: hora, method, color: '#C5D1CC' }, ...prev]);
    } else {
      await updateMemberStatus(masterMember.id, {
        presence: { inGym: true, enteredAt: Date.now(), method, doing: live.sessionLive ? 'Sesión con entrenador' : 'En sala' },
        lastVisit: new Date().toISOString(),
        visits: (live.visits || 0) + 1,
      });
      setPasos(registrarPaso({ memberId: masterMember.id, name: nameToUse, numero, action: 'ENTRADA', time: hora, date: fecha, method }));
      setLogs((prev) => [{ id: Date.now(), name: nameToUse, action: 'ENTRADA', time: hora, method, color: 'var(--neon-green)' }, ...prev]);
    }

    setStatus('complete');
    setTimeout(() => {
      setStatus('idle'); setProgress(0); stopCamera(); setSearch(''); setSuggestions([]);
    }, 1500);
  };

  const addToCart = (product: any) => {
     setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
           if (product.stock && existing.qty >= product.stock) {
              showToast('⚠️ Stock insuficiente para ese producto');
              return prev;
           }
           return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
        }
        return [...prev, { id: product.id, name: product.name, price: product.sellPrice || product.price || 0, qty: 1, category: product.category }];
     });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const handleFinalizeSale = async () => {
    if (!selectedMember || cart.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString().slice(0, 5);
    const live = members.find((m) => m.id === selectedMember.id) || selectedMember;
    const esFiado = paymentMethod === 'Crédito';
    try {
      let prod = 0;
      let mem = 0;
      let expiry = live.expiryDate;
      let planNombre = live.plan;
      for (const item of cart) {
        const sub = roundPrice(item.price * item.qty);
        if (item.category !== 'Servicio') {
          const ok = await registerProductSale(item.id, item.qty, selectedMember.name, paymentMethod);
          if (!ok) {
            showToast(`Sin stock: ${item.name}`);
            continue;
          }
          prod += sub;
          if (!esFiado) {
            await injectTransaction({
              date: dateStr, time: timeStr,
              description: `Producto: ${item.qty}x ${item.name}`,
              category: 'product', type: 'income', amount: sub,
              method: paymentMethod, client: selectedMember.name,
            });
          }
        } else {
          const plan = plans.find(p => p.id === item.id);
          mem += sub;
          planNombre = item.name;
          if (!esFiado) {
            await injectTransaction({
              date: dateStr, time: timeStr,
              description: `Mensualidad/rutina: ${item.name}`,
              category: catPlan(plan?.duration), type: 'income', amount: sub,
              method: paymentMethod, client: selectedMember.name,
            });
          }
          if (plan) {
            const days = diasPlan(plan.duration) * item.qty;
            const base = expiry || dateStr;
            const [y, mo, d] = base.split('-').map(Number);
            const from = new Date(y, mo - 1, d);
            if (from <= new Date()) from.setTime(Date.now());
            from.setDate(from.getDate() + days);
            expiry = from.toISOString().split('T')[0];
          }
        }
      }
      const patch: Partial<Member> = {};
      if (expiry && expiry !== live.expiryDate) {
        patch.status = 'active';
        patch.expiryDate = expiry;
        patch.plan = planNombre;
      }
      if (esFiado && (prod > 0 || mem > 0)) {
        Object.assign(patch, sumarCredito(live, { productos: prod, membresia: mem }));
      }
      if (Object.keys(patch).length) await updateMemberStatus(selectedMember.id, patch);
      
      // LOG & CLEANUP
      setLogs(prev => [{ 
        id: Date.now(), 
        name: selectedMember.name, 
        action: paymentMethod === 'Crédito' ? 'FIADO' : 'COBRO', 
        time: new Date().toLocaleTimeString().slice(0, 5), 
        method: paymentMethod, 
        color: paymentMethod === 'Crédito' ? 'var(--danger-red)' : 'var(--neon-green)' 
      }, ...prev]);
      
      setCart([]);
      setProductSearch('');
      if (!esFiado) {
        if (showProfile) setShowProfile(false);
        setSelectedMember(null);
      }
      
    } catch (error) {
      console.error("Error al procesar venta:", error);
      showToast("❌ Error al procesar el cobro. Intente de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCargarCuenta = async () => {
    if (!selectedMember || cart.length === 0 || isProcessing) return;
    const productos = cart.filter((i) => i.category !== 'Servicio');
    if (productos.length === 0) {
      showToast('Los planes se cobran, no se cargan a consumo del piso.');
      return;
    }
    setIsProcessing(true);
    try {
      for (const item of productos) {
        const ok = await registerProductSale(item.id, item.qty, selectedMember.name, 'Cuenta piso');
        if (!ok) {
          showToast(`Sin stock: ${item.name}`);
          continue;
        }
      }
      const live = members.find((m) => m.id === selectedMember.id) || selectedMember;
      await updateMemberStatus(selectedMember.id, {
        openTab: mergeTab(live.openTab, productos.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price }))),
      });
      setLogs((prev) => [{ id: Date.now(), name: selectedMember.name, action: 'CUENTA PISO', time: new Date().toLocaleTimeString().slice(0, 5), method: 'Recepción', color: '#C5D1CC' }, ...prev]);
      setCart([]);
      showToast('Cargado a la cuenta. Paga al salir. El socio lo ve en su app.');
    } catch (e) {
      showToast('No se pudo cargar la cuenta.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCobrarTab = async (member: Member) => {
    const total = tabTotal(member.openTab);
    if (total <= 0) return;
    setIsProcessing(true);
    try {
      await injectTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        description: `Cuenta piso: ${(member.openTab || []).map((l) => `${l.qty}x ${l.name}`).join(', ')}`,
        category: 'other',
        type: 'income',
        amount: total,
        method: paymentMethod === 'Crédito' ? 'Efectivo' : paymentMethod,
        client: member.name,
      });
      await updateMemberStatus(member.id, { openTab: [], pagoSolicitado: null });
      showToast(`Cobrado $${total.toLocaleString('es-CO')} de consumo`);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── COBRAR TODO O DEJAR EN CRÉDITO, Y DAR SALIDA ── */
  const handleCobrarTodoYSalida = async (modo: 'pago' | 'credito') => {
    if (!selectedMember || isProcessing) return;
    setIsProcessing(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString().slice(0, 5);
    const live = members.find((x) => x.id === selectedMember.id) || selectedMember;
    const esFiado = modo === 'credito';
    const method = esFiado ? 'Crédito' : (paymentMethod === 'Crédito' ? 'Efectivo' : paymentMethod);
    try {
      const tabItems = live.openTab || [];
      let prod = tabTotal(tabItems);
      let mem = 0;
      let expiry = live.expiryDate;
      let planNombre = live.plan;

      if (!esFiado && prod > 0) {
        await injectTransaction({
          date: dateStr, time: timeStr,
          description: `Productos piso: ${tabItems.map((l) => `${l.qty}×${l.name}`).join(', ')}`,
          category: 'product', type: 'income', amount: prod, method, client: selectedMember.name,
        });
      }
      for (const item of cart) {
        const sub = roundPrice(item.price * item.qty);
        if (item.category !== 'Servicio') {
          const ok = await registerProductSale(item.id, item.qty, selectedMember.name, method);
          if (!ok) { showToast(`Sin stock: ${item.name}`); continue; }
          prod += sub;
          if (!esFiado) {
            await injectTransaction({
              date: dateStr, time: timeStr,
              description: `Producto: ${item.qty}×${item.name}`,
              category: 'product', type: 'income', amount: sub, method, client: selectedMember.name,
            });
          }
        } else {
          const plan = plans.find((p) => p.id === item.id);
          mem += sub;
          planNombre = item.name;
          if (!esFiado) {
            await injectTransaction({
              date: dateStr, time: timeStr,
              description: `Mensualidad/rutina: ${item.name}`,
              category: catPlan(plan?.duration), type: 'income', amount: sub, method, client: selectedMember.name,
            });
          }
          if (plan) {
            const days = diasPlan(plan.duration) * item.qty;
            const base = expiry || dateStr;
            const [y, mo, d] = base.split('-').map(Number);
            const from = new Date(y, mo - 1, d);
            if (from <= new Date()) from.setTime(Date.now());
            from.setDate(from.getDate() + days);
            expiry = from.toISOString().split('T')[0];
          }
        }
      }
      const totalNuevo = roundPrice(prod + mem);
      if (totalNuevo <= 0 && !live.presence?.inGym) {
        showToast('No hay nada que cobrar.');
        return;
      }
      const patch: Partial<Member> = {
        presence: { inGym: false, enteredAt: live.presence?.enteredAt || Date.now(), method: live.presence?.method || 'manual' },
        openTab: [],
        pagoSolicitado: null,
      };
      if (expiry && expiry !== live.expiryDate) {
        patch.status = 'active';
        patch.expiryDate = expiry;
        patch.plan = planNombre;
      }
      if (esFiado && totalNuevo > 0) Object.assign(patch, sumarCredito(live, { productos: prod, membresia: mem }));
      await updateMemberStatus(selectedMember.id, patch);
      setLogs((prev) => [{
        id: Date.now(), name: selectedMember.name,
        action: esFiado ? `CRÉDITO $${totalNuevo.toLocaleString('es-CO')} + SALIDA` : `COBRO $${totalNuevo.toLocaleString('es-CO')} + SALIDA`,
        time: timeStr, method, color: esFiado ? 'var(--danger-red)' : 'var(--neon-green)',
      }, ...prev]);
      setCart([]); setShowProfile(false); setSelectedMember(null);
      showToast(esFiado
        ? `Quedó en crédito $${totalNuevo.toLocaleString('es-CO')}. Productos y mensualidad van aparte en su ficha.`
        : `Cobrado $${totalNuevo.toLocaleString('es-CO')} · Salida registrada`);
    } catch {
      showToast('Error al cerrar la cuenta.');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── ABONAR: primero productos, luego mensualidad. Entra a caja. ── */
  const handleAbonar = async () => {
    if (!selectedMember || isProcessing) return;
    const abono = parseFloat(abonoAmount.replace(/\./g, '').replace(',', '.'));
    if (!abono || abono <= 0) { showToast('Ingresa un monto válido'); return; }
    const live = members.find((m) => m.id === selectedMember.id) || selectedMember;
    const aplicado = aplicarAbono(live, abono);
    const pagado = aplicado.aProductos + aplicado.aMembresia;
    if (pagado <= 0) { showToast('Este socio no tiene crédito pendiente'); return; }
    setIsProcessing(true);
    const method = paymentMethod === 'Crédito' ? 'Efectivo' : paymentMethod;
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString().slice(0, 5);
    try {
      if (aplicado.aProductos > 0) {
        await injectTransaction({
          date: dateStr, time: timeStr,
          description: `Abono productos: ${selectedMember.name}`,
          category: 'product', type: 'income', amount: aplicado.aProductos, method, client: selectedMember.name,
        });
      }
      if (aplicado.aMembresia > 0) {
        await injectTransaction({
          date: dateStr, time: timeStr,
          description: `Abono mensualidad: ${selectedMember.name}`,
          category: 'membership', type: 'income', amount: aplicado.aMembresia, method, client: selectedMember.name,
        });
      }
      await updateMemberStatus(selectedMember.id, { debt: aplicado.debt, credito: aplicado.credito });
      setAbonoAmount('');
      const partes = [
        aplicado.aProductos > 0 ? `productos $${aplicado.aProductos.toLocaleString('es-CO')}` : '',
        aplicado.aMembresia > 0 ? `mensualidad $${aplicado.aMembresia.toLocaleString('es-CO')}` : '',
      ].filter(Boolean).join(' · ');
      showToast(`Abonó ${partes}. Resta $${aplicado.debt.toLocaleString('es-CO')}`);
    } catch {
      showToast('Error al registrar abono');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearDebt = async () => {
    if (selectedMember) {
      await clearMemberDebt(selectedMember.id);
      setAlertMember(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, padding: '10px' }}>
      <Empieza role="receptionist" />
      <AiAssist
        rol="recepción"
        texto="Busca al atleta en la lista. En su ficha, productos y mensualidad van separados. Si no tiene plata: Déjar en crédito. Si trae un abono, regístralo ahí: primero baja productos y después la mensualidad. Efectivo y Nequi entran a caja; el crédito no."
      />
      <div className="puerta-rapida">
        <div className="puerta-conteo">
          <strong>{enSala.length}</strong>
          <span>en sala ahora</span>
        </div>
        <div className="puerta-conteo">
          <strong>{entraronHoy}</strong>
          <span>entraron hoy</span>
        </div>
        <div className="puerta-conteo">
          <strong>{members.length}</strong>
          <span>socios en total</span>
        </div>
        <p>
          Misma puerta para gerencia y recepción. Escribe el número (001) o el nombre y toca Entrar.
          Cámara y QR siguen aparte. Día ${Number(plans.find((p) => p.id === 'dia')?.price || 0).toLocaleString('es-CO')} · mes básico ${Number(plans.find((p) => p.id === 'mes_basico')?.price || 0).toLocaleString('es-CO')}.
          Moratoria {diasMoratoria()} días después de vencer.
        </p>
      </div>
      <Link to="/avisos" style={{ fontSize: 13, color: 'var(--neon-green)', fontWeight: 700, marginTop: -12 }}>Lista de avisos WhatsApp (mora / por vencer) →</Link>

      {/* ── TOAST GLOBAL ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 99999, padding: '14px 24px', borderRadius: 20, background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(0,255,136,0.3)', color: '#fff', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
          {toast}
        </div>
      )}

      {/* ── ALERTA DE DEUDA (GLASS DESIGN) ── */}
      {alertMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,5,0.85)', backdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card premium-shadow" style={{ maxWidth: 450, width: '100%', border: `1px solid ${alertMember.debt > 0 ? 'rgba(255,61,87,0.3)' : 'rgba(255,214,0,0.3)'}`, borderRadius: 28, padding: 32, background: 'rgba(255,255,255,0.03)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                   <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,61,87,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--danger-red)', boxShadow: '0 0 20px rgba(255,61,87,0.2)' }}>
                      <AlertTriangle size={32} />
                   </div>
                   <div>
                      <h3 style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entrada denegada</h3>
                      <div style={{ fontSize: 24, fontWeight: 950, color: '#fff', marginTop: 4 }}>{alertMember.name}</div>
                   </div>
                </div>
                <button onClick={() => setAlertMember(null)} style={{ padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
             </div>

             <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                   <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>Deuda Pendiente:</span>
                   <span style={{ fontSize: 20, fontWeight: 950, color: 'var(--danger-red)' }}>${(alertMember.debt || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>Vencimiento:</span>
                   <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{alertMember.expiryDate}</span>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                 <button onClick={() => setAlertMember(null)} style={{ padding:'18px', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.02)', color:'var(--text-secondary)', fontWeight:950, fontSize:12, cursor:'pointer', transition: '0.3s' }}>CERRAR (NO ENTRA)</button>
                 <button onClick={() => handleClearDebt()} style={{ padding:'18px', borderRadius:16, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, fontSize:12, cursor:'pointer', boxShadow: '0 8px 20px rgba(0,255,136,0.3)' }}>PAGAR DEUDA</button>
             </div>
             <button onClick={() => { setShowProfile(true); setAlertMember(null); }} style={{ width:'100%', padding:'18px', borderRadius:16, background:'rgba(255,255,255,0.05)', color:'#fff', border:'1px solid rgba(255,255,255,0.1)', fontWeight:950, fontSize:12, cursor:'pointer' }}>VER EXPEDIENTE COMPLETO</button>
          </div>
        </div>
      )}

      {/* ── LAYOUT RESPONSIVO DINÁMICO (V5 PREMIUM) ── */}
      <div className="reception-grid-layout">

         
         {/* COL 1: OPERACIONES */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', paddingRight: 5 }}>
            <div style={{ display: 'flex', gap: 12 }}>
               {[{ id: 'manual', icon: <User size={22}/>, label: 'MANUAL' }, { id: 'qr', icon: <QrCode size={22}/>, label: 'QR SCAN' }].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{ flex: 1, padding: '18px 0', borderRadius: 20, background: activeTab === t.id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${activeTab === t.id ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.05)'}`, color: activeTab === t.id ? 'var(--neon-green)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', backdropFilter: 'blur(10px)' }}>
                    {t.icon} <span style={{ fontSize: 11, fontWeight: 950, letterSpacing: 1 }}>{t.label}</span>
                  </button>
                ))}
                <button 
                  onClick={() => setShowQuickRegister(true)}
                  style={{ 
                    flex: 0.8, padding: '18px 0', borderRadius: 20, background: 'rgba(0,255,136,0.2)', 
                    border: '1px solid rgba(0,255,136,0.5)', color: 'var(--neon-green)', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, 
                    cursor: 'pointer', transition: '0.3s', backdropFilter: 'blur(10px)' 
                  }}
                >
                  <UserPlus size={22}/> <span style={{ fontSize: 11, fontWeight: 950, letterSpacing: 1 }}>NUEVO</span>
                </button>
             </div>

            {!selectedMember ? (
               <div className="glass-card premium-shadow" style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 28, minHeight: 300, background: 'rgba(0,255,136,0.02)', backdropFilter: 'blur(15px)' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,255,136,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid rgba(0,255,136,0.1)' }}>
                    <Activity size={36} className="pulse-animation" style={{ color: 'var(--neon-green)' }} />
                  </div>
                  <div ref={searchContainerRef} style={{ position: 'relative', width: '100%' }}>
                    <Search size={20} style={{ position: 'absolute', left: 20, top: 18, color: 'rgba(0,255,136,0.5)', zIndex: 1 }} />
                    <input
                      placeholder={activeTab === 'qr' ? 'Código QR del socio (gff:…)' : 'Identificar atleta...'}
                      value={activeTab === 'qr' ? qrCode : search}
                      onChange={e => activeTab === 'qr' ? setQrCode(e.target.value) : setSearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key !== 'Enter') return;
                        if (activeTab === 'qr') {
                          const found = memberFromQr(qrCode, members);
                          if (found) handleSuccess(found, 'qr');
                          else setStatus('error');
                          return;
                        }
                        handleSuccess(search, 'manual');
                      }}
                      style={{ width: '100%', padding: '18px 20px 18px 55px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, color: '#fff', fontSize: 15, outline: 'none', transition: '0.3s' }}
                      className="search-input-premium"
                    />
                  </div>
                  {activeTab === 'manual' && (
                    <div style={{ width: '100%', marginTop: 16, maxHeight: 340, overflowY: 'auto' }} className="custom-scrollbar">
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>
                        {suggestions.length} ATLETAS · toca el nombre para abrir la ficha
                      </div>
                      {suggestions.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => { setSelectedMember(m); setShowProfile(true); setCart([]); }}
                          style={{ width: '100%', textAlign: 'left', marginBottom: 8, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
                        >
                          <span>
                            <span style={{ fontWeight: 800 }}>#{numeros[m.id] || '—'} {m.name}</span>
                            <span style={{ display: 'block', fontSize: 11, color: m.presence?.inGym ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                              {m.presence?.inGym ? 'En sala' : 'Afuera'} · {m.plan || 'Sin plan'}
                            </span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {(m.debt || 0) > 0 && <span style={{ fontSize: 11, color: 'var(--danger-red)', fontWeight: 800 }}>Debe ${(m.debt || 0).toLocaleString('es-CO')}</span>}
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); handleSuccess(m, 'manual'); }}
                              style={{ background: m.presence?.inGym ? 'rgba(255,61,87,0.15)' : 'var(--neon-green)', color: m.presence?.inGym ? '#C5D1CC' : '#04140c', fontWeight: 900, fontSize: 12, padding: '10px 14px', borderRadius: 12 }}
                            >{m.presence?.inGym ? 'Salir' : 'Entrar'}</span>
                          </span>
                        </button>
                      ))}
                      {suggestions.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay atletas con ese nombre.</div>}
                    </div>
                  )}
               </div>
            ) : (
               <div className="glass-card premium-shadow" style={{ flex: 1, padding: 24, border: `1px solid ${selectedMember.debt > 0 ? 'rgba(255,61,87,0.3)' : 'rgba(0,255,136,0.2)'}`, borderRadius: 28, display:'flex', flexDirection:'column', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                     <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)' }}>{initials(selectedMember.name, 1)}</div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 950, color: '#fff', margin:0 }}>{selectedMember.name}</h3>
                          <div style={{ fontSize: 10, color: 'var(--neon-green)', fontWeight: 800, marginTop: 2 }}>{selectedMember.plan}</div>
                        </div>
                     </div>
                     <button onClick={() => setSelectedMember(null)} style={{ background: 'rgba(255,61,87,0.1)', border: 'none', color: 'var(--danger-red)', padding: '8px 16px', borderRadius: 12, fontSize: 10, fontWeight: 950, cursor: 'pointer' }}>CANCELAR</button>
                  </div>
                  <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img
                      alt="QR socio"
                      width={96}
                      height={96}
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(memberQrPayload(String(selectedMember.id)))}`}
                      style={{ borderRadius: 8, background: '#fff' }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Código de entrada: {memberQrPayload(String(selectedMember.id))}
                    </div>
                  </div>
                  
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                     <div style={{ background:'rgba(255,255,255,0.03)', padding:16, borderRadius:16, border: '1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
                        <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing: 1, fontWeight: 800 }}>ESTADO DE CUENTA</div>
                        <div style={{ fontSize:16, fontWeight: 950, color: selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)', marginTop: 4 }}>${(selectedMember.debt || 0).toLocaleString()}</div>
                     </div>
                     <button onClick={() => setShowProfile(true)} style={{ background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', color:'var(--neon-green)', borderRadius:16, fontSize:11, fontWeight:950, cursor:'pointer', transition: '0.3s' }}>VER PERFIL</button>
                  </div>
                  
                  {/* ── ACCESOS RÁPIDOS DE MEMBRESÍA ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 10, marginBottom: 14 }}>
                    {plans.map(srv => (
                      <button key={srv.id} onClick={() => addToCart({ id: srv.id, name: srv.label, sellPrice: srv.price, category: 'Servicio' })} style={{ padding: '12px 6px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${srv.color}30`, color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: '0.25s' }} className="srv-btn-premium">
                        <div style={{ color: srv.color }}>{srv.duration === 'dia' ? <Zap size={14}/> : srv.duration === 'semana' ? <Calendar size={14}/> : <TrendingUp size={14}/>}</div>
                        <div style={{ fontSize: 9, fontWeight: 950, letterSpacing: 1 }}>{srv.label.toUpperCase()}</div>
                        <div style={{ fontSize: 13, fontWeight: 950, color: srv.color }}>${(srv.price/1000).toFixed(0)}K</div>
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative', marginBottom: 12 }}>
                     <input
                       placeholder="Vender producto o bebida..."
                       value={productSearch}
                       onChange={e => setProductSearch(e.target.value)}
                       style={{ width:'100%', padding:'16px', background:'rgba(255,255,255,0.04)', borderRadius:16, color:'#fff', border: '1px solid rgba(255,255,255,0.08)', fontSize: 14 }} 
                     />
                     {productSearch && (
                        <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: 'rgba(10,10,15,0.98)', borderRadius: 20, border: '1px solid rgba(0,255,136,0.4)', maxHeight: 300, overflowY: 'auto', zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}>
                           {products
                             .filter(p => (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes((productSearch || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
                             .map(p => (
                              <div key={p.id} onClick={() => { addToCart(p); setProductSearch(''); }} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="product-item">
                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.name}</span>
                                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800 }}>{p.category}</span>
                                 </div>
                                 <span style={{ fontSize: 14, fontWeight: 950, color: 'var(--neon-green)' }}>${p.sellPrice.toLocaleString()}</span>
                              </div>
                           ))}
                        </div>
                    )}
                  </div>

                  {!productSearch && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20, maxHeight: 200, overflowY: 'auto', padding: '5px' }} className="custom-scrollbar">
                      {products.slice(0, 12).map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} className="quick-product-card-premium" style={{ position: 'relative', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px 8px', textAlign: 'center', cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                          <div style={{ fontSize: 18, marginBottom: 6 }}>{p.category === 'supplements' ? '💊' : p.category === 'drinks' ? '🥤' : '📦'}</div>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--neon-green)', marginTop: 4 }}>${(p.sellPrice/1000).toFixed(0)}K</div>
                          {p.stock <= p.minStock && (
                            <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: 'var(--danger-red)', border: '2px solid #000', boxShadow: '0 0 10px rgba(255,61,87,0.5)' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ flex:1, overflowY:'auto', background:'rgba(0,0,0,0.25)', borderRadius:20, padding:16, marginBottom:20, minHeight: 100, border: '1px solid rgba(255,255,255,0.03)' }}>
                     {cart.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                           <ShoppingBag size={24} />
                           <div style={{ fontSize: 10, fontWeight: 950, marginTop: 10, letterSpacing: 1 }}>LISTA VACÍA</div>
                        </div>
                     ) : cart.map(item => (
                        <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', fontSize:12, marginBottom:10, background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 12 }}>
                           <span style={{ fontWeight: 700 }}>{item.qty}x {item.name}</span>
                           <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                             <span style={{ fontWeight: 950, color: 'var(--neon-green)' }}>${(item.price * item.qty).toLocaleString()}</span>
                             <button onClick={() => removeFromCart(item.id)} style={{ color:'var(--danger-red)', background:'rgba(255,61,87,0.05)', border:'none', padding: 6, borderRadius: 8, cursor:'pointer' }}><X size={14}/></button>
                           </div>
                        </div>
                     ))}
                  </div>
                  <button onClick={handleFinalizeSale} disabled={cart.length === 0 || isProcessing} style={{ width:'100%', padding:20, borderRadius:20, background: cart.length > 0 && !isProcessing ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color:'#000', fontWeight:950, cursor: isProcessing ? 'wait' : 'pointer', transition: '0.4s', boxShadow: cart.length > 0 ? '0 10px 30px rgba(0,255,136,0.3)' : 'none', letterSpacing: 1 }}>{isProcessing ? 'PROCESANDO...' : 'CONFIRMAR Y COBRAR'}</button>
                  <button type="button" onClick={handleCargarCuenta} disabled={cart.length === 0 || isProcessing} style={{ width:'100%', marginTop: 8, padding:14, borderRadius:16, background: 'transparent', color:'#C5D1CC', border: '1px solid rgba(255,215,0,0.4)', fontWeight:800, cursor: 'pointer', fontSize: 12 }}>CARGAR A CUENTA (paga al salir)</button>
               </div>
            )}
         </div>

         {/* COL 2: MONITOR DE SALA */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '20px 32px', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
               <div>
                 <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 4 }}>PRESENCIA REAL</div>
                 <div style={{ fontSize: 18, fontWeight: 950, color: '#fff' }}>QUIÉN ESTÁ ADENTRO</div>
               </div>
               <div style={{ background: 'rgba(0,255,136,0.1)', padding: '12px 24px', borderRadius: 20, fontSize: 28, fontWeight: 950, color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)', boxShadow: 'inset 0 0 15px rgba(0,255,136,0.1)' }}>{enSala.length}</div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, overflowY: 'auto', paddingRight: 10, alignContent: 'start' }} className="custom-scrollbar">
               {enSala.length === 0 && (
                 <p style={{ color: 'var(--text-muted)', fontSize: 13, gridColumn: '1 / -1' }}>Nadie marcado adentro. Entrada: QR o nombre aquí, o GPS del socio en Acceso Gym.</p>
               )}
               {enSala.map((m) => {
                 const f = fichaCuenta(m);
                 return (
                 <div key={m.id} onClick={() => { setSelectedMember(m); setShowProfile(true); setCart([]); }} className="glass-card athlete-card-premium" style={{ padding: 24, border: f.consumo > 0 ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(255,255,255,0.01))', borderRadius: 24, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                       <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-green)', fontWeight: 950, fontSize: 18 }}>{initials(m.name)}</div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 950, color: '#fff' }}>#{numeros[m.id] || '—'} {m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>{m.plan || 'Sin plan'} · {f.plan}</div>
                       </div>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 12, color: '#ccc' }}>
                      Entró {m.presence?.method === 'geo' ? 'por GPS' : (m.presence?.method || 'recepción')} · {f.haciendo || 'En sala'}{f.trainer ? ` · ${f.trainer}` : ''}
                    </div>
                    {(m.openTab || []).length > 0 && (
                      <div style={{ marginTop: 10, fontSize: 12, color: '#C5D1CC' }}>
                        Consumo: {(m.openTab || []).map((l) => `${l.qty}× ${l.name}`).join(', ')} = ${f.consumo.toLocaleString('es-CO')}
                      </div>
                    )}
                    {f.mora > 0 && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger-red)' }}>Mora membresía ${f.mora.toLocaleString('es-CO')}</div>}
                    {m.pagoSolicitado && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--neon-green)' }}>Pide pagar en caja: ${m.pagoSolicitado.amount.toLocaleString('es-CO')}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, background: 'rgba(0,0,0,0.15)', padding: '10px 16px', borderRadius: 16, gap: 8 }}>
                       <div style={{ fontSize: 12, color: 'var(--neon-green)', fontWeight: 950, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14}/> {fmtTime(Math.floor((Date.now() - (m.presence?.enteredAt || Date.now())) / 1000))}</div>
                       <div style={{ display: 'flex', gap: 6 }}>
                         {f.consumo > 0 && (
                           <button type="button" onClick={(e) => { e.stopPropagation(); handleCobrarTab(m); }} style={{ background: 'rgba(255,215,0,0.15)', border: 'none', color: '#C5D1CC', padding: '6px 10px', borderRadius: 10, fontSize: 10, fontWeight: 950, cursor: 'pointer' }}>COBRAR CONSUMO</button>
                         )}
                         <button type="button" onClick={(e) => { e.stopPropagation(); updateMemberStatus(m.id, { presence: { inGym: false, enteredAt: m.presence?.enteredAt || Date.now(), method: m.presence?.method || 'manual' } }); }} style={{ background: 'rgba(255,61,87,0.1)', border: 'none', color: 'var(--danger-red)', padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 950, cursor: 'pointer' }}>SALIDA</button>
                       </div>
                    </div>
                 </div>
                 );
               })}
            </div>
         </div>

         {/* COL 3: AUDITORÍA */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'hidden' }}>
            <div className="glass-card premium-shadow" style={{ padding: 24, borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
               <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }}>Caja y Tráfico</div>
               <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div style={{ background:'rgba(0,255,136,0.08)', padding:16, borderRadius:20, border: '1px solid rgba(0,255,136,0.15)', textAlign:'center' }}>
                     <div style={{ fontSize:9, color:'var(--text-muted)', fontWeight: 800 }}>RECAUDO</div>
                     <div style={{ fontSize:18, fontWeight:950, color:'var(--neon-green)', marginTop: 4 }}>${todayKpis.total.toLocaleString()}</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.03)', padding:16, borderRadius:20, border: '1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
                     <div style={{ fontSize:9, color:'var(--text-muted)', fontWeight: 800 }}>VISITAS</div>
                     <div style={{ fontSize:18, fontWeight:950, color:'#fff', marginTop: 4 }}>{todayKpis.count}</div>
                  </div>
               </div>
            </div>
            <div className="glass-card premium-shadow" style={{ flex: 1, padding: 24, borderRadius: 28, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
               <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Auditoría en Tiempo Real</div>
               <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="custom-scrollbar">
                  {logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, opacity: 0.2 }}>
                      <Database size={30} style={{ marginBottom: 10 }} />
                      <div style={{ fontSize: 11, fontWeight: 800 }}>SIN ACTIVIDAD</div>
                    </div>
                  ) : logs.map(log => (
                    <div key={log.id} style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 16, borderLeft: `4px solid ${log.color}`, fontSize: 11, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                       <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 950, color: '#fff' }}>{log.name}</span>
                          <span style={{ opacity: 0.4, fontSize: 9 }}>{log.time}</span>
                       </div>
                       <div style={{ color: log.color, fontWeight: 900, fontSize: 10, letterSpacing: 1 }}>{log.action} — {log.method || 'SISTEMA'}</div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* 🛡️ EXPEDIENTE 360° — OMNI_FOCUS_V5 ── */}
      {showProfile && selectedMember && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.96)', backdropFilter: 'blur(30px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="glass-card premium-shadow" style={{ maxWidth: 900, width: '100%', border: `2px solid ${selectedMember.debt > 0 ? 'rgba(255,61,87,0.4)' : 'rgba(0,255,136,0.3)'}`, maxHeight: '95vh', overflowY: 'auto', borderRadius: 40, position: 'relative', background: 'rgba(15,15,20,0.7)', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
               
               {/* 1. BANNERS DE ESTADO */}
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {selectedMember.debt > 0 && (
                     <div style={{ background: 'var(--danger-red)', color: '#000', padding: '10px', textAlign: 'center', fontSize: 11, fontWeight: 950, letterSpacing: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <AlertTriangle size={16} /> BLOQUEO POR DEUDA: ${selectedMember.debt.toLocaleString()} PENDIENTE
                     </div>
                  )}
                  {(!selectedMember.injuries || selectedMember.injuries === 'Ninguna') ? (
                     <div style={{ background: 'rgba(0,255,136,0.15)', color: 'var(--neon-green)', padding: '8px', textAlign: 'center', fontSize: 10, fontWeight: 950, letterSpacing: 1.5 }}>
                        ESTADO FÍSICO ÓPTIMO — AUTORIZADO PARA ALTA INTENSIDAD
                     </div>
                  ) : (
                     <div style={{ background: 'rgba(255,61,87,0.15)', color: 'var(--danger-red)', padding: '8px', textAlign: 'center', fontSize: 10, fontWeight: 950, letterSpacing: 1.5 }}>
                        ALERTA MÉDICA: {String(selectedMember.injuries).toUpperCase()}
                     </div>
                  )}
               </div>

               <div style={{ padding: '40px 50px' }}>
                  {/* 2. HEADER ELITE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 40 }}>
                     <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                        <div style={{ width: 130, height: 130, borderRadius: 36, background: 'rgba(0,255,136,0.1)', border: `3px solid ${selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 56, fontWeight:950, color: selectedMember.debt > 0 ? 'var(--danger-red)' : 'var(--neon-green)', boxShadow: `0 0 40px ${selectedMember.debt > 0 ? 'rgba(255,61,87,0.25)' : 'rgba(0,255,136,0.25)'}` }}>
                           {initials(selectedMember.name, 1)}
                        </div>
                        <div>
                           <div style={{ fontSize: 13, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>Atleta Profesional Elite</div>
                           <h2 style={{ fontSize: 44, fontWeight:950, color:'#fff', margin: 0, lineHeight: 1 }}>{selectedMember.name}</h2>
                           <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 14 }}>
                              <span style={{ background: 'rgba(0,255,136,0.15)', color: 'var(--neon-green)', padding: '6px 16px', borderRadius: 10, fontSize: 12, fontWeight: 950, border: '1px solid rgba(0,255,136,0.2)' }}>{selectedMember.plan}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800 }}>Vence: {selectedMember.expiryDate}</span>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => setShowProfile(false)} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'#fff', cursor:'pointer', padding: 20, borderRadius: 24, transition: '0.3s' }} className="close-btn-premium"><X size={28}/></button>
                  </div>

                  {/* ══ FICHA EN VIVO — solo cuando el socio está adentro ══ */}
                  {selectedMember.presence?.inGym && (() => {
                    const live = members.find((x) => x.id === selectedMember.id) || selectedMember;
                    const f = fichaCuenta(live);
                    const tiempoSeg = Math.floor((Date.now() - (live.presence?.enteredAt || Date.now())) / 1000);
                    const tabItems = live.openTab || [];
                    const cartAmt = roundPrice(cart.reduce((a, c) => a + c.price * c.qty, 0));
                    return (
                      <div style={{ marginBottom: 36, background: 'rgba(0,255,136,0.04)', border: '2px solid rgba(0,255,136,0.35)', borderRadius: 32, padding: 32 }}>
                        {/* ── Cabecera en vivo ── */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 2.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-green)', animation: 'pulse 2s ease-in-out infinite' }} />
                              EN SALA AHORA
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 950, color: '#fff', marginTop: 6 }}>
                              <Clock size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--neon-green)' }} />
                              {fmtTime(tiempoSeg)} · {live.presence?.method === 'geo' ? 'GPS' : live.presence?.method || 'recepción'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 240 }}>
                            <button
                              type="button"
                              onClick={() => handleCobrarTodoYSalida('pago')}
                              disabled={isProcessing || (f.consumo + cartAmt) <= 0}
                              style={{ padding: '14px 18px', borderRadius: 16, background: (f.consumo + cartAmt) > 0 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color: '#000', border: 'none', fontWeight: 950, fontSize: 13, cursor: 'pointer' }}
                            >
                              {isProcessing ? 'PROCESANDO...' : `COBRAR AHORA $${(f.consumo + cartAmt).toLocaleString('es-CO')} Y SALIR`}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCobrarTodoYSalida('credito')}
                              disabled={isProcessing || (f.consumo + cartAmt) <= 0}
                              style={{ padding: '14px 18px', borderRadius: 16, background: 'transparent', color: 'var(--danger-red)', border: '1px solid rgba(255,61,87,0.45)', fontWeight: 950, fontSize: 13, cursor: 'pointer' }}
                            >
                              DEJAR EN CRÉDITO Y SALIR
                            </button>
                          </div>
                        </div>

                        {/* ── Consumo del piso (tab abierto) ── */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 10, fontWeight: 950, color: '#C5D1CC', letterSpacing: 2, marginBottom: 12 }}>
                            🛒 CONSUMO DEL PISO {tabItems.length === 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>— Aún no ha pedido nada</span>}
                          </div>
                          {tabItems.length > 0 && (
                            <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 20, overflow: 'hidden' }}>
                              {tabItems.map((l) => (
                                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span style={{ background: 'rgba(255,215,0,0.15)', color: '#C5D1CC', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 950 }}>{l.qty}×</span>
                                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{l.name}</span>
                                  </div>
                                  <span style={{ color: '#C5D1CC', fontWeight: 950, fontSize: 15 }}>${(l.qty * l.price).toLocaleString('es-CO')}</span>
                                </div>
                              ))}
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,215,0,0.06)', borderTop: '1px solid rgba(255,215,0,0.2)' }}>
                                <span style={{ color: '#C5D1CC', fontWeight: 950, fontSize: 12, letterSpacing: 1 }}>SUBTOTAL CONSUMO</span>
                                <span style={{ color: '#C5D1CC', fontWeight: 950, fontSize: 20 }}>${f.consumo.toLocaleString('es-CO')}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ── Agregar más items rápido ── */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 10 }}>➕ AGREGAR A LA CUENTA</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {products.filter(p => p.stock > 0).slice(0, 8).map((p) => (
                              <button
                                key={p.id}
                                onClick={() => addToCart(p)}
                                style={{ padding: '10px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: '0.2s', display: 'flex', gap: 6, alignItems: 'center' }}
                              >
                                <span style={{ fontSize: 14 }}>{p.category === 'drinks' ? '🥤' : '📦'}</span>
                                <span>{p.name}</span>
                                <span style={{ color: 'var(--neon-green)', fontWeight: 950, fontSize: 11 }}>${(p.sellPrice / 1000).toFixed(0)}K</span>
                              </button>
                            ))}
                          </div>
                          {cart.length > 0 && (
                            <div style={{ marginTop: 12, background: 'rgba(0,255,136,0.04)', borderRadius: 16, padding: '12px 16px', border: '1px solid rgba(0,255,136,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>En carrito actual: {cart.map(c => `${c.qty}×${c.name}`).join(', ')}</span>
                              <span style={{ color: 'var(--neon-green)', fontWeight: 950, fontSize: 14 }}>${cartAmt.toLocaleString('es-CO')}</span>
                            </div>
                          )}
                        </div>

                        {/* ── Recibo separado por categorías ── */}
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 14 }}>📋 RECIBO AL SALIR — DESGLOSADO</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Membresías (planes) */}
                            {cart.filter(c => c.category === 'Servicio').length > 0 && (
                              <div style={{ background: 'rgba(0,255,136,0.04)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(0,255,136,0.1)' }}>
                                <div style={{ fontSize: 9, color: 'var(--neon-green)', fontWeight: 950, letterSpacing: 1.5, marginBottom: 6 }}>🏋️ MEMBRESÍA / RUTINA</div>
                                {cart.filter(c => c.category === 'Servicio').map(c => (
                                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#ccc' }}>{c.qty}× {c.name}</span>
                                    <span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>${(c.price * c.qty).toLocaleString('es-CO')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Productos comprados ahora */}
                            {cart.filter(c => c.category !== 'Servicio').length > 0 && (
                              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 9, color: '#C5D1CC', fontWeight: 950, letterSpacing: 1.5, marginBottom: 6 }}>📦 PRODUCTOS (cobro directo)</div>
                                {cart.filter(c => c.category !== 'Servicio').map(c => (
                                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#ccc' }}>{c.qty}× {c.name}</span>
                                    <span style={{ color: '#C5D1CC', fontWeight: 800 }}>${(c.price * c.qty).toLocaleString('es-CO')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Consumo piso (tab) */}
                            {f.consumo > 0 && (
                              <div style={{ background: 'rgba(255,215,0,0.04)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,215,0,0.12)' }}>
                                <div style={{ fontSize: 9, color: '#C5D1CC', fontWeight: 950, letterSpacing: 1.5, marginBottom: 6 }}>🥤 CONSUMO DEL PISO (tab)</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                  <span style={{ color: '#ccc' }}>{tabItems.map(l => `${l.qty}×${l.name}`).join(', ')}</span>
                                  <span style={{ color: '#C5D1CC', fontWeight: 800 }}>${f.consumo.toLocaleString('es-CO')}</span>
                                </div>
                              </div>
                            )}
                            {f.mora > 0 && (
                              <div style={{ background: 'rgba(255,61,87,0.06)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,61,87,0.15)' }}>
                                <div style={{ fontSize: 9, color: 'var(--danger-red)', fontWeight: 950, letterSpacing: 1.5, marginBottom: 6 }}>CRÉDITO QUE YA TENÍA (no entra en este cobro)</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                  <span style={{ color: '#ccc' }}>Productos fiados</span>
                                  <span style={{ color: '#C5D1CC', fontWeight: 800 }}>${f.creditoProductos.toLocaleString('es-CO')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                                  <span style={{ color: '#ccc' }}>Mensualidad / rutina</span>
                                  <span style={{ color: 'var(--danger-red)', fontWeight: 800 }}>${f.creditoMembresia.toLocaleString('es-CO')}</span>
                                </div>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 4 }}>
                              <span style={{ color: '#fff', fontWeight: 950, fontSize: 15 }}>A COBRAR AHORA</span>
                              <span style={{ color: 'var(--neon-green)', fontWeight: 950, fontSize: 22 }}>${(f.consumo + cartAmt).toLocaleString('es-CO')}</span>
                            </div>
                          </div>
                          <div style={{ marginTop: 14 }}>
                            <select value={paymentMethod === 'Crédito' ? 'Efectivo' : paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'Efectivo' | 'Nequi')} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 800 }}>
                              <option value="Efectivo">Efectivo</option>
                              <option value="Nequi">Nequi</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ marginTop: 16, background: 'rgba(255,61,87,0.06)', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(255,61,87,0.2)' }}>
                          <div style={{ fontSize: 10, fontWeight: 950, color: 'var(--danger-red)', letterSpacing: 2, marginBottom: 8 }}>
                            CRÉDITO DEL SOCIO · ${(f.mora || 0).toLocaleString('es-CO')}
                          </div>
                          <div style={{ fontSize: 13, color: '#ccc', marginBottom: 8 }}>
                            Productos ${f.creditoProductos.toLocaleString('es-CO')} · Mensualidad ${f.creditoMembresia.toLocaleString('es-CO')}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10, color: transactions.some((t) => t.date === todayStr && (t.description || '').startsWith('Abono') && (t.client || '') === live.name) ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                            {transactions.some((t) => t.date === todayStr && (t.description || '').startsWith('Abono') && (t.client || '') === live.name) ? 'Hoy sí abonó' : 'Hoy no ha abonado'}
                          </div>
                          {f.mora > 0 && (
                            <div style={{ display: 'flex', gap: 10 }}>
                              <input type="number" placeholder="Monto del abono" value={abonoAmount} onChange={e => setAbonoAmount(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14 }} />
                              <button type="button" onClick={handleAbonar} disabled={isProcessing || !abonoAmount} style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(255,61,87,0.2)', border: '1px solid rgba(255,61,87,0.4)', color: '#fff', fontWeight: 950, fontSize: 12, cursor: 'pointer' }}>ABONAR</button>
                              <button type="button" onClick={() => setAbonoAmount(String(f.mora || 0))} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>TODO</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {selectedMember && !selectedMember.presence?.inGym && (() => {
                    const live = members.find((x) => x.id === selectedMember.id) || selectedMember;
                    const f = fichaCuenta(live);
                    const abonoHoy = transactions.some((t) => t.date === todayStr && (t.description || '').startsWith('Abono') && (t.client || '') === live.name);
                    return (
                      <div style={{ marginBottom: 28, background: 'rgba(255,61,87,0.05)', border: '1px solid rgba(255,61,87,0.25)', borderRadius: 24, padding: 22 }}>
                        <div style={{ fontSize: 12, fontWeight: 950, color: '#fff', marginBottom: 8 }}>Crédito de {live.name}</div>
                        <div style={{ fontSize: 13, color: '#ccc', marginBottom: 6 }}>Productos ${f.creditoProductos.toLocaleString('es-CO')} · Mensualidad ${f.creditoMembresia.toLocaleString('es-CO')}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 12, color: abonoHoy ? 'var(--neon-green)' : 'var(--text-muted)' }}>{abonoHoy ? 'Hoy sí abonó' : 'Hoy no ha abonado'}</div>
                        {f.mora > 0 && (
                          <div style={{ display: 'flex', gap: 10 }}>
                            <input type="number" placeholder="Monto del abono" value={abonoAmount} onChange={e => setAbonoAmount(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14 }} />
                            <button type="button" onClick={handleAbonar} disabled={isProcessing || !abonoAmount} style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(255,61,87,0.2)', border: '1px solid rgba(255,61,87,0.4)', color: '#fff', fontWeight: 950, cursor: 'pointer' }}>ABONAR</button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 3. TABS DEL EXPEDIENTE */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                     
                     {/* COL IZQ: FICHA TÉCNICA & INFO */}
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="glass-card" style={{ padding: 32, borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
                           <h4 style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 3, marginBottom: 24 }}>BIOMETRÍA Y RENDIMIENTO</h4>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 20, border: '1px solid rgba(255,255,255,0.03)' }}>
                                 <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>OBJETIVO ACTUAL</div>
                                 <div style={{ fontSize: 15, fontWeight: 950, color: '#fff' }}>{selectedMember.objective || 'Musculación'}</div>
                              </div>
                              <div style={{ background: 'rgba(0,255,136,0.03)', padding: 20, borderRadius: 20, border: '1px solid rgba(0,255,136,0.1)' }}>
                                 <div style={{ fontSize: 9, color: 'var(--neon-green)', fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>RACHA DE ASISTENCIA</div>
                                 <div style={{ fontSize: 15, fontWeight: 950, color: 'var(--neon-green)' }}>{selectedMember.streak || 12} DÍAS 🔥</div>
                              </div>
                           </div>
                           <div style={{ marginTop: 20, background: 'rgba(255,61,87,0.05)', padding: 20, borderRadius: 20, border: '1px solid rgba(255,61,87,0.15)' }}>
                              <div style={{ fontSize: 10, color: 'var(--danger-red)', fontWeight: 950, letterSpacing: 1, marginBottom: 8 }}>OBSERVACIONES MÉDICAS</div>
                              <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.6, fontWeight: 600 }}>{selectedMember.injuries || 'Ninguna contraindicación reportada'}</div>
                           </div>
                        </div>

                        <div className="glass-card" style={{ padding: 32, borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
                           <h4 style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 3, marginBottom: 24 }}>SOPORTE Y EMERGENCIA</h4>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '20px 25px', borderRadius: 24 }}>
                              <div>
                                 <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{selectedMember.emergencyContact || 'Contacto Directo'}</div>
                                 <div style={{ fontSize: 14, color: 'var(--neon-green)', fontWeight: 950, marginTop: 6 }}>{selectedMember.emergencyPhone || selectedMember.phone || 'Pendiente'}</div>
                              </div>
                              <button onClick={() => selectedMember.phone && window.open(`https://wa.me/${selectedMember.phone}`, '_blank')} disabled={!selectedMember.phone} style={{ background: '#25D366', border: 'none', color: '#fff', padding: '16px', borderRadius: 18, cursor: selectedMember.phone ? 'pointer' : 'not-allowed', opacity: selectedMember.phone ? 1 : 0.5, boxShadow: '0 10px 20px rgba(37,211,102,0.3)' }}><Phone size={22}/></button>
                           </div>
                        </div>
                     </div>

                     {/* COL DER: POS INTEGRADO & SERVICIOS */}
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="glass-card" style={{ padding: 32, borderRadius: 32, border: '1px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.04)', backdropFilter: 'blur(10px)' }}>
                           <h4 style={{ fontSize: 11, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 3, marginBottom: 24 }}>SERVICIOS RÁPIDOS</h4>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 14, marginBottom: 32 }}>
                              {plans.map(srv => (
                                 <button key={srv.id} onClick={() => addToCart({ ...srv, name: srv.label, sellPrice: srv.price, category: 'Servicio' })} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${srv.color}30`, borderRadius: 20, padding: '22px 10px', color: '#fff', cursor: 'pointer', transition: '0.3s', display:'flex', flexDirection:'column', alignItems:'center', gap: 10 }} className="srv-btn-premium">
                                    <div style={{ color: srv.color }}>{srv.duration === 'dia' ? <Zap size={16}/> : srv.duration === 'semana' ? <Calendar size={16}/> : <TrendingUp size={16}/>}</div>
                                    <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 1.5 }}>{srv.label.toUpperCase()}</div>
                                    <div style={{ fontSize: 16, fontWeight: 950 }}>${(srv.price/1000).toFixed(0)}K</div>
                                 </button>
                              ))}
                           </div>


                           <h4 style={{ fontSize: 11, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 3, marginBottom: 18 }}>COBROS Y PRODUCTOS</h4>
                           <div style={{ position: 'relative', marginBottom: 24 }}>
                              <Search size={18} style={{ position: 'absolute', left: 20, top: 18, color: 'rgba(255,255,255,0.3)' }} />
                              <input 
                                 placeholder="Suplementos o bebidas..." 
                                 value={productSearch} 
                                 onChange={e => setProductSearch(e.target.value)} 
                                 style={{ width:'100%', padding:'18px 18px 18px 55px', background:'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius:20, color:'#fff', fontSize: 14 }} 
                               />
                               
                               {productSearch && (
                                  <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(10,10,15,0.98)', border: '1px solid rgba(0,255,136,0.5)', borderRadius: 24, marginTop: 10, maxHeight: 300, overflowY: 'auto', zIndex: 100, boxShadow: '0 20px 80px rgba(0,0,0,0.9)', backdropFilter: 'blur(30px)' }}>
                                     {products
                                       .filter(p => (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes((productSearch || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
                                       .map(p => (
                                        <div key={p.id} onClick={() => { addToCart(p); setProductSearch(''); }} style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="product-item">
                                           <div style={{ display: 'flex', flexDirection: 'column' }}>
                                              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.name}</span>
                                              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 900 }}>{p.category}</span>
                                           </div>
                                           <span style={{ fontSize: 15, color: 'var(--neon-green)', fontWeight: 950 }}>${p.sellPrice.toLocaleString()}</span>
                                        </div>
                                     ))}
                                  </div>
                               )}
                           </div>

                           {/* Carrito Integrado */}
                           <div style={{ minHeight: 140, background: 'rgba(0,0,0,0.25)', borderRadius: 24, padding: 24, marginBottom: 24, border: '1px solid rgba(255,255,255,0.03)' }}>
                              {cart.length === 0 ? (
                                 <div style={{ height: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.15 }}>
                                    <ShoppingBag size={32} />
                                    <div style={{ fontSize: 11, fontWeight: 950, marginTop: 12, letterSpacing: 2 }}>CARRITO VACÍO</div>
                                 </div>
                              ) : (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {cart.map(item => (
                                       <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: 16 }}>
                                          <div style={{ fontSize: 13, fontWeight: 800 }}>{item.qty}x {item.name}</div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                                             <div style={{ fontSize: 14, fontWeight: 950, color: 'var(--neon-green)' }}>${(item.price * item.qty).toLocaleString()}</div>
                                             <button onClick={() => removeFromCart(item.id)} style={{ background: 'rgba(255,61,87,0.1)', border: 'none', color: 'var(--danger-red)', padding: 6, borderRadius: 10, cursor: 'pointer' }}><MinusCircle size={18}/></button>
                                          </div>
                                       </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                       <span style={{ fontSize: 12, fontWeight: 950, color: 'var(--text-muted)', letterSpacing: 1 }}>TOTAL TRANSACCIÓN</span>
                                       <span style={{ fontSize: 24, fontWeight: 950, color: 'var(--neon-green)', textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>${roundPrice(cart.reduce((a,c) => a + (c.price*c.qty), 0)).toLocaleString()}</span>
                                    </div>
                                 </div>
                              )}
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 15 }}>
                              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} style={{ padding: 18, borderRadius: 18, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 900 }}>
                                 <option value="Efectivo">💵 Efectivo</option>
                                 <option value="Nequi">📱 Nequi</option>
                                 <option value="Crédito">💳 Deuda (Fiado)</option>
                              </select>
                              <button onClick={handleFinalizeSale} disabled={cart.length === 0 || isProcessing} style={{ padding: 18, borderRadius: 18, background: cart.length > 0 && !isProcessing ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color: '#000', border: 'none', fontWeight: 950, cursor: isProcessing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: cart.length > 0 ? '0 10px 30px rgba(0,255,136,0.4)' : 'none', transition: '0.4s' }}>
                                 {isProcessing ? 'PROCESANDO...' : <><Zap size={18} /> COBRAR</>}
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div style={{ marginTop: 40, display: 'flex', gap: 20 }}>
                     <button onClick={() => setShowProfile(false)} style={{ flex: 1, padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 950, cursor: 'pointer', transition: '0.3s' }}>VOLVER A RECEPCIÓN</button>
                     <button onClick={handleClearDebt} disabled={selectedMember.debt === 0} style={{ padding: '0 40px', borderRadius: 24, background: selectedMember.debt > 0 ? 'var(--danger-red)' : 'rgba(255,255,255,0.02)', color: selectedMember.debt > 0 ? '#fff' : 'var(--text-muted)', border: 'none', fontWeight: 950, cursor: 'pointer', transition: '0.3s' }}>LIQUIDAR TODA LA DEUDA</button>
                  </div>
               </div>
            </div>
         </div>
      )}


      {showQuickRegister && (
        <QuickRegisterModal 
          onClose={() => setShowQuickRegister(false)}
          plansConfig={plansConfig}
          onSave={async (data, amountPaid) => {
            const newMem = await addMember(data);
            
            if (amountPaid > 0) {
              await injectTransaction({
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString().slice(0, 5),
                description: `Plan: ${data.plan} (${data.name})`,
                category: data.plan === 'dia' ? 'daypass' : 'membership',
                type: 'income',
                amount: amountPaid,
                method: data.payMethod || 'Efectivo',
                client: data.name
              });
            }

            if (newMem) {
              await updateMemberStatus(newMem.id, {
                presence: { inGym: true, enteredAt: Date.now(), method: 'manual', doing: 'Recién inscrito' },
              });
            }

            setShowQuickRegister(false);
            setLogs(prev => [{ 
              id: Date.now(), 
              name: data.name, 
              action: 'NUEVO REGISTRO & INGRESO', 
              time: new Date().toLocaleTimeString().slice(0,5), 
              method: 'RECEPCIÓN', 
              color: 'var(--neon-green)' 
            }, ...prev]);
          }}
        />
      )}

      <style>{`
         @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
         .pulse-animation { animation: pulse 2s ease-in-out infinite; }
         
         .premium-shadow { boxShadow: 0 20px 40px rgba(0,0,0,0.4); }
         
         .athlete-card-premium:hover { 
            transform: translateY(-8px) scale(1.02); 
            border-color: var(--neon-green) !important; 
            background: linear-gradient(135deg, rgba(0,255,136,0.12), rgba(255,255,255,0.02)) !important;
            box-shadow: 0 15px 30px rgba(0,255,136,0.1);
         }

         .quick-product-card-premium:hover {
            background: rgba(0,255,136,0.05) !important;
            border-color: rgba(0,255,136,0.3) !important;
            transform: translateY(-5px);
         }

         .srv-btn-premium:hover {
            background: rgba(255,255,255,0.08) !important;
            transform: scale(1.05);
         }

         .search-input-premium:focus {
            border-color: var(--neon-green) !important;
            background: rgba(0,255,136,0.02) !important;
            box-shadow: 0 0 20px rgba(0,255,136,0.1);
         }

         .custom-scrollbar::-webkit-scrollbar { width: 5px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--neon-green); }
         
         .reception-grid-layout {
            display: grid;
            grid-template-columns: 420px 1fr 380px;
            gap: 24px;
            height: calc(100vh - 160px);
            overflow: hidden;
         }

         @media (max-width: 1400px) {
            .reception-grid-layout { grid-template-columns: 380px 1fr 320px; }
         }

         @media (max-width: 1200px) {
            .reception-grid-layout {
               grid-template-columns: 380px 1fr;
               height: auto;
               overflow: visible;
            }
         }

         @media (max-width: 900px) {
            .reception-grid-layout {
               grid-template-columns: 1fr;
               height: auto;
               overflow: visible;
               gap: 32px;
            }
         }
      `}</style>

    </div>
  );
}
