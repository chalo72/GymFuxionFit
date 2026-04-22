import { useState, useMemo } from 'react';
import { 
  Dumbbell, Wrench, Activity, AlertCircle, 
  Calendar, ChevronRight, Package, Search, 
  Filter, Plus, ShieldCheck, Database,
  Settings, PenTool, LayoutGrid, List,
  TrendingUp, ShoppingCart, ArrowDown, ArrowUp, Edit3, X
} from 'lucide-react';
import { useGymData, Product, GymAsset } from '../hooks/useGymData';

/* ══════════════════════════════════════════
   INVENTORY HUB UI V.2.5 - OMNI_STOCK
   Integrated Asset & Product Management
   ══════════════════════════════════════════ */

export default function Inventory() {
  const { assets, products, addProduct, updateProduct, deleteProduct } = useGymData();
  const [activeTab, setActiveTab] = useState<'assets' | 'products'>('assets');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modal de Producto
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'supplements' as any, stock: 0, minStock: 2, buyPrice: 0, sellPrice: 0
  });

  // Estadísticas calculadas
  const inventoryStats = useMemo(() => {
    if (activeTab === 'assets') {
      const operational = assets.filter(a => a.status === 'OPERATIONAL').length;
      return {
        total: assets.length,
        health: `${((operational / assets.length) * 100).toFixed(1)}%`,
        alerts: assets.filter(a => a.status === 'MAINTENANCE' || a.status === 'DEFECTIVE').length,
        label: 'EQUIPOS_SALA'
      };
    } else {
      const lowStock = products.filter(p => p.stock <= p.minStock).length;
      const totalValue = products.reduce((acc, p) => acc + (p.stock * p.buyPrice), 0);
      return {
        total: products.length,
        health: `$${totalValue.toLocaleString()}`,
        alerts: lowStock,
        label: 'VALOR_STOCK'
      };
    }
  }, [activeTab, assets, products]);

  const filteredItems = useMemo(() => {
    const list = activeTab === 'assets' ? assets : products;
    return list.filter(item => 
      (filter === 'all' || (item as any).category === filter) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item as any).id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activeTab, assets, products, filter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20, padding: '10px 0' }}>
      
      {/* ── HEADER HUD ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Package size={20} style={{ color: 'var(--neon-green)' }} />
              <h1 style={{ fontSize: 22, fontWeight: 950, letterSpacing: -1 }}>OMNI_STOCK <span style={{ color: 'var(--neon-green)', fontSize: 13, fontWeight: 300 }}>V.2.5</span></h1>
           </div>
           <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1.5 }}>INTEGRATED LOGISTICS & PROFITABILITY TRACKER</div>
        </div>

        <div style={{ display:'flex', gap:12 }}>
           {activeTab === 'products' && (
             <button 
                onClick={() => { setEditingProduct(null); setProductForm({name:'', category:'supplements', stock:0, minStock:2, buyPrice:0, sellPrice:0}); setShowProductModal(true); }}
                style={{ background:'var(--neon-green)', border:'none', borderRadius:10, padding:'10px 16px', display:'flex', alignItems:'center', gap:8, color:'#000', fontWeight:950, fontSize:11, cursor:'pointer' }}
             >
                <Plus size={16}/> AÑADIR_PRODUCTO
             </button>
           )}
           <div style={{ background:'rgba(255,255,255,0.03)', padding:4, borderRadius:12, display:'flex', border:'1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => setActiveTab('assets')} style={{ padding:'8px 16px', borderRadius:8, background: activeTab==='assets'?'var(--neon-green)':'transparent', color:activeTab==='assets'?'#000':'var(--text-muted)', border:'none', fontSize:11, fontWeight:900, cursor:'pointer', transition:'0.3s' }}>EQUIPOS_GYM</button>
              <button onClick={() => setActiveTab('products')} style={{ padding:'8px 16px', borderRadius:8, background: activeTab==='products'?'var(--neon-green)':'transparent', color:activeTab==='products'?'#000':'var(--text-muted)', border:'none', fontSize:11, fontWeight:900, cursor:'pointer', transition:'0.3s' }}>STOCKS_VENTA</button>
           </div>
        </div>
      </div>

      {/* ── KPI TELEMETRY ── */}
      <div className="kpi-row" style={{ gap: 16 }}>
         <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 8, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8 }}>ITEMS_REGISTRADOS</div>
            <div style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{inventoryStats.total} <span style={{ fontSize: 10, opacity:0.5 }}>SKU</span></div>
         </div>
         <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 8, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8 }}>{inventoryStats.label}</div>
            <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--neon-green)' }}>{inventoryStats.health}</div>
         </div>
         <div className="glass-card" style={{ padding: 16, border: inventoryStats.alerts > 0 ? '1px solid #ff4d4d30' : 'none' }}>
            <div style={{ fontSize: 8, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8 }}>{activeTab==='assets' ? 'PEND_MANTENIMIENTO' : 'STOCK_CRITICO'}</div>
            <div style={{ fontSize: 24, fontWeight: 950, color: inventoryStats.alerts > 0 ? '#ff4d4d' : 'var(--neon-green)' }}>{inventoryStats.alerts}</div>
         </div>
         {activeTab === 'products' ? (
           <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 8, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8 }}>POTENCIAL_GANANCIA</div>
              <div style={{ fontSize: 24, fontWeight: 950, color: '#00E5FF' }}>+35% AVG</div>
           </div>
         ) : (
           <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 8, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8 }}>DEPRECIACIÓN_EST</div>
              <div style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>-12% <span style={{ fontSize: 10, opacity:0.5 }}>ANUAL</span></div>
           </div>
         )}
      </div>

      {/* ── CONTROL BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
         <div style={{ display: 'flex', gap: 8 }}>
            {activeTab === 'assets' ? (
               ['all', 'machine', 'free_weight', 'accessory'].map(f => (
                 <button 
                   key={f} onClick={() => setFilter(f)}
                   style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: filter === f ? 'var(--green-10)' : 'transparent', color: filter === f ? 'var(--neon-green)' : 'var(--text-muted)', fontSize: 10, fontWeight: 950, cursor: 'pointer', textTransform: 'uppercase' }}
                 >
                   {f.replace('_', ' ')}
                 </button>
               ))
            ) : (
               ['all', 'supplements', 'drinks', 'snacks', 'apparel'].map(f => (
                  <button 
                    key={f} onClick={() => setFilter(f)}
                    style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: filter === f ? 'var(--green-10)' : 'transparent', color: filter === f ? 'var(--neon-green)' : 'var(--text-muted)', fontSize: 10, fontWeight: 950, cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    {f}
                  </button>
                ))
            )}
         </div>
         <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
               <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                 placeholder="BUSCAR ITEM..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px 8px 34px', color: '#fff', fontSize: 11, fontWeight: 700, width: 220 }} 
               />
            </div>
            <div style={{ display:'flex', gap:4, background: 'rgba(255,255,255,0.05)', padding:4, borderRadius:10 }}>
               <button onClick={()=>setView('grid')} style={{ padding:6, background: view==='grid' ? 'var(--green-10)' : 'transparent', border:'none', borderRadius:6, color: view==='grid' ? 'var(--neon-green)' : 'var(--text-muted)' }}><LayoutGrid size={16}/></button>
               <button onClick={()=>setView('list')} style={{ padding:6, background: view==='list' ? 'var(--green-10)' : 'transparent', border:'none', borderRadius:6, color: view==='list' ? 'var(--neon-green)' : 'var(--text-muted)' }}><List size={16}/></button>
            </div>
         </div>
      </div>

      {/* ── ITEMS VIEWPORT ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
         {activeTab === 'assets' ? (
            /* ASSET LIST/GRID (Existente pero pulido) */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
               {(filteredItems as GymAsset[]).map(asset => (
                  <div key={asset.id} className="glass-card" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow:'hidden' }}>
                     <div style={{ position:'absolute', top:0, left:0, height:2, width:`${asset.health}%`, background: asset.health > 80 ? 'var(--neon-green)' : asset.health > 40 ? '#FFD600' : '#ff4d4d' }} />
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,255,136,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-green)' }}>
                           {asset.category === 'machine' ? <Settings size={22}/> : <Dumbbell size={22}/>}
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 950, color: 'var(--text-muted)' }}>{asset.id}</span>
                     </div>
                     <h3 style={{ fontSize: 13, fontWeight: 950, color: '#fff', marginBottom: 6 }}>{asset.name}</h3>
                     <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, fontWeight:900 }}>
                           <span style={{ color: 'var(--text-muted)' }}>ESTADO</span>
                           <span style={{ color: asset.status==='OPERATIONAL' ? 'var(--neon-green)' : '#ff4d4d' }}>{asset.status}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            /* PRODUCT LOGISTICS (Optimizado para el usuario) */
            <div className="data-table-container">
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <tr>
                         {['PRODUCTO', 'STOCK', 'MIN', 'COMPRA', 'VENTA', 'UTILIDAD', 'ACCIONES'].map(h => (
                           <th key={h} style={{ padding: '16px 24px', fontSize: 9, fontWeight: 950, color: 'var(--text-muted)' }}>{h}</th>
                         ))}
                      </tr>
                  </thead>
                  <tbody>
                     {(filteredItems as Product[]).map(product => (
                       <tr key={product.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: product.stock <= product.minStock ? 'rgba(255,77,77,0.03)' : 'transparent' }}>
                          <td style={{ padding: '16px 24px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                   <Package size={16} style={{ color: 'var(--neon-green)' }} />
                                </div>
                                <div>
                                   <div style={{ fontSize: 13, fontWeight: 950, color: '#fff' }}>{product.name}</div>
                                   <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)' }}>{product.category.toUpperCase()}</div>
                                </div>
                             </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 16, fontWeight: 950, color: product.stock <= product.minStock ? '#ff4d4d' : '#fff' }}>{product.stock}</span>
                                {product.stock <= product.minStock && <AlertCircle size={14} style={{ color: '#ff4d4d' }} />}
                             </div>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: 12, color:'rgba(255,255,255,0.3)', fontWeight: 800 }}>{product.minStock}</td>
                          <td style={{ padding: '16px 24px', fontSize: 12, fontWeight: 900 }}>${product.buyPrice.toLocaleString()}</td>
                          <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 950, color: 'var(--neon-green)' }}>${product.sellPrice.toLocaleString()}</td>
                          <td style={{ padding: '16px 24px' }}>
                             <div style={{ fontSize: 13, fontWeight: 950, color: '#00E5FF' }}>+${(product.sellPrice - product.buyPrice).toLocaleString()}</div>
                             <div style={{ fontSize: 8, color: 'rgba(0,229,255,0.5)', fontWeight: 800 }}>MARGEN NETA</div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                             <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => { setEditingProduct(product); setProductForm({...product}); setShowProductModal(true); }} style={{ background:'rgba(255,255,255,0.05)', border:'none', borderRadius:6, padding:8, cursor:'pointer', color:'#fff' }}><Edit3 size={14}/></button>
                                <button onClick={() => deleteProduct(product.id)} style={{ background:'rgba(255,77,77,0.1)', border:'none', borderRadius:6, padding:8, cursor:'pointer', color:'#ff4d4d' }}><X size={14}/></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      <div className="glass-card" style={{ padding: 20, background: 'rgba(255,214,0,0.05)', border: '1px solid #FFD60020' }}>
         <div style={{ display:'flex', gap:15, alignItems:'center' }}>
            <AlertCircle size={20} style={{ color: '#FFD600' }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
               <span style={{ color: '#FFD600', fontWeight: 950 }}>PROTOCOLO_OMNI_STOCK:</span> El inventario se sincroniza en tiempo real con la recepción (POS) y el libro mayor. Cada venta de suplemento decrementa automáticamente el stock y registra la utilidad neta.
            </p>
         </div>
      </div>



      {/* ══ MODAL DE PRODUCTO ══ */}
      {showProductModal && (
        <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center' }}>
           <div className="glass-card" style={{ width:450, padding:32, border:'1px solid var(--neon-green)30' }}>
              <h3 style={{ fontSize:18, fontWeight:950, marginBottom:24 }}>{editingProduct ? 'EDITAR PRODUCTO' : 'NUEVO ITEM DE STOCK'}</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                 <div>
                    <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>NOMBRE DEL PRODUCTO</label>
                    <input className="input-field" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:12, borderRadius:12 }} />
                 </div>
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                       <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>CATEGORÍA</label>
                       <select className="input-field" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as any})} style={{ width:'100%', background:'rgba(255,255,255,0.03)', color:'#fff', padding:14, borderRadius:12 }}>
                          <option value="supplements">Suplementos</option>
                          <option value="drinks">Bebidas</option>
                          <option value="snacks">Snacks</option>
                          <option value="apparel">Ropa/Accesorios</option>
                       </select>
                    </div>
                    <div>
                       <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>STOCK ACTUAL</label>
                       <input type="number" className="input-field" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} style={{ width:'100%', padding:12, borderRadius:12 }} />
                    </div>
                 </div>
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                       <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>PRECIO COMPRA ($)</label>
                       <input type="number" className="input-field" value={productForm.buyPrice} onChange={e => setProductForm({...productForm, buyPrice: Number(e.target.value)})} style={{ width:'100%', padding:12, borderRadius:12 }} />
                    </div>
                    <div>
                       <label style={{ fontSize:9, fontWeight:950, color:'var(--text-muted)', marginBottom:4, display:'block' }}>PRECIO VENTA ($)</label>
                       <input type="number" className="input-field" value={productForm.sellPrice} onChange={e => setProductForm({...productForm, sellPrice: Number(e.target.value)})} style={{ width:'100%', padding:12, borderRadius:12, color:'var(--neon-green)', fontWeight:950 }} />
                    </div>
                 </div>
                 <div style={{ display:'flex', gap:10, marginTop:10 }}>
                    <button onClick={() => setShowProductModal(false)} style={{ flex:1, padding:14, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'none', color:'#fff', fontWeight:950, cursor:'pointer' }}>CANCELAR</button>
                    <button onClick={() => {
                        if (editingProduct) updateProduct(editingProduct.id, productForm);
                        else addProduct(productForm);
                        setShowProductModal(false);
                    }} style={{ flex:1, padding:14, borderRadius:12, background:'var(--neon-green)', border:'none', color:'#000', fontWeight:950, cursor:'pointer' }}>GUARDAR_ITEM</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
