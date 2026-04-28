# 📑 NEXUS SYSTEM MANIFEST — GymFuxionFit
> **Versión del Sistema**: v6.1.0 (TRIO-SYNC-ENFORCED)
> **Última Actualización**: 2026-04-28 09:10
> **Estado General**: 🟢 PROTECTED — Isolation Shield Activo (dbGuardian)

---

## 🏗️ ARQUITECTURA TÉCNICA
- **Frontend**: React 19 + TypeScript + Vite.
- **Estética**: High-End Glassmorphism (Green/Black/Gray).
- **Base de Datos**: Híbrida (Supabase Cloud + IndexedDB Local).
- **Persistencia**: Protocolo Antigravity de 3 capas (Disco, Git, Cloud).

---

## 📱 MÓDULOS OPERATIVOS

### 1. Módulo de Recepción (Hybrid Hub)
- **Funcionalidad**: Control de acceso en tiempo real y ventas POS Express.
- **Ficha Focus**: Vista detallada de atletas sincronizada.
  - **Detección de Sesión**: Muestra hora de ingreso y cronómetro de entrenamiento.
  - **POS Integrado**: Permite vender suplementos y cobrar servicios sin salir de la ficha.
  - **Selector de Servicios**: Botones directos para Pago Diario, Semanal y Mensualidad.
- **Sincronización Automática**: Al procesar un cobro de membresía, el sistema extiende automáticamente la fecha de vencimiento (`expiryDate`) del atleta y lo activa.

### 2. Gestión de Atletas (CRM)
- **Funcionalidad**: Registro, edición y monitoreo de socios.
- **Estado de Membresía**: Clasificación automática (Activo, Vencido, Deuda).
- **Expediente 360°**: Modal de perfil con datos de contacto y antecedentes.

### 3. Sistema POS & Inventario
- **Catálogo de Productos**: Lista desplegable con categorías (Bebidas, Suplementos).
- **Carrito Maestro**: Agrupación por cantidades, eliminación de ítems y selección de método de pago (Efectivo/Nequi).

---

## 🚀 MEJORAS RECIENTES (Últimos 24h)
- ✅ **Módulo de Crédito (FIAR)**: Nuevo método de pago que carga el total a la deuda del socio automáticamente.
- ✅ **Perfil Fitness Técnico**: Registro de Objetivos (Musculación/Rebajar), Lesiones, Nutrición y Contacto de Emergencia.
- ✅ **Semáforo de Salud**: Indicador visual en el perfil que alerta sobre lesiones del atleta.
- ✅ **Agrupación en Carrito**: Los productos repetidos se suman en una sola línea en lugar de duplicarse.
- ✅ **Botón Maestro de Cobro**: Unificación de la acción de venta con selector de método de pago.
- ✅ **Sincronización de Membresías**: El cobro de mensualidad ahora actualiza la base de datos maestra automáticamente.
- ✅ **Fix Estructural Inventario**: Corregido error de JSX y cierre de componentes en `Inventory.tsx`.
- ✅ **Optimización de Tipado Global**: Actualización de la interfaz `Member` en `useGymData.ts` para soportar objetivos y progreso técnico.
- ✅ **Resolución de Conflictos en TrainerDashboard**: Definición de tipos para sesiones de entrenamiento y corrección de importaciones.
- ✅ **Fix Estructural Recepción**: Reparada lógica de apertura de tarjeta de cliente para miembros en sala y añadida lista de sugerencias de búsqueda faltante.
- ✅ **Trio Sync Engine (v6.1.0)**: Resolución definitiva de desincronización mediante canales globales y triple escritura Supabase/Firebase/Local.
- ✅ **Paridad de Esquema ID/id**: El adaptador ahora es inmune a discrepancias de mayúsculas en las columnas de la base de datos.
- ✅ **Isolation Shield (dbGuardian)**: Bloqueo automático de acceso a producción desde entorno local (v6.1.0).

---

## 🚧 DEUDA TÉCNICA & ERRORES CONOCIDOS
- ⚠️ **Código Muerto**: Se detectó lógica duplicada en `usePriceControl.ts` que debe ser purgada.
- ⚠️ **Validación de Stock**: El POS actualmente permite vender sin restar de un inventario numérico (pendiente conexión de stock real).
- ❓ **Reporte Z**: Falta dashboard de cierre de caja para ventas realizadas específicamente desde Recepción.

---

## 🔒 PROTOCOLOS ACTIVOS
- **Fortress Lockdown**: Archivos críticos (`Reception.tsx`, `useGymData.ts`) protegidos contra edición accidental.
- **Nexus Omni-Persistence**: Auto-commit y persistencia local inmediata.
- **Valla Sintáctica**: Verificación de errores TS/JSX antes de cada guardado.
- **Omni-Doc Protocol**: Este manifiesto se actualiza ante cualquier cambio mínimo.

---

**Antigravity Status**: 🦾 "Evolución constante detectada."
