import { useState, useMemo } from 'react';
import {
  TrendingUp, AlertCircle, ArrowUpRight,
  ArrowDownRight, Plus, Filter, X, Check,
  CreditCard, Activity, ShieldCheck, BarChart2, Zap,
  Settings, PenTool, Database, Wallet, Package, Users,
  Search, Receipt, Smartphone, Banknote, Printer, Send
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useGymData, Member } from '../hooks/useGymData';
import NequiRadar from '../components/payments/NequiRadar';

/* ══════════════════════════════════════════
   TIPOS Y CONFIGURACIÓN
   Core Financial Architecture V.4.5 - OMNI_CAPITAL
    Integrated Payment Protocol & Obligations CRM
   ══════════════════════════════════════════ */
type TxCat = 'membership' | 'daypass' | 'class' | 'product' | 'rent' | 'salary' | 'utilities' | 'maintenance' | 'marketing' | 'fund_machine' | 'accessories' | 'other';

const monthlyData = [
  { mes:'Oct',  ingresos:3200000, gastos:2100000 },
  { mes:'Nov',  ingresos:3850000, gastos:2300000 },
  { mes:'Dic',  ingresos:4200000, gastos:2500000 },
  { mes:'Ene',  ingresos:4800000, gastos:2400000 },
  { mes:'Feb',  ingresos:5100000, gastos:2600000 },
  { mes:'Mar',  ingresos:5600000, gastos:2700000 },
  { mes:'Abr*', ingresos:4100000, gastos:3195000, savings: 850000 },
];

function PaymentVoucher({ tx, onClose }: { tx: any; onClose: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(20px)', display:'flex', justifyContent:'center', alignItems:'center', padding:20 }}>
      <div className="glass-card" style={{ width:350, padding:0, overflow:'hidden', border:'1px solid var(--neon-green)50', background:'#0a0f0d' }}>
         <div style={{ background:'var(--neon-green)', padding:24, textAlign:'center', color:'#000' }}>
            <div style={{ fontWeight:950, fontSize:10, letterSpacing:2, marginBottom:4 }}>GYM FUXION FIT</div>
            <div style={{ fontWeight:950, fontSize:22 }}>PAGO EXITOSO</div>
            <div style={{ fontSize:10, opacity:0.7, fontWeight:800 }}>VOUCHER_ID: {tx.hash}</div>
         </div>
         <div style={{ padding:32, display:'flex', flexDirection:'column', gap:20 }}>
            <div>
               <div style={{ fontSize:9, fontWeight:900, color:'var(--text-muted)', marginBottom:4 }}>CONCEPTO</div>
               <div style={{ fontSize:14, fontWeight:800 }}>{tx.description}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
               <div>
                  <div style={{ fontSize:9, fontWeight:900, color:'var(--text-muted)', marginBottom:4 }}>CLIENTE</div>
                  <div style={{ fontSize:13, fontWeight:800 }}>{tx.client}</div>
               </div>
               <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:9, fontWeight:900, color:'var(--text-muted)', marginBottom:4 }}>FECHA</div>
                  <div style={{ fontSize:11, fontWeight:800 }}>{tx.date} - {tx.time}</div>
               </div>
            </div>
            <div style={{ borderTop:'1px dashed rgba(255,255,255,0.1)', paddingTop:20, marginTop:10 }}>
               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div style={{ fontSize:11, fontWeight:900 }}>TOTAL_PAGADO</div>
                  <div style={{ fontSize:28, fontWeight:950, color:'var(--neon-green)' }}>${tx.amount?.toLocaleString()}</div>
               </div>
               <div style={{ fontSize:10, fontWeight:800, color:'var(--text-muted)', marginTop:4, textAlign:'right' }}>METODO: {tx.method?.toUpperCase()}</div>
            </div>
         </div>
         <div style={{ padding:24, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:10 }}>
            <button onClick={() => window.print()} style={{ flex:1, padding:12, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontSize:11, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
               <Printer size={14}/> IMPRIMIR
            </button>
            <button onClick={onClose} style={{ flex:1, padding:12, borderRadius:12, background:'var(--neon-green)', border:'none', color:'#000', fontSize:11, fontWeight:950, cursor:'pointer' }}>
               FINALIZAR
            </button>
         </div>
      </div>
    </div>
  );
}

