import { useState, useMemo } from 'react';
import {
  TrendingUp, AlertCircle, ArrowUpRight,
  ArrowDownRight, Plus, Filter, X, Check,
  CreditCard, Activity, ShieldCheck, BarChart2, Zap,
  Settings, PenTool, Database, Wallet, Package, Users,
  Search, Receipt, Smartphone, Banknote, Printer
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useGymData, Member } from '../hooks/useGymData';

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
    staff, addStaff, updateStaff, deleteStaff, generateMonthlyPayroll
  } = useGymData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expense' | 'payroll' | 'goals'>('dashboard');
  
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [showObModal, setShowObModal] = useState(false);
  const [editingOb, setEditingOb] = useState<any | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  
  const [goalForm, setGoalForm] = useState({ name: '', target: 0, category: 'savings' as any });
  const [obForm, setObForm] = useState({ name:'', amount:0, dueDate:'', category:'utilities' as any });
  const [staffForm, setStaffForm] = useState({ name:'', role:'', salary:0, status:'active' as any });

  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('Efectivo');
  const [category, setCategory] = useState('membership');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showVoucher, setShowVoucher] = useState<any | null>(null);

  const changeAmount = useMemo(() => Math.max(0, receivedAmount - amount), [receivedAmount, amount]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return [];
    return members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [members, searchTerm]);

  const stats = useMemo(() => {
    const income = txList.filter(t => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
    const expense = txList.filter(t => t.type === 'expense').reduce((a, t) => a + (t.amount || 0), 0);
    const savings = txList.filter(t => t.category === 'fund_machine').reduce((a, t) => a + (t.amount || 0), 0);
    return { income, expense, net: income - expense, savings };
  }, [txList]);

  const handleProcessPayment = () => {
    if (amount <= 0 || !selectedMember) return;
    const newTx = injectTransaction({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString().slice(0, 5),
      description: `Pago ${category.toUpperCase()}: ${selectedMember.name}`,
      category: category,
      type: 'income',
      amount: amount,
      method: method,
      client: selectedMember.name
    });
    setShowVoucher(newTx);
    setSelectedMember(null);
    setSearchTerm('');
    setAmount(0);
    setReceivedAmount(0);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', gap:20, padding: '10px 0' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
           <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:8, height:8, background:'var(--neon-green)', borderRadius:'50%', boxShadow:'0 0 10px var(--neon-green)' }} />
              <h2 style={{ fontSize: 22, fontWeight: 950, letterSpacing: -1 }}>OMNI_CAPITAL <span style={{ color: 'var(--neon-green)', fontWeight: 300 }}>V.4.5</span></h2>
           </div>
           <p style={{ color:'var(--text-muted)', fontSize:10, fontWeight:800, letterSpacing: 1.5 }}>ULTRA COMMAND CENTER - CASH & OBLIGATIONS</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', padding:4, borderRadius:12, display:'flex', border:'1px solid rgba(255,255,255,0.05)', gap:4 }}>
           {[
             { id: 'dashboard', label: 'DASHBOARD' },
             { id: 'income',    label: 'COBROS (+)' },
             { id: 'expense',   label: 'OBLIGACIONES (-)' },
             { id: 'payroll',   label: 'NÓMINA' },
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16 }}>
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
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20 }}>
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
           <div className="glass-card" style={{ padding:32, border: '1px solid var(--neon-green)20' }}>
              <h3 style={{ fontSize:18, fontWeight:950, marginBottom:8 }}>RECIBO_DE_COBRO</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:800, marginBottom:24 }}>PROCESAR NUEVA TRANSACCIÓN DE ENTRADA</p>
              <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                 <div style={{ position:'relative' }}>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:8, display:'block' }}>BUSCAR SOCIO</label>
                    <Search size={16} style={{ position:'absolute', left:14, top:42, opacity:0.5 }} />
                    <input 
                       type="text" placeholder="Nombre..." 
                       value={selectedMember ? selectedMember.name : searchTerm}
                       onChange={(e) => { setSearchTerm(e.target.value); setSelectedMember(null); }}
                       style={{ width:'100%', padding:'14px 14px 14px 44px', borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', outline:'none', fontSize:14 }} 
                    />
                    {searchTerm && !selectedMember && (
                       <div style={{ position:'absolute', top:'110%', left:0, right:0, background:'#0a0f0d', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden', zIndex:100 }}>
                          {filteredMembers.map(m => (
                             <div key={m.id} onClick={() => setSelectedMember(m)} style={{ padding:14, cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between' }}>
                                <div style={{ fontSize:13, fontWeight:800 }}>{m.name}</div>
                                <div style={{ fontSize:10 }}>{m.status?.toUpperCase()}</div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                    <div>
                        <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:8, display:'block' }}>CONCEPTO</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: 12, borderRadius: 12 }}>
                           <option value="membership">Mensualidad</option>
                           <option value="product">Producto</option>
                           <option value="daypass">Día</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:8, display:'block' }}>MONTO A COBRAR ($)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ width:'100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--neon-green)', padding: 12, borderRadius: 12, fontWeight: 950 }} />
                    </div>
                 </div>
                 <div>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:8, display:'block' }}>PAGA CON (CALCULADORA DE VUELTAS)</label>
                    <div style={{ display:'flex', gap:12 }}>
                       <input 
                         type="number" placeholder="Ingresa billete..." 
                         value={receivedAmount || ''} 
                         onChange={(e) => setReceivedAmount(Number(e.target.value))}
                         style={{ flex:1, padding:14, borderRadius:12, background:'rgba(0,255,136,0.05)', border:'1px solid var(--neon-green)30', color:'var(--neon-green)', fontWeight:950, fontSize:18, outline:'none' }}
                       />
                       <div style={{ flex:1, background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 15px' }}>
                          <div style={{ fontSize:8, fontWeight:950, color:'var(--text-muted)' }}>DEVOLVER:</div>
                          <div style={{ fontSize:18, fontWeight:950, color: changeAmount > 0 ? '#00E5FF' : '#fff' }}>${changeAmount.toLocaleString()}</div>
                       </div>
                    </div>
                 </div>
                 <button onClick={handleProcessPayment} style={{ padding:20, borderRadius:16, background:'var(--neon-green)', color:'#000', border:'none', fontSize:14, fontWeight:950, cursor:'pointer' }}>EJECUTAR COBRO [SYNC]</button>
              </div>
           </div>
           <div className="glass-card" style={{ padding:32 }}>
              <h3 style={{ fontSize:12, fontWeight:950, marginBottom:20 }}>INGRESOS_RECIENTES</h3>
              {txList.filter(t => t.type === 'income').slice(0, 6).map(t => (
                  <div key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:12, background:'rgba(0,255,136,0.03)', borderRadius:12, marginBottom:10 }}>
                     <div style={{ fontSize:11, fontWeight:800 }}>{t.client}</div>
                     <div style={{ color:'var(--neon-green)', fontWeight:950 }}>+${t.amount?.toLocaleString()}</div>
                  </div>
              ))}
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
                          <button onClick={() => deleteObligation(ob.id)} style={{ color:'#ff4d4d', opacity:0.3, background:'none', border:'none', cursor:'pointer' }}><X size={14}/></button>
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
                       <div style={{ color:'#ff4d4d', fontWeight:950 }}>-${t.amount.toLocaleString()}</div>
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
              <div style={{ display:'flex', gap:12 }}>
                 <button 
                   onClick={() => generateMonthlyPayroll()}
                   style={{ background:'rgba(0,229,255,0.1)', border:'1px solid #00E5FF', color:'#00E5FF', padding:'10px 20px', borderRadius:12, fontSize:11, fontWeight:950, cursor:'pointer' }}
                 >
                   ⚡ GENERAR NÓMINA DEL MES
                 </button>
                 <button 
                    onClick={() => { setEditingStaff(null); setStaffForm({name:'', role:'', salary:0, status:'active'}); setShowStaffModal(true); }}
                    style={{ background:'var(--neon-green)', border:'none', color:'#000', padding:'10px 20px', borderRadius:12, fontSize:11, fontWeight:950, cursor:'pointer' }}
                 >
                    + AÑADIR STAFF
                 </button>
              </div>
           </div>

           <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
              {staff.map(s => (
                 <div key={s.id} className="glass-card" style={{ padding:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                       <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.1)' }}>
                          <Users size={24} style={{ opacity:0.5 }} />
                       </div>
                       <div>
                          <div style={{ fontSize:14, fontWeight:950 }}>{s.name}</div>
                          <div style={{ fontSize:10, color:'var(--neon-green)', fontWeight:800 }}>{s.role}</div>
                          <div style={{ fontSize:15, fontWeight:950, marginTop:4 }}>${s.salary.toLocaleString()}</div>
                       </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                       <button onClick={() => { setEditingStaff(s); setStaffForm({...s}); setShowStaffModal(true); }} style={{ background:'rgba(255,255,255,0.05)', border:'none', padding:8, borderRadius:8, color:'#fff', cursor:'pointer' }}><PenTool size={14}/></button>
                       <button onClick={() => deleteStaff(s.id)} style={{ background:'rgba(255,77,77,0.1)', border:'none', padding:8, borderRadius:8, color:'#ff4d4d', cursor:'pointer' }}><X size={14}/></button>
                    </div>
                 </div>
              ))}
           </div>

           <div className="glass-card" style={{ padding:20, background:'rgba(0,229,255,0.05)', border:'1px solid #00E5FF30' }}>
              <p style={{ fontSize:11, color:'#00E5FF', fontWeight:800 }}>
                 <span style={{ fontWeight:950 }}>ASISTENTE FUXION:</span> Al hacer clic en "Generar Nómina", el sistema detecta a tus empleados activos y crea automáticamente las facturas de pago en la pestaña de OBLIGACIONES.
              </p>
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
                   <div style={{ height:'100%', width:`${Math.min((g.current/g.target)*100, 100)}%`, background:'var(--neon-green)', boxShadow:'0 0 10px var(--neon-green)' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                   <div style={{ fontSize:9, fontWeight:900, color:'var(--neon-green)' }}>{Math.round((g.current/g.target)*100)}%</div>
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
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center' }}>
           <div className="glass-card" style={{ width:400, padding:32, border:'1px solid #ff4d4d50' }}>
              <h3 style={{ fontSize:18, fontWeight:950, color:'#ff4d4d', marginBottom:24 }}>NUEVA OBLIGACIÓN</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                 <input placeholder="Concepto..." value={obForm.name} onChange={e => setObForm({...obForm, name: e.target.value})} style={{ width:'100%', padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <select value={obForm.category} onChange={e => setObForm({...obForm, category: e.target.value as any})} style={{ padding:14, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }}>
                       <option value="utilities">Servicios</option>
                       <option value="rent">Arriendo</option>
                       <option value="payroll">Nómina</option>
                    </select>
                    <input type="number" placeholder="Monto..." value={obForm.amount} onChange={e => setObForm({...obForm, amount: Number(e.target.value)})} style={{ padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#ff4d4d', fontWeight:950 }} />
                 </div>
                 <input type="date" value={obForm.dueDate} onChange={e => setObForm({...obForm, dueDate: e.target.value})} style={{ width:'100%', padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
                 <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setShowObModal(false)} style={{ flex:1, padding:14, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:950 }}>CANCELAR</button>
                    <button onClick={() => { addObligation({...obForm, status:'pending'}); setShowObModal(false); }} style={{ flex:1, padding:14, borderRadius:12, background:'#ff4d4d', border:'none', color:'#fff', fontWeight:950 }}>REGISTRAR</button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      {showVoucher && <PaymentVoucher tx={showVoucher} onClose={() => setShowVoucher(null)} />}

      {/* ══ MODAL STAFF ══ */}
      {showStaffModal && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center' }}>
           <div className="glass-card" style={{ width:400, padding:32, border:'1px solid var(--neon-green)30' }}>
              <h3 style={{ fontSize:18, fontWeight:950, marginBottom:24 }}>{editingStaff ? 'EDITAR STAFF' : 'NUEVO EMPLEADO'}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                 <div>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>NOMBRE COMPLETO</label>
                    <input className="input-field" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} style={{ width:'100%', padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
                 </div>
                 <div>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>CARGO / FUNCIÓN</label>
                    <input className="input-field" value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} style={{ width:'100%', padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff' }} />
                 </div>
                 <div>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>SALARIO BASE ($)</label>
                    <input type="number" className="input-field" value={staffForm.salary} onChange={e => setStaffForm({...staffForm, salary: Number(e.target.value)})} style={{ width:'100%', padding:12, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--neon-green)', fontWeight:950 }} />
                 </div>
                 <div style={{ display:'flex', gap:10, marginTop:10 }}>
                    <button onClick={() => setShowStaffModal(false)} style={{ flex:1, padding:14, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:950, cursor:'pointer' }}>CANCELAR</button>
                    <button onClick={() => {
                        if (editingStaff) updateStaff(editingStaff.id, staffForm);
                        else addStaff(staffForm);
                        setShowStaffModal(true);
                        setShowStaffModal(false);
                    }} style={{ flex:1, padding:14, borderRadius:12, background:'var(--neon-green)', border:'none', color:'#000', fontWeight:950, cursor:'pointer' }}>GUARDAR STAFF</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