export default function Finances() {
  const {
    transactions: txList, members, injectTransaction,
    goals, addGoal, updateGoal, deleteGoal,
    obligations, addObligation, updateObligation, deleteObligation, payObligation,
    staff, addStaff, updateStaff, deleteStaff, generateMonthlyPayroll,
    staffLoans, addStaffAdvance, addStaffLoan, deleteStaffLoan,
    waterConfig, updateWaterConfig, withdrawFromGoal,
    plans, plansConfig,
    updateMemberStatus, clearMemberDebt,
    updateTransaction, deleteTransaction
  } = useGymData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expense' | 'payroll' | 'goals' | 'agua'>('dashboard');
  
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [showObModal, setShowObModal] = useState(false);
  const [editingOb, setEditingOb] = useState<any | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [txForm, setTxForm] = useState({ description: '', amount: 0 });
  
  const [goalForm, setGoalForm] = useState({ name: '', target: 0, category: 'savings' as any });
  const [obForm, setObForm] = useState({ name:'', amount:0, dueDate:'', category:'utilities' as any });
  const [obPeriod, setObPeriod] = useState<'complete' | 'q1' | 'q2'>('complete');
  const [payrollPeriod, setPayrollPeriod] = useState<'complete' | 'q1' | 'q2'>(() => {
    const day = new Date().getDate();
    return day <= 15 ? 'q1' : 'q2';
  });
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [advanceTarget, setAdvanceTarget] = useState<any>(null);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [loanTarget, setLoanTarget] = useState<any>(null);
  const [loanForm, setLoanForm] = useState({ total: 0, installment: 0, description: '' });

  const handleDeleteObligation = (ob: any) => {
    const reason = window.prompt('¿Por qué eliminas esta obligación?');
    if (reason) {
      const history = JSON.parse(localStorage.getItem('fuxion_obligations_history') || '[]');
      history.push({
        id: ob.id,
        name: ob.name,
        amount: ob.amount,
        deletedAt: new Date().toISOString(),
        reason: reason
      });
      localStorage.setItem('fuxion_obligations_history', JSON.stringify(history));
      deleteObligation(ob.id);
    }
  };

  const handleUpdateTx = async () => {
    if (!editingTx) return;
    await updateTransaction(editingTx.id, { description: txForm.description, amount: Number(txForm.amount) });
    setEditingTx(null);
  };

  const handleDeleteTransaction = async (id: string | number) => {
    if (window.confirm('⚠️ ATENCIÓN: ¿Seguro que deseas eliminar este registro del historial? Esto afectará los cálculos de caja y reportes de forma permanente.')) {
      await deleteTransaction(id);
    }
  };
  const [staffForm, setStaffForm] = useState({ name:'', role:'', salary:0, phone:'', email:'', tempPassword:'', status:'active' as any, payPeriod: 'complete' as 'complete' | 'q1' | 'q2' });

  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('Efectivo');
  const [category, setCategory] = useState('membership');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showVoucher, setShowVoucher] = useState<any | null>(null);
  const [cobroOk, setCobroOk] = useState<{ name: string; amount: number; method: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpectingNequi, setIsExpectingNequi] = useState(false);
  const [aCredito, setACredito] = useState(false);
  const [abonoAmount, setAbonoAmount] = useState(0);

  // Estados Agua
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [waterEvidence, setWaterEvidence] = useState<string | null>(null);

  const changeAmount = useMemo(() => Math.max(0, receivedAmount - amount), [receivedAmount, amount]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return [];
    return members.filter(m => (m.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())).slice(0, 5);
  }, [members, searchTerm]);

  const stats = useMemo(() => {
    const income = txList.filter(t => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
    const expense = txList.filter(t => t.type === 'expense').reduce((a, t) => a + (t.amount || 0), 0);
    const savings = txList.filter(t => t.category === 'fund_machine').reduce((a, t) => a + (t.amount || 0), 0);
    return { income, expense, net: income - expense, savings };
  }, [txList]);

  const notifyViaWhatsApp = (clientName: string, phone: string, amt: number, cat: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const concept = cat === 'daypass' ? 'Día de Entrenamiento (Rutina)' : cat === 'membership' ? 'Mensualidad' : 'Producto/Suplemento';
    const msg = encodeURIComponent(`Hola ${clientName}, hemos recibido tu pago de $${amt.toLocaleString()} por concepto de ${concept}. ✅ ¡Gracias por tu sesión de hoy en GymFuxionFit! Nos vemos pronto para seguir superando límites. 💪🔥`);
    window.open(`https://wa.me/57${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleProcessPayment = async () => {
    if (amount <= 0 || !selectedMember || isProcessing) return;
    const memberSnap = selectedMember;
    const amountSnap = amount;
    const methodSnap = method;
    setIsProcessing(true);
    try {
      const newTx = await injectTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        description: `Pago ${category.toUpperCase()}: ${memberSnap.name}`,
        category: category,
        type: 'income',
        amount: amountSnap,
        method: methodSnap,
        client: memberSnap.name
      });
      // Confirmación visible inline + modal opcional
      setCobroOk({ name: memberSnap.name, amount: amountSnap, method: methodSnap });
      setShowVoucher(newTx);
      setSelectedMember(null);
      setSearchTerm('');
      setAmount(0);
      setReceivedAmount(0);
      setACredito(false);
      setTimeout(() => setCobroOk(null), 5000);
    } catch (e) {
      console.error("Error al procesar pago:", e);
      alert(`⚠️ Error al procesar el cobro: ${e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Abono: pago parcial contra deuda existente
  const handleAbono = async () => {
    if (!selectedMember || abonoAmount <= 0 || isProcessing) return;
    const memberSnap = selectedMember;
    const deuda = memberSnap.debt || 0;
    const pagoReal = Math.min(abonoAmount, deuda);
    const nuevaDeuda = Math.max(0, deuda - pagoReal);
    setIsProcessing(true);
    try {
      await updateMemberStatus(memberSnap.id, { debt: nuevaDeuda });
      const newTx = await injectTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        description: `Abono deuda: ${memberSnap.name} (Saldo restante: $${nuevaDeuda.toLocaleString()})`,
        category: 'membership',
        type: 'income',
        amount: pagoReal,
        method: method,
        client: memberSnap.name
      });
      setCobroOk({ name: memberSnap.name, amount: pagoReal, method: `Abono · Saldo: $${nuevaDeuda.toLocaleString()}` });
      setShowVoucher(newTx);
      setAbonoAmount(0);
      setSelectedMember(null);
      setSearchTerm('');
      setTimeout(() => setCobroOk(null), 5000);
    } catch (e) {
      console.error("Error al registrar abono:", e);
      alert(`⚠️ Error al registrar el abono: ${e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // A crédito: el servicio se presta ahora, se cobra después (suma a deuda)
  const handleDarCredito = async () => {
    if (!selectedMember || amount <= 0 || isProcessing) return;
    const memberSnap = selectedMember;
    const amountSnap = amount;
    const deudaActual = memberSnap.debt || 0;
    const nuevaDeuda = deudaActual + amountSnap;
    setIsProcessing(true);
    try {
      await updateMemberStatus(memberSnap.id, { debt: nuevaDeuda });
      await injectTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        description: `Crédito otorgado: ${memberSnap.name} (+$${amountSnap.toLocaleString()})`,
        category: category,
        type: 'expense',
        amount: amountSnap,
        method: 'Crédito',
        client: memberSnap.name
      });
      setCobroOk({ name: memberSnap.name, amount: amountSnap, method: `Crédito · Deuda total: $${nuevaDeuda.toLocaleString()}` });
      setTimeout(() => setCobroOk(null), 6000);
      setSelectedMember(null);
      setSearchTerm('');
      setAmount(0);
      setACredito(false);
    } catch (e) {
      console.error("Error al registrar crédito:", e);
      alert(`⚠️ Error al registrar el crédito: ${e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWaterWithdraw = () => {
    const waterGoal = goals.find(g => (g.name || '').toLowerCase().includes('agua'));
    if (!waterGoal || withdrawAmount <= 0) return alert('No hay meta de agua o monto inválido');
    
    withdrawFromGoal(waterGoal.id, withdrawAmount, withdrawReason);
    setWithdrawAmount(0);
    setWithdrawReason('');
    setWaterEvidence(null);
  };

  const handleCloseWaterWeek = () => {
    const waterGoal = goals.find(g => (g.name || '').toLowerCase().includes('agua'));
    if (!waterGoal) return alert('Debes crear una meta llamada "Ahorro Agua" primero');
    
    const waterTxs = txList.filter(t => (t.description || '').toLowerCase().includes('agua') && !t.goalId);
    const totalCollected = waterTxs.reduce((a, t) => a + t.amount, 0);
    const bagsSold = totalCollected / waterConfig.bagPrice;
    const pacasToRestock = Math.floor(bagsSold / waterConfig.bagsPerPaca);
    const costOfPacas = pacasToRestock * waterConfig.pacaCost; 
    const profit = totalCollected - costOfPacas;

    if (profit > 0) {
      updateGoal(waterGoal.id, { current: waterGoal.current + profit });
      alert(`Semana Cerrada. Reposición: ${pacasToRestock} pacas ($${costOfPacas}). Ahorrado: $${profit}`);
    } else {
      alert('No hay ganancias suficientes para cerrar la semana.');
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', gap:20, padding: '10px 0' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
           <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:8, height:8, background:'var(--neon-green)', borderRadius:'50%', boxShadow:'0 0 10px var(--neon-green)' }} />
              <h2 style={{ fontSize: 22, fontWeight: 950, letterSpacing: -1 }}>Gestión Financiera <span style={{ color: 'var(--neon-green)', fontWeight: 300 }}>V.4.5</span></h2>
           </div>
           <p style={{ color:'var(--text-muted)', fontSize:10, fontWeight:800, letterSpacing: 1.5 }}>CONTROL DE CAJA Y OBLIGACIONES</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', padding:4, borderRadius:12, display:'flex', border:'1px solid rgba(255,255,255,0.05)', gap:4 }}>
           {[
             { id: 'dashboard', label: 'DASHBOARD' },
             { id: 'income',    label: 'COBROS (+)' },
             { id: 'expense',   label: 'OBLIGACIONES (-)' },
             { id: 'payroll',   label: 'NÓMINA' },
             { id: 'agua',      label: 'AGUA 💧' },
             { id: 'goals',     label: 'METAS' },
           ].map(tab => (
             <button 
                key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                style={{ padding:'8px 16px', borderRadius:8, background: activeTab === tab.id ? 'var(--neon-green)' : 'transparent', color: activeTab === tab.id ? '#000' : 'var(--text-muted)', border:'none', fontSize:10, fontWeight:900, cursor:'pointer', transition:'0.3s' }}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <div className="kpi-row" style={{ gap:16 }}>
             {[
               { l: 'INGRESOS TOTALES', v: stats.income, c: 'var(--neon-green)' },
               { l: 'TOTAL GASTOS', v: stats.expense, c: '#ff4d4d' },
               { l: 'FONDOS AHORRO', v: stats.savings, c: '#00E5FF' },
               { l: 'LIQUIDACIÓN NETA', v: stats.net, c: '#fff' }
             ].map(k => (
                <div key={k.l} className="glass-card" style={{ padding: 20 }}>
                   <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 8 }}>{k.l}</div>
                   <div style={{ fontSize: 24, fontWeight: 950, color: k.c }}>${k.v.toLocaleString()}</div>
                </div>
             ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap:20 }}>
             <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                   <h3 style={{ fontSize: 13, fontWeight: 950 }}>FLUJO_DE_CAPITAL_TIEMPO_REAL</h3>
                   <div style={{ display:'flex', gap:10 }}>
                      <span style={{ fontSize:10, color:'var(--neon-green)', fontWeight:800 }}>● IN</span>
                      <span style={{ fontSize:10, color:'#ff4d4d', fontWeight:800 }}>● OUT</span>
                   </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                   <AreaChart data={monthlyData}>
                      <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fontSize:10, fill:'rgba(255,255,255,0.3)'}} />
                       <Tooltip contentStyle={{background:'#0a0f0d', border:'none', borderRadius:10, fontSize:10, color:'#fff'}} />
                      <Area type="monotone" dataKey="ingresos" stroke="var(--neon-green)" fill="rgba(0,255,136,0.1)" strokeWidth={2} />
                      <Area type="monotone" dataKey="gastos" stroke="#ff4d4d" fill="rgba(255,77,77,0.05)" strokeWidth={2} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                   <h3 style={{ fontSize: 13, fontWeight: 950 }}>DEBT_SENTINEL</h3>
                   <span style={{ fontSize:9, fontWeight:900, color:'#ff4d4d' }}>ALERTAS_ACTIVA</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:220, overflow:'auto' }}>
                   {members.filter(m => (m.debt || 0) > 0).map(m => (
                      <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:12, background:'rgba(255,77,77,0.05)', borderRadius:14, border:'1px solid rgba(255,77,77,0.1)' }}>
                         <div>
                            <div style={{ fontSize:11, fontWeight:800 }}>{m.name}</div>
                            <div style={{ fontSize:11, color:'var(--text-muted)' }}>Mora: ${m.debt?.toLocaleString()}</div>
                         </div>
                         <ShieldCheck size={14} color="#ff4d4d" />
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      ) : activeTab === 'income' ? (
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24, flex:1 }}>
           <div className="glass-card" style={{ padding:28, border: '1px solid var(--neon-green)20' }}>
              <h3 style={{ fontSize:20, fontWeight:950, marginBottom:4 }}>Registrar Cobro</h3>
              <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>Cobrar a un cliente del gimnasio</p>

              {/* ── COBRO RÁPIDO ── */}
              <div style={{ marginBottom:20 }}>
                 <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:10, display:'block' }}>Cobro Rápido</label>
                 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:8 }}>
                    {plans.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCategory(p.duration === 'dia' ? 'daypass' : 'membership');
                          setAmount(plansConfig[p.id] ?? p.price);
                        }}
                        style={{
                          padding:'10px 6px', borderRadius:10, cursor:'pointer', textAlign:'center',
                          background: amount === (plansConfig[p.id] ?? p.price) ? `${p.color}25` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${amount === (plansConfig[p.id] ?? p.price) ? p.color : 'rgba(255,255,255,0.08)'}`,
                          color: amount === (plansConfig[p.id] ?? p.price) ? p.color : '#fff',
                          transition:'0.2s'
                        }}
                      >
                        <div style={{ fontSize:12, fontWeight:950 }}>{p.label}</div>
                        <div style={{ fontSize:13, fontWeight:950, marginTop:2 }}>${(plansConfig[p.id] ?? p.price).toLocaleString()}</div>
                      </button>
                    ))}
                 </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                 {/* Buscar cliente */}
                 <div style={{ position:'relative' }}>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>¿A quién le cobras?</label>
                    <Search size={16} style={{ position:'absolute', left:14, top:46, opacity:0.5 }} />
                    <input
                       type="text" placeholder="Buscar por nombre..."
                       value={selectedMember ? selectedMember.name : searchTerm}
                       onChange={(e) => { setSearchTerm(e.target.value); setSelectedMember(null); }}
                       style={{ width:'100%', padding:'13px 13px 13px 42px', borderRadius:14, background:'rgba(255,255,255,0.03)', border: selectedMember ? '1px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.1)', color:'#fff', outline:'none', fontSize:15 }}
                    />
                    {selectedMember && (
                      <button onClick={() => { setSelectedMember(null); setSearchTerm(''); }} style={{ position:'absolute', right:12, top:44, background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={16}/></button>
                    )}
                    {searchTerm && !selectedMember && (
                       <div style={{ position:'absolute', top:'110%', left:0, right:0, background:'#0a0f0d', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden', zIndex:100 }}>
                          {filteredMembers.length === 0
                            ? <div style={{ padding:14, fontSize:13, color:'var(--text-muted)' }}>No se encontró nadie</div>
                            : filteredMembers.map(m => (
                             <div key={m.id} onClick={() => setSelectedMember(m)} style={{ padding:14, cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                <div style={{ fontSize:14, fontWeight:800 }}>{m.name}</div>
                                <div style={{ fontSize:11, color: m.status === 'active' ? 'var(--neon-green)' : '#ff4d4d', fontWeight:700 }}>{m.status === 'active' ? 'Activo' : m.status === 'expired' ? 'Vencido' : m.status}</div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>

                 {/* ── ALERTA DE DEUDA + ABONO ── */}
                 {selectedMember && (selectedMember.debt || 0) > 0 && (
                   <div style={{ background:'rgba(255,214,0,0.06)', border:'1px solid rgba(255,214,0,0.25)', borderRadius:14, padding:16 }}>
                     <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                       <div>
                         <div style={{ fontSize:13, fontWeight:950, color:'#FFD600' }}>⚠️ Tiene deuda pendiente</div>
                         <div style={{ fontSize:18, fontWeight:950, color:'#fff', marginTop:2 }}>${(selectedMember.debt || 0).toLocaleString()}</div>
                       </div>
                       <button
                         onClick={() => clearMemberDebt(selectedMember.id)}
                         style={{ padding:'8px 14px', borderRadius:10, background:'rgba(255,214,0,0.15)', border:'1px solid rgba(255,214,0,0.4)', color:'#FFD600', fontSize:12, fontWeight:950, cursor:'pointer' }}
                       >
                         Pagar todo
                       </button>
                     </div>
                     <label style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Abonar un valor parcial:</label>
                     <div style={{ display:'flex', gap:8 }}>
                       <input
                         type="number" placeholder="¿Cuánto abona?"
                         value={abonoAmount || ''}
                         onChange={e => setAbonoAmount(Number(e.target.value))}
                         style={{ flex:1, padding:'11px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,214,0,0.2)', color:'#FFD600', fontWeight:950, fontSize:15 }}
                       />
                       <button
                         onClick={handleAbono}
                         disabled={abonoAmount <= 0}
                         style={{ padding:'11px 18px', borderRadius:10, background: abonoAmount > 0 ? '#FFD600' : 'rgba(255,214,0,0.1)', border:'none', color:'#000', fontWeight:950, fontSize:13, cursor: abonoAmount > 0 ? 'pointer' : 'not-allowed' }}
                       >
                         Abonar
                       </button>
                     </div>
                   </div>
                 )}

                 {/* ── MODO A CRÉDITO ── */}
                 {selectedMember && (
                   <button
                     onClick={() => setACredito(v => !v)}
                     style={{ padding:'10px 16px', borderRadius:12, background: aCredito ? 'rgba(255,77,77,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${aCredito ? '#ff4d4d' : 'rgba(255,255,255,0.1)'}`, color: aCredito ? '#ff4d4d' : 'var(--text-muted)', fontSize:13, fontWeight:800, cursor:'pointer', textAlign:'left', transition:'0.2s' }}
                   >
                     {aCredito ? '🔴 Modo Crédito ACTIVO — el cliente pagará después' : '💳 Dar a crédito (cobrar después)'}
                   </button>
                 )}

                 {/* Valor + método de pago */}
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div>
                      <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Valor a cobrar ($)</label>
                      <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))}
                        style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--neon-green)', padding:'13px 12px', borderRadius:12, fontWeight:950, fontSize:18 }} />
                    </div>
                    <div>
                      <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Forma de pago</label>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                        {['Efectivo','Nequi','Transferencia'].map(m => (
                          <button key={m} onClick={() => setMethod(m)}
                            style={{ padding:'10px 4px', borderRadius:10, cursor:'pointer', fontSize:11, fontWeight:800,
                              background: method === m ? (m === 'Nequi' ? 'rgba(255,0,255,0.15)' : 'rgba(0,255,136,0.12)') : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${method === m ? (m === 'Nequi' ? '#FF00FF' : 'var(--neon-green)') : 'rgba(255,255,255,0.08)'}`,
                              color: method === m ? (m === 'Nequi' ? '#FF00FF' : 'var(--neon-green)') : 'var(--text-muted)',
                              transition:'0.2s'
                            }}>{m}</button>
                        ))}
                      </div>
                    </div>
                 </div>

                 {/* Calculadora de vuelto */}
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>El cliente paga con:</label>
                    <div style={{ display:'flex', gap:12 }}>
                       <input
                         type="number" placeholder="Billetes que entrega..."
                         value={receivedAmount || ''}
                         onChange={(e) => setReceivedAmount(Number(e.target.value))}
                         style={{ flex:1, padding:14, borderRadius:12, background:'rgba(0,255,136,0.05)', border:'1px solid var(--neon-green)30', color:'var(--neon-green)', fontWeight:950, fontSize:18, outline:'none' }}
                       />
                       <div style={{ flex:1, background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 16px' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)' }}>Le devuelves:</div>
                          <div style={{ fontSize:22, fontWeight:950, color: changeAmount > 0 ? '#00E5FF' : '#fff' }}>${changeAmount.toLocaleString()}</div>
                       </div>
                    </div>
                 </div>

                 {/* Banner de éxito inline */}
                 {cobroOk && (
                   <div style={{ padding:'14px 18px', borderRadius:14, background:'rgba(0,255,136,0.12)', border:'2px solid var(--neon-green)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                     <div>
                       <div style={{ fontSize:15, fontWeight:950, color:'var(--neon-green)' }}>✅ ¡Cobro registrado!</div>
                       <div style={{ fontSize:13, color:'#fff', marginTop:2 }}>{cobroOk.name} · ${cobroOk.amount.toLocaleString()} · {cobroOk.method}</div>
                     </div>
                     <button onClick={() => setShowVoucher(showVoucher)} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(0,255,136,0.2)', border:'none', color:'var(--neon-green)', fontSize:12, fontWeight:800, cursor:'pointer' }}>
                       Ver voucher
                     </button>
                   </div>
                 )}

                 {/* Botones de acción */}
                 <div style={{ display:'flex', gap:10 }}>
                    {method === 'Nequi' && (
                      <button
                        onClick={() => setIsExpectingNequi(true)}
                        disabled={!selectedMember}
                        style={{ flex:1, padding:16, borderRadius:14, background:'rgba(255,0,255,0.1)', color:'#FF00FF', border:'1px solid #FF00FF40', fontSize:13, fontWeight:950, cursor: selectedMember ? 'pointer' : 'not-allowed', opacity: selectedMember ? 1 : 0.4 }}
                      >
                        Esperar Nequi
                      </button>
                    )}
                    <button
                      onClick={aCredito ? handleDarCredito : handleProcessPayment}
                      disabled={!selectedMember || amount <= 0 || isProcessing}
                      style={{
                        flex:2, padding:18, borderRadius:14, border:'none', fontSize:16, fontWeight:950,
                        cursor: (!selectedMember || amount <= 0 || isProcessing) ? 'not-allowed' : 'pointer', transition:'0.2s',
                        background: isProcessing ? 'rgba(0,255,136,0.4)' : (!selectedMember || amount <= 0) ? 'rgba(255,255,255,0.1)' : aCredito ? '#ff4d4d' : 'var(--neon-green)',
                        color: (!selectedMember || amount <= 0) ? 'var(--text-muted)' : aCredito ? '#fff' : '#000'
                      }}
                    >
                      {isProcessing
                        ? '⏳ Procesando...'
                        : !selectedMember
                          ? '① Selecciona un cliente ↑'
                          : amount <= 0
                            ? '② Elige un plan o ingresa el valor ↑'
                            : aCredito
                              ? `💳 Dar a crédito $${amount.toLocaleString()}`
                              : `✅ Cobrar $${amount.toLocaleString()} a ${selectedMember.name}`}
                    </button>
                 </div>
              </div>
           </div>

           {/* Columna derecha */}
           <div className="glass-card" style={{ padding:28, display:'flex', flexDirection:'column', gap:20 }}>
               <NequiRadar
                  isExpecting={isExpectingNequi && !!selectedMember && method === 'Nequi'}
                  expectedMemberName={selectedMember?.name}
                  onCancelExpectation={() => setIsExpectingNequi(false)}
                  onLinkPayment={(amt, ref) => {
                    setAmount(amt);
                    setMethod('Nequi');
                    setCategory('membership');
                    setIsExpectingNequi(false);
                    alert(`Pago Nequi detectado: $${amt.toLocaleString()} [REF: ${ref}]. Selecciona el cliente para finalizar.`);
                  }}
               />
               <div>
                  <h3 style={{ fontSize:14, fontWeight:950, marginBottom:14 }}>Últimos cobros</h3>
                  {txList.filter(t => t.type === 'income').slice(0, 6).map(t => (
                      <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(0,255,136,0.03)', borderRadius:12, marginBottom:8 }}>
                         <div>
                           <div style={{ fontSize:13, fontWeight:800 }}>{t.client}</div>
                           <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.description || `${t.date} · ${t.method}`}</div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                           <div style={{ color:'var(--neon-green)', fontWeight:950, fontSize:14 }}>+${t.amount?.toLocaleString()}</div>
                           <button onClick={() => { setEditingTx(t); setTxForm({ description: t.description || t.client || '', amount: t.amount }); }} style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer' }} title="Editar"><PenTool size={13}/></button>
                           <button onClick={() => handleDeleteTransaction(t.id)} style={{ color:'#ff4d4d', opacity:0.6, background:'none', border:'none', cursor:'pointer' }} title="Eliminar"><X size={13}/></button>
                         </div>
                      </div>
                  ))}
               </div>
            </div>
            
            <div className="glass-card" style={{ padding:32, marginTop: 20 }}>
               <h3 style={{ fontSize:12, fontWeight:950, marginBottom:20 }}>OBLIGACIONES ELIMINADAS (HISTORIAL)</h3>
               <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                 {(() => {
                    const history = JSON.parse(localStorage.getItem('fuxion_obligations_history') || '[]');
                    return history.length === 0 ? (
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>No hay registro de eliminaciones.</div>
                    ) : history.reverse().map((item: any) => (
                        <div key={item.id} style={{ display:'flex', justifyContent:'space-between', padding:12, background:'rgba(255,77,77,0.03)', borderRadius:12 }}>
                           <div>
                              <div style={{ fontSize:11, fontWeight:800 }}>{item.name}</div>
                              <div style={{ fontSize:9, color:'var(--text-muted)' }}>Eliminado el: {new Date(item.deletedAt).toLocaleString()}</div>
                              <div style={{ fontSize:10, color:'#ff4d4d', marginTop: 4 }}>Motivo: {item.reason}</div>
                           </div>
                           <div style={{ color:'#ff4d4d', fontWeight:950 }}>${item.amount.toLocaleString()}</div>
                        </div>
                    ));
                 })()}
               </div>
            </div>
         </div>
      ) : activeTab === 'expense' ? (
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24, flex:1 }}>
           <div className="glass-card" style={{ padding:32, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                 <div>
                    <h3 style={{ fontSize:18, fontWeight:950, color:'#fff' }}>OBLIGACIONES_MENSUALES</h3>
                    <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:800 }}>GESTIÓN DE GASTOS FIJOS Y PENDIENTES</p>
                 </div>
                 <button 
                   onClick={() => { setEditingOb(null); setObForm({name:'', amount:0, dueDate:'', category:'utilities'}); setShowObModal(true); }}
                   style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'8px 16px', borderRadius:10, fontSize:10, fontWeight:950, cursor:'pointer' }}
                 >
                   + NUEVA OBLIGACIÓN
                 </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                 {obligations.map(ob => (
                    <div key={ob.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:16, background: ob.status==='pending' ? 'rgba(255,77,77,0.05)' : 'rgba(0,255,136,0.02)', borderRadius:16, border: `1px solid ${ob.status==='pending' ? 'rgba(255,77,77,0.1)' : 'rgba(0,255,136,0.1)'}` }}>
                       <div style={{ display:'flex', gap:15, alignItems:'center' }}>
                          <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', color: ob.status==='pending' ? '#ff4d4d' : 'var(--neon-green)' }}>
                             {ob.category==='rent' ? <Database size={18}/> : <PenTool size={18}/>}
                          </div>
                          <div>
                             <div style={{ fontSize:13, fontWeight:800 }}>{ob.name}</div>
                             <div style={{ fontSize:9, color:'var(--text-muted)' }}>Vence: {ob.dueDate} | {ob.category.toUpperCase()}</div>
                          </div>
                       </div>
                       <div style={{ textAlign:'right', display:'flex', alignItems:'center', gap:20 }}>
                          <div style={{ fontSize:15, fontWeight:950 }}>${ob.amount.toLocaleString()}</div>
                          {ob.status === 'pending' ? (
                             <button onClick={() => payObligation(ob.id)} style={{ padding:'8px 14px', borderRadius:10, background:'#ff4d4d', color:'#fff', border:'none', fontSize:10, fontWeight:950, cursor:'pointer' }}>PAGAR_AHORA</button>
                          ) : (
                             <span style={{ fontSize:10, fontWeight:950, color:'var(--neon-green)' }}>PAGADO ✓</span>
                          )}
                          <button onClick={() => { setEditingOb(ob); setObForm({ name: ob.name, amount: ob.amount, dueDate: ob.dueDate, category: ob.category }); setShowObModal(true); }} style={{ color:'var(--neon-green)', opacity:0.5, background:'none', border:'none', cursor:'pointer', marginRight: 10 }} title="Editar"><PenTool size={14}/></button>
                          <button onClick={() => handleDeleteObligation(ob)} style={{ color:'#ff4d4d', opacity:0.3, background:'none', border:'none', cursor:'pointer' }} title="Eliminar"><X size={14}/></button>
                       </div>
                    </div>
                 ))}
              </div>
              <div style={{ marginTop:24, padding:20, background:'rgba(255,255,255,0.02)', borderRadius:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                 <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)' }}>TOTAL OBLIGACIONES PENDIENTES</div>
                 <div style={{ fontSize:22, fontWeight:950, color:'#ff4d4d' }}>
                    ${obligations.filter(o => o.status === 'pending').reduce((a, o) => a + o.amount, 0).toLocaleString()}
                 </div>
              </div>
           </div>
           <div className="glass-card" style={{ padding:32 }}>
              <h3 style={{ fontSize:12, fontWeight:950, marginBottom:20 }}>HISTORIAL_DE_EGRESOS</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {txList.filter(t => t.type === 'expense').slice(0, 8).map(t => (
                    <div key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:12, background:'rgba(255,77,77,0.03)', borderRadius:12 }}>
                       <div>
                          <div style={{ fontSize:11, fontWeight:800 }}>{t.description}</div>
                          <div style={{ fontSize:9, color:'var(--text-muted)' }}>{t.date}</div>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                          <div style={{ color:'#ff4d4d', fontWeight:950 }}>-${t.amount.toLocaleString()}</div>
                          <button onClick={() => { setEditingTx(t); setTxForm({ description: t.description || '', amount: t.amount }); }} style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer' }} title="Editar"><PenTool size={13}/></button>
                          <button onClick={() => handleDeleteTransaction(t.id)} style={{ color:'#ff4d4d', opacity:0.6, background:'none', border:'none', cursor:'pointer' }} title="Eliminar"><X size={13}/></button>
                       </div>
                    </div>
                ))}
              </div>
           </div>
        </div>
      ) : activeTab === 'payroll' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
           <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                 <h3 style={{ fontSize:18, fontWeight:950 }}>ESTRUCTURA_DE_PERSONAL</h3>
                 <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:800 }}>GESTIÓN DE SUELDOS Y COLABORADORES</p>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                 <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'4px 6px 4px 12px' }}>
                    <span style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', whiteSpace:'nowrap' }}>PERÍODO</span>
                    <select
                      value={payrollPeriod}
                      onChange={e => setPayrollPeriod(e.target.value as any)}
                      style={{ background:'transparent', border:'none', color:'#fff', fontSize:10, fontWeight:900, outline:'none', cursor:'pointer', padding:'6px 4px' }}
                    >
                      <option value="complete" style={{ background:'#0a0f0d' }}>Mes Completo</option>
                      <option value="q1" style={{ background:'#0a0f0d' }}>1ra Quincena</option>
                      <option value="q2" style={{ background:'#0a0f0d' }}>2da Quincena</option>
                    </select>
                    <button
                      onClick={() => generateMonthlyPayroll(payrollPeriod)}
                      style={{ background:'rgba(0,229,255,0.15)', border:'1px solid #00E5FF50', color:'#00E5FF', padding:'8px 14px', borderRadius:10, fontSize:10, fontWeight:950, cursor:'pointer' }}
                    >
                      GENERAR NÓMINA
                    </button>
                 </div>
                 <button
                    onClick={() => { setEditingStaff(null); setStaffForm({name:'', role:'', salary:0, phone:'', email:'', tempPassword: 'Gym' + Math.floor(Math.random()*1000), status:'active', payPeriod:'complete'}); setShowStaffModal(true); }}
                    style={{ background:'var(--neon-green)', border:'none', color:'#000', padding:'10px 20px', borderRadius:12, fontSize:11, fontWeight:950, cursor:'pointer' }}
                 >
                    + AÑADIR STAFF
                 </button>
              </div>
           </div>

           <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20 }}>
              {staff.map(s => {
                const advance = s.advances || 0;
                const activeLoans = staffLoans.filter(l => l.staffId === s.id && l.remaining > 0);
                const loanDeduction = activeLoans.reduce((sum, l) => sum + Math.min(l.installment, l.remaining), 0);
                const period = s.payPeriod || 'complete';
                const basePay = period === 'complete' ? s.salary : s.salary / 2;
                const netPay = Math.max(0, basePay - advance - loanDeduction);
                const periodColor = period === 'q1' ? 'var(--neon-green)' : period === 'q2' ? '#FFD600' : '#00E5FF';
                const periodLabel = period === 'q1' ? '1ra QUINCENA' : period === 'q2' ? '2da QUINCENA' : 'MES COMPLETO';
                return (
                 <div key={s.id} className="glass-card" style={{ padding:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                       <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.1)' }}>
                             <Users size={22} style={{ opacity:0.5 }} />
                          </div>
                          <div>
                             <div style={{ fontSize:15, fontWeight:950 }}>{s.name}</div>
                             <div style={{ fontSize:11, color:'var(--neon-green)', fontWeight:800 }}>{s.role}</div>
                             <div style={{ fontSize:10, fontWeight:800, color: periodColor, marginTop:2 }}>{periodLabel}</div>
                          </div>
                       </div>
                       <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => { const msg = `Hola ${s.name}! Bienvenido al equipo de GymFuxionFit. 🚀%0A%0AAquí tienes tus credenciales de acceso:%0A👤 Usuario: ${s.email}%0A🔑 Clave: ${s.tempPassword || 'fuxion123'}%0A🔗 Acceso: ${window.location.origin}%0A%0A¡Nos vemos en el entrenamiento! 💪`; window.open(`https://wa.me/57${s.phone}?text=${msg}`, '_blank'); }} style={{ background:'rgba(0,255,136,0.1)', border:'none', padding:7, borderRadius:8, color:'var(--neon-green)', cursor:'pointer' }} title="Enviar Credenciales"><Send size={13}/></button>
                          <button onClick={() => { setEditingStaff(s); setStaffForm({ ...s, tempPassword: s.tempPassword || '', payPeriod: s.payPeriod || 'complete' }); setShowStaffModal(true); }} style={{ background:'rgba(255,255,255,0.05)', border:'none', padding:7, borderRadius:8, color:'#fff', cursor:'pointer' }}><PenTool size={13}/></button>
                          <button onClick={() => deleteStaff(s.id)} style={{ background:'rgba(255,77,77,0.1)', border:'none', padding:7, borderRadius:8, color:'#ff4d4d', cursor:'pointer' }}><X size={13}/></button>
                       </div>
                    </div>

                    {/* Desglose de pago */}
                    <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:10, padding:12, marginBottom:12, display:'flex', flexDirection:'column', gap:6 }}>
                       <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                          <span style={{ color:'var(--text-muted)' }}>Salario base</span>
                          <span style={{ fontWeight:800 }}>${basePay.toLocaleString()}</span>
                       </div>
                       {advance > 0 && (
                         <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                            <span style={{ color:'#FFD600' }}>Anticipo pendiente</span>
                            <span style={{ color:'#FFD600', fontWeight:800 }}>-${advance.toLocaleString()}</span>
                         </div>
                       )}
                       {loanDeduction > 0 && (
                         <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                            <span style={{ color:'#ff4d4d' }}>Cuota préstamo ({activeLoans.length})</span>
                            <span style={{ color:'#ff4d4d', fontWeight:800 }}>-${loanDeduction.toLocaleString()}</span>
                         </div>
                       )}
                       <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:6, display:'flex', justifyContent:'space-between', fontSize:13 }}>
                          <span style={{ fontWeight:950 }}>NETO A PAGAR</span>
                          <span style={{ fontWeight:950, color:'var(--neon-green)' }}>${netPay.toLocaleString()}</span>
                       </div>
                    </div>

                    {/* Botones de anticipo y préstamo */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                       <button
                          onClick={() => { setAdvanceTarget(s); setAdvanceAmount(0); setShowAdvanceModal(true); }}
                          style={{ padding:'8px 0', borderRadius:8, background:'rgba(255,214,0,0.08)', border:'1px solid rgba(255,214,0,0.2)', color:'#FFD600', fontSize:11, fontWeight:800, cursor:'pointer' }}
                       >
                          + Anticipo
                       </button>
                       <button
                          onClick={() => { setLoanTarget(s); setLoanForm({ total:0, installment:0, description:'' }); setShowLoanModal(true); }}
                          style={{ padding:'8px 0', borderRadius:8, background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.2)', color:'#ff4d4d', fontSize:11, fontWeight:800, cursor:'pointer' }}
                       >
                          + Préstamo
                       </button>
                    </div>

                    {/* Préstamos activos */}
                    {activeLoans.length > 0 && (
                      <div style={{ marginTop:10 }}>
                        {activeLoans.map(l => (
                          <div key={l.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', background:'rgba(255,77,77,0.04)', borderRadius:8, marginTop:4, fontSize:10 }}>
                            <div>
                              <div style={{ fontWeight:800, color:'#ff4d4d' }}>{l.description}</div>
                              <div style={{ color:'var(--text-muted)' }}>Saldo: ${l.remaining.toLocaleString()} | Cuota: ${l.installment.toLocaleString()}</div>
                            </div>
                            <button onClick={() => deleteStaffLoan(l.id)} style={{ background:'none', border:'none', color:'#ff4d4d', opacity:0.5, cursor:'pointer' }}><X size={12}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
                );
              })}
           </div>

           <div className="glass-card" style={{ padding:20, background:'rgba(0,229,255,0.05)', border:'1px solid #00E5FF30' }}>
              <p style={{ fontSize:11, color:'#00E5FF', fontWeight:800 }}>
                 <span style={{ fontWeight:950 }}>ASISTENTE FUXION:</span> Al hacer clic en "Generar Nómina", el sistema detecta a tus empleados activos y crea automáticamente las facturas de pago en la pestaña de OBLIGACIONES.
              </p>
           </div>
        </div>
      ) : activeTab === 'agua' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                 <h3 style={{ fontSize:18, fontWeight:950 }}>OMNI_AQUA: CONTROL_DE_AHORRO</h3>
                 <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:800 }}>REPOSICIÓN DE PACAS (50 UND) Y UTILIDAD NETA</p>
              </div>
              <div className="glass-card" style={{ padding:'8px 16px', background:'rgba(0,229,255,0.05)', border:'1px solid #00E5FF30', color:'#00E5FF', fontWeight:950, fontSize:11 }}>
                 META ACTIVA: AHORRO AGUA
              </div>
           </div>

           <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
              {/* PANEL DE CONFIGURACIÓN */}
              <div className="glass-card" style={{ padding:24, border:'1px solid var(--neon-green)10', background:'rgba(0,255,136,0.02)' }}>
                 <div style={{ fontSize:10, fontWeight:950, color:'var(--neon-green)', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}><Settings size={14}/> AJUSTES DE COSTOS</div>
                 <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
                    <div>
                       <label style={{ fontSize:9, color:'var(--text-muted)', display:'block', marginBottom:4 }}>PRECIO POR BOLSA ($)</label>
                       <input type="number" value={waterConfig.bagPrice} onChange={e => updateWaterConfig({ bagPrice: Number(e.target.value) })} style={{ width:'100%', padding:10, borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontWeight:800 }} />
                    </div>
                    <div>
                       <label style={{ fontSize:9, color:'var(--text-muted)', display:'block', marginBottom:4 }}>BOLSAS POR PACA</label>
                       <input type="number" value={waterConfig.bagsPerPaca} onChange={e => updateWaterConfig({ bagsPerPaca: Number(e.target.value) })} style={{ width:'100%', padding:10, borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontWeight:800 }} />
                    </div>
                    <div>
                       <label style={{ fontSize:9, color:'var(--text-muted)', display:'block', marginBottom:4 }}>COSTO DE 1 PACA ($)</label>
                       <input type="number" value={waterConfig.pacaCost} onChange={e => updateWaterConfig({ pacaCost: Number(e.target.value) })} style={{ width:'100%', padding:10, borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--neon-green)', fontWeight:950 }} />
                    </div>
                 </div>
              </div>
              <div className="glass-card" style={{ padding:32, border:'1px solid var(--neon-green)20' }}>
                 <div style={{ fontSize:10, fontWeight:950, color:'var(--neon-green)', marginBottom:20 }}>CALCULADORA DE CIERRE</div>
                 <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                       <div style={{ fontSize:12, color:'var(--text-muted)' }}>Bolsas vendidas:</div>
                       <span style={{ fontSize:14, fontWeight:950 }}>{Math.floor(txList.filter(t => t.description.includes('Agua')).reduce((a, t) => a + t.amount, 0) / (waterConfig.bagPrice || 1))} UND</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                       <span style={{ fontSize:12, color:'var(--text-muted)' }}>Dinero Recaudado:</span>
                       <span style={{ fontSize:14, fontWeight:950, color:'var(--neon-green)' }}>${txList.filter(t => t.description.includes('Agua')).reduce((a, t) => a + t.amount, 0).toLocaleString()}</span>
                    </div>
                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:15 }}>
                       <div style={{ fontSize:9, color:'var(--text-muted)', marginBottom:10 }}>ESTIMACIÓN DE REPOSICIÓN</div>
                       <button onClick={handleCloseWaterWeek} style={{ width:'100%', padding:16, borderRadius:12, background:'var(--neon-green)', color:'#000', border:'none', fontWeight:950, cursor:'pointer' }}>
                          CERRAR SEMANA Y AHORRAR
                       </button>
                    </div>
                 </div>
              </div>

              <div className="glass-card" style={{ padding:32 }}>
                 <div style={{ fontSize:10, fontWeight:950, color:'#ff4d4d', marginBottom:20 }}>RETIRO DE EMERGENCIA</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <input 
                      type="number" placeholder="Monto a retirar..." 
                      value={withdrawAmount || ''} onChange={e => setWithdrawAmount(Number(e.target.value))}
                      style={{ width:'100%', padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#ff4d4d', fontWeight:950 }} 
                    />
                    <input 
                      type="text" placeholder="Motivo del retiro..." 
                      value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)}
                      style={{ width:'100%', padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} 
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                       <label style={{ flex: 1, cursor: 'pointer', padding: 12, borderRadius: 12, background: waterEvidence ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 10, fontWeight: 900, color: waterEvidence ? 'var(--neon-green)' : '#fff' }}>
                          <PenTool size={14}/> {waterEvidence ? 'FACTURA LISTA ✓' : 'SUBIR FACTURA'}
                          <input type="file" style={{ display: 'none' }} onChange={() => setWaterEvidence('factura_cargada.jpg')} />
                       </label>
                       <button onClick={handleWaterWithdraw} style={{ flex:1, padding:12, borderRadius:12, background:'#ff4d4d', color:'#fff', border:'none', fontWeight:950, cursor:'pointer' }}>CONFIRMAR</button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card" style={{ padding:32 }}>
              <h3 style={{ fontSize:12, fontWeight:950, marginBottom:20 }}>HISTORIAL_FACTURAS_Y_MOVIMIENTOS</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:15 }}>
                 {txList.filter(t => t.goalId && (goals.find(g => g.id === t.goalId)?.name || '').toLowerCase().includes('agua')).map(t => (
                    <div key={t.id} style={{ borderRadius:12, border:'1px solid rgba(255,255,255,0.05)', overflow:'hidden', background:'rgba(0,0,0,0.2)', position:'relative' }}>
                       <button 
                         onClick={() => { alert('Para eliminar, usa el historial general de transacciones'); }}
                         style={{ position:'absolute', top:8, right:8, background:'rgba(255,77,77,0.2)', border:'none', color:'#ff4d4d', borderRadius:6, padding:4, cursor:'pointer', zIndex:10 }}
                       >
                         <X size={12}/>
                       </button>
                       <div style={{ height:120, background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Database size={32} style={{ opacity:0.1 }} />
                          <div style={{ position:'absolute', color:'var(--neon-green)', fontSize:10, fontWeight:950 }}>VER FACTURA</div>
                       </div>
                       <div style={{ padding:10 }}>
                          <div style={{ fontSize:10, fontWeight:800 }}>{t.description}</div>
                          <div style={{ fontSize:11, color:'#ff4d4d', fontWeight:950 }}>-${t.amount.toLocaleString()}</div>
                          <div style={{ fontSize:9, color:'var(--text-muted)', marginTop:4 }}>{t.date}</div>
                       </div>
                    </div>
                 ))}
                 {txList.filter(t => t.goalId && (goals.find(g => g.id === t.goalId)?.name || '').toLowerCase().includes('agua')).length === 0 && (
                    <div style={{ gridColumn:'1/-1', textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:12 }}>
                       No hay movimientos registrados en el ahorro de agua.
                    </div>
                 )}
              </div>
           </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
           <div onClick={() => { setEditingGoal(null); setGoalForm({ name: '', target: 0, category: 'savings' }); setShowGoalModal(true); }} className="glass-card" style={{ padding:24, border:'2px dashed rgba(0,255,136,0.2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:12, minHeight:180 }}>
              <div style={{ width:40, height:40, borderRadius:20, background:'rgba(0,255,136,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--neon-green)' }}><Plus size={24}/></div>
              <div style={{ fontSize:12, fontWeight:950, color:'var(--neon-green)' }}>CREAR NUEVA META</div>
           </div>
           {goals.map(g => (
             <div key={g.id} className="glass-card" style={{ padding:24, position:'relative' }}>
                <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:8 }}>
                   <button onClick={() => { setEditingGoal(g); setGoalForm({ name:g.name, target:g.target, category:g.category }); setShowGoalModal(true); }} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><PenTool size={14}/></button>
                   <button onClick={() => deleteGoal(g.id)} style={{ background:'none', border:'none', color:'#ff4d4d', cursor:'pointer' }}><X size={14}/></button>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                   <div style={{ color:'var(--neon-green)' }}>{g.category === 'payroll' ? <Users size={18}/> : <Zap size={18}/>}</div>
                   <div style={{ fontSize:11, fontWeight:950, textTransform:'uppercase' }}>{g.name}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:950 }}>${g.current.toLocaleString()}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:12 }}>Meta: ${g.target.toLocaleString()}</div>
                <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow:'hidden' }}>
                   <div style={{ height:'100%', width:`${Math.min((g.target > 0 ? (g.current/g.target)*100 : 0), 100)}%`, background:'var(--neon-green)', boxShadow:'0 0 10px var(--neon-green)' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                   <div style={{ fontSize:9, fontWeight:900, color:'var(--neon-green)' }}>{g.target > 0 ? Math.round((g.current/g.target)*100) : 0}%</div>
                   <button onClick={() => updateGoal(g.id, { current: g.current + 500000 })} style={{ padding:'2px 8px', borderRadius:4, background:'rgba(0,255,136,0.1)', border:'none', color:'var(--neon-green)', fontSize:9, fontWeight:950, cursor:'pointer' }}>+500K</button>
                </div>
             </div>
           ))}
        </div>
      )}

      {showGoalModal && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center' }}>
           <div className="glass-card" style={{ width:400, padding:32, border:'1px solid var(--neon-green)30' }}>
              <h3 style={{ fontSize:18, fontWeight:950, marginBottom:24 }}>{editingGoal ? 'EDITAR META' : 'NUEVA META'}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                 <div>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:8, display:'block' }}>NOMBRE</label>
                    <input value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:12, borderRadius:12 }} />
                 </div>
                 <div>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:8, display:'block' }}>VALOR META ($)</label>
                    <input type="number" value={goalForm.target} onChange={e => setGoalForm({...goalForm, target: Number(e.target.value)})} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--neon-green)', padding:12, borderRadius:12, fontWeight:950 }} />
                 </div>
                 <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setShowGoalModal(false)} style={{ flex:1, padding:14, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:950 }}>CANCELAR</button>
                    <button onClick={() => { if(editingGoal) updateGoal(editingGoal.id, goalForm); else addGoal({...goalForm, current:0}); setShowGoalModal(false); }} style={{ flex:1, padding:14, borderRadius:12, background:'var(--neon-green)', border:'none', color:'#000', fontWeight:950 }}>GUARDAR</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showObModal && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center', padding:16 }}>
           <div className="glass-card" style={{ width:'100%', maxWidth:460, padding:32, border:'1px solid #ff4d4d50' }}>
              <h3 style={{ fontSize:22, fontWeight:950, color:'#ff4d4d', marginBottom:24 }}>{editingOb ? 'EDITAR OBLIGACIÓN' : 'NUEVA OBLIGACIÓN'}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Concepto</label>
                    <input placeholder="Ej: Arriendo local, Luz, Internet..." value={obForm.name} onChange={e => setObForm({...obForm, name: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15 }} />
                 </div>
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                       <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Categoría</label>
                       <select value={obForm.category} onChange={e => setObForm({...obForm, category: e.target.value as any})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14 }}>
                          <option value="utilities">Servicios</option>
                          <option value="rent">Arriendo</option>
                          <option value="payroll">Nómina</option>
                       </select>
                    </div>
                    <div>
                       <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Monto ($)</label>
                       <input type="number" placeholder="0" value={obForm.amount} onChange={e => setObForm({...obForm, amount: Number(e.target.value)})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#ff4d4d', fontWeight:950, fontSize:16 }} />
                    </div>
                 </div>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:10, display:'block' }}>Período</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:12 }}>
                       {[
                         { val: 'complete', label: 'Mes Completo', color: '#00E5FF' },
                         { val: 'q1',       label: '1ra Quincena', color: 'var(--neon-green)' },
                         { val: 'q2',       label: '2da Quincena', color: '#FFD600' },
                       ].map(opt => (
                         <button
                           key={opt.val}
                           type="button"
                           onClick={() => setObPeriod(opt.val as any)}
                           style={{
                             padding:'12px 4px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:800,
                             background: obPeriod === opt.val ? `${opt.color}20` : 'rgba(255,255,255,0.03)',
                             border: `1px solid ${obPeriod === opt.val ? opt.color : 'rgba(255,255,255,0.08)'}`,
                             color: obPeriod === opt.val ? opt.color : 'var(--text-muted)',
                             transition: '0.2s'
                           }}
                         >
                           {opt.label}
                         </button>
                       ))}
                    </div>
                    <div>
                       <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Fecha de Vencimiento</label>
                       <input type="date" value={obForm.dueDate} onChange={e => setObForm({...obForm, dueDate: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14 }} />
                    </div>
                 </div>
                 <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setShowObModal(false)} style={{ flex:1, padding:16, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>CANCELAR</button>
                    <button onClick={() => {
                        let finalName = obForm.name;
                        if (!editingOb) {
                          if (obPeriod === 'q1') finalName = `(1ra Q) ${obForm.name}`;
                          else if (obPeriod === 'q2') finalName = `(2da Q) ${obForm.name}`;
                        }
                        if (editingOb) {
                          updateObligation(editingOb.id, { ...obForm, name: finalName });
                        } else {
                          addObligation({...obForm, name: finalName, status:'pending'});
                        }
                        setShowObModal(false);
                    }} style={{ flex:1, padding:16, borderRadius:12, background:'#ff4d4d', border:'none', color:'#fff', fontWeight:950, fontSize:14, cursor:'pointer' }}>{editingOb ? 'GUARDAR' : 'REGISTRAR'}</button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      {showVoucher && <PaymentVoucher tx={showVoucher} onClose={() => setShowVoucher(null)} />}

      {/* ══ MODAL ANTICIPO ══ */}
      {showAdvanceModal && advanceTarget && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center', padding:16 }}>
          <div className="glass-card" style={{ width:'100%', maxWidth:400, padding:32, border:'1px solid rgba(255,214,0,0.3)' }}>
            <h3 style={{ fontSize:20, fontWeight:950, color:'#FFD600', marginBottom:6 }}>ANTICIPO</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>Se descontará del próximo pago de <strong style={{ color:'#fff' }}>{advanceTarget.name}</strong></p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Monto del Anticipo ($)</label>
                <input
                  type="number" placeholder="0" value={advanceAmount || ''}
                  onChange={e => setAdvanceAmount(Number(e.target.value))}
                  style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,214,0,0.3)', color:'#FFD600', fontWeight:950, fontSize:18 }}
                  autoFocus
                />
              </div>
              <div style={{ padding:12, background:'rgba(255,214,0,0.05)', borderRadius:10, fontSize:12, color:'#FFD600' }}>
                Anticipo actual: <strong>${(advanceTarget.advances || 0).toLocaleString()}</strong>
                {advanceAmount > 0 && <> → Nuevo total: <strong>${((advanceTarget.advances || 0) + advanceAmount).toLocaleString()}</strong></>}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setShowAdvanceModal(false)} style={{ flex:1, padding:14, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>CANCELAR</button>
                <button onClick={() => { if (advanceAmount > 0) { addStaffAdvance(advanceTarget.id, advanceAmount); setShowAdvanceModal(false); } }} style={{ flex:1, padding:14, borderRadius:12, background:'#FFD600', border:'none', color:'#000', fontWeight:950, fontSize:14, cursor:'pointer' }}>REGISTRAR</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL PRÉSTAMO ══ */}
      {showLoanModal && loanTarget && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center', padding:16 }}>
          <div className="glass-card" style={{ width:'100%', maxWidth:420, padding:32, border:'1px solid rgba(255,77,77,0.3)' }}>
            <h3 style={{ fontSize:20, fontWeight:950, color:'#ff4d4d', marginBottom:6 }}>PRÉSTAMO A EMPLEADO</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>Registrar préstamo para <strong style={{ color:'#fff' }}>{loanTarget.name}</strong></p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Concepto / Motivo</label>
                <input
                  placeholder="Ej: Préstamo personal, Urgencia médica..."
                  value={loanForm.description} onChange={e => setLoanForm({...loanForm, description: e.target.value})}
                  style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14 }}
                />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Monto Total ($)</label>
                  <input
                    type="number" placeholder="0" value={loanForm.total || ''}
                    onChange={e => setLoanForm({...loanForm, total: Number(e.target.value)})}
                    style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,77,77,0.3)', color:'#ff4d4d', fontWeight:950, fontSize:16 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Cuota por Período ($)</label>
                  <input
                    type="number" placeholder="0" value={loanForm.installment || ''}
                    onChange={e => setLoanForm({...loanForm, installment: Number(e.target.value)})}
                    style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,77,77,0.2)', color:'#FFD600', fontWeight:950, fontSize:16 }}
                  />
                </div>
              </div>
              {loanForm.total > 0 && loanForm.installment > 0 && (
                <div style={{ padding:12, background:'rgba(255,77,77,0.05)', borderRadius:10, fontSize:12, color:'#ff4d4d' }}>
                  Cuotas estimadas: <strong>{Math.ceil(loanForm.total / loanForm.installment)}</strong> períodos
                </div>
              )}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setShowLoanModal(false)} style={{ flex:1, padding:14, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>CANCELAR</button>
                <button onClick={() => {
                  if (loanForm.total > 0 && loanForm.installment > 0 && loanForm.description) {
                    addStaffLoan({ staffId: loanTarget.id, staffName: loanTarget.name, total: loanForm.total, remaining: loanForm.total, installment: loanForm.installment, date: new Date().toISOString().split('T')[0], description: loanForm.description });
                    setShowLoanModal(false);
                  }
                }} style={{ flex:1, padding:14, borderRadius:12, background:'#ff4d4d', border:'none', color:'#fff', fontWeight:950, fontSize:14, cursor:'pointer' }}>REGISTRAR PRÉSTAMO</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL STAFF ══ */}
      {showStaffModal && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center', padding:16 }}>
           <div className="glass-card" style={{ width:'100%', maxWidth:460, padding:32, border:'1px solid var(--neon-green)30', maxHeight:'90vh', overflowY:'auto' }}>
              <h3 style={{ fontSize:22, fontWeight:950, marginBottom:24 }}>{editingStaff ? 'EDITAR STAFF' : 'NUEVO EMPLEADO'}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Nombre Completo</label>
                    <input className="input-field" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15 }} />
                 </div>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Cargo / Función</label>
                    <input className="input-field" value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15 }} />
                 </div>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Salario Base ($)</label>
                    <input type="number" className="input-field" value={staffForm.salary} onChange={e => setStaffForm({...staffForm, salary: Number(e.target.value)})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--neon-green)', fontWeight:950, fontSize:16 }} />
                 </div>
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                       <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Teléfono (WhatsApp)</label>
                       <input className="input-field" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15 }} />
                    </div>
                    <div>
                       <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Contraseña Temporal</label>
                       <input className="input-field" value={staffForm.tempPassword} onChange={e => setStaffForm({...staffForm, tempPassword: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--neon-green)', fontWeight:950, fontSize:15 }} />
                    </div>
                 </div>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Email de Acceso</label>
                    <input className="input-field" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15 }} />
                 </div>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:10, display:'block' }}>Período de Pago</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
                       {[
                         { val: 'complete', label: 'Mes Completo', color: '#00E5FF' },
                         { val: 'q1',       label: '1ra Quincena', color: 'var(--neon-green)' },
                         { val: 'q2',       label: '2da Quincena', color: '#FFD600' },
                       ].map(opt => (
                         <button
                           key={opt.val}
                           type="button"
                           onClick={() => setStaffForm({...staffForm, payPeriod: opt.val as any})}
                           style={{
                             padding:'12px 6px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:800,
                             background: staffForm.payPeriod === opt.val ? `${opt.color}20` : 'rgba(255,255,255,0.03)',
                             border: `1px solid ${staffForm.payPeriod === opt.val ? opt.color : 'rgba(255,255,255,0.08)'}`,
                             color: staffForm.payPeriod === opt.val ? opt.color : 'var(--text-muted)',
                             transition: '0.2s'
                           }}
                         >
                           {opt.label}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div style={{ display:'flex', gap:10, marginTop:10 }}>
                    <button onClick={() => setShowStaffModal(false)} style={{ flex:1, padding:16, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>CANCELAR</button>
                    <button onClick={() => {
                        if (editingStaff) updateStaff(editingStaff.id, staffForm);
                        else addStaff(staffForm);
                        setShowStaffModal(true);
                        setShowStaffModal(false);
                    }} style={{ flex:1, padding:16, borderRadius:12, background:'var(--neon-green)', border:'none', color:'#000', fontWeight:950, fontSize:14, cursor:'pointer' }}>GUARDAR STAFF</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ══ MODAL EDITAR TRANSACCION ══ */}
      {editingTx && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center', padding:16 }}>
           <div className="glass-card" style={{ width:'100%', maxWidth:400, padding:32, border:'1px solid var(--neon-green)30' }}>
              <h3 style={{ fontSize:22, fontWeight:950, marginBottom:24 }}>EDITAR EGRESO</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Descripción / Concepto</label>
                    <input className="input-field" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:15 }} />
                 </div>
                 <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Monto ($)</label>
                    <input type="number" className="input-field" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: Number(e.target.value)})} style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,77,77,0.3)', color:'#ff4d4d', fontWeight:950, fontSize:16 }} />
                 </div>
                 <div style={{ display:'flex', gap:10, marginTop:10 }}>
                    <button onClick={() => setEditingTx(null)} style={{ flex:1, padding:16, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>CANCELAR</button>
                    <button onClick={handleUpdateTx} style={{ flex:1, padding:16, borderRadius:12, background:'var(--neon-green)', border:'none', color:'#000', fontWeight:950, fontSize:14, cursor:'pointer' }}>GUARDAR CAMBIOS</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
