# 📑 NEXUS SYSTEM MANIFEST — GymFuxionFit
> **Versión del Sistema**: v6.5.0 (CRITICAL-DEPLOY)
> **Última Actualización**: 2026-05-05 11:40
> **Estado General**: 🔴 CRITICAL MODE — Forcing Vercel Synchronization

---

## 🚨 MODO CRÍTICO ACTIVADO (v6.5.0)
- **Causa**: Vercel no refleja los cambios realizados en local.
- **Acción**: Incremento de versión forzado y creación de script de rescate de Git.
- **Protocolo**: `RESCATE_VERCEL_YA.bat` desplegado para ejecución manual.

## 🏗️ ARQUITECTURA TÉCNICA
- **Frontend**: React 19 + TypeScript + Vite.
- **Estética**: High-End Glassmorphism (Green/Black/Gray).
- **Base de Datos**: Híbrida Elite (Firebase Primario + Appwrite Shadow).
- **Modo Rescate**: LocalFallbackAdapter (Sin dependencia de Supabase).
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
- ✅ **Trio Sync Engine (v6.2.0)**: Resolución definitiva de desincronización mediante migración a arquitectura Firebase/Appwrite.
- ✅ **Paridad de Esquema ID/id**: El adaptador ahora es inmune a discrepancias de mayúsculas en la UI y triple inyección de ID (id, ID, $id).
- ✅ **Isolation Shield (dbGuardian)**: Bloqueo automático de acceso a producción desde entorno local (v6.1.0).
- ✅ **Migración Elite v6.2.0**: Firebase establecido como Fuente de Verdad Primaria. Appwrite activado como motor de respaldo Shadow. Supabase desactivado del flujo crítico por inconsistencias.
- ✅ **Modo Crítico v6.2.1**: Implementado protocolo Cache Slayer (unregister Service Worker) y cierre de alerta persistente vía sessionStorage.
- ✅ **Fix Estructural SyncAlert**: Añadido botón de cierre y auto-ocultado (12s).
- ✅ **UUID Enforced**: Todas las entidades ahora generan UUIDs vía `crypto.randomUUID()`.
- ✅ **Advanced Critical v6.2.2**: Implementado "Silenciar y Bypass" para errores de Supabase. El sistema ahora permite ignorar alertas de nube para mantener operatividad 100% local.
- ✅ **Blindaje de ID en Supabase**: Inyección agresiva de columna `ID` en `SupabaseAdapter` para resolver `NULL VALUE` constraint.
- ✅ **Supabase Decommissioned v6.3.0**: Eliminación total del motor Supabase del flujo de la aplicación. El sistema ahora es más ligero y silencioso.
- ✅ **TypeScript Strict Guardian**: Incorporada regla estricta de validación (no `implicit any`, no variables duplicadas/no usadas). Todas las ediciones futuras en Vercel deben pasar `tsc -b` sin excepciones.
- ✅ **Despliegue Maestro**: Creado `1_NUBE_VERCEL.bat` que unifica despliegues y bloquea PUSH si TypeScript detecta fallas locales, evitando builds fallidos en Vercel.
- ✅ **Resolución de Errores Vercel**: Eliminados 25 errores de compilación críticos que bloqueaban la publicación (Tipados `any` en `map/filter`, importaciones/propiedades duplicadas).
- ✅ **LocalFallbackAdapter**: Nuevo motor de seguridad que evita que la app se rompa si no hay llaves de nube configuradas.
- ✅ **Metodología Élite (4 Pilares)**: Digitalización completa de los procesos maestros FuxionFit.
  - **Pilar 1 (Bio-Mecánica)**: Wizard de evaluación funcional integrado en Onboarding (Tobillo, Cadera, Bracing).
  - **Pilar 2 (Periodización)**: Módulo Elite Planner con control de Volumen, Intensidad RPE/RIR y Frecuencia.
  - **Pilar 3 (Selección Inteligente)**: Categorización de 85+ ejercicios por patrones de movimiento (Push, Pull, Hinge, Squat, Carry).
  - **Pilar 4 (Recuperación y Estrés)**: Módulo Elite Recovery para gestión de Carga Alostática, Sueño y Nutrición.
- ✅ **Dashboard Gerencial KPIs**: Panel ejecutivo con radar de salud del negocio, tendencia de utilidad y alertas de stock/cartera.
- ✅ **Evaluación Inicial 360°**: Nuevo Onboarding de 5 pasos para atletas de alto rendimiento.
- ✅ **Elite Logbook v1.0**: Sistema de registro diario con control de **Tempo (3-0-1-0)**, **RPE/RIR**, y comparación de Series/Reps (Objetivo vs Real).
- ✅ **Anamnesis Profunda**: Integración de historial clínico, cirugías y descompensaciones posturales en la ficha técnica del atleta.
- ✅ **Gestión de NEAT**: Monitoreo de pasos diarios y actividad no asociada al ejercicio en el perfil de recuperación.
- ✅ **Copiloto de Datos Élite**: Panel de asesoría en tiempo real que guía al entrenador según el contexto del atleta.
  - **Scripts de Comunicación**: Generación de frases sugeridas para ganar confianza técnica ("Cita Cero").
  - **Semáforo de Fatiga Automático**: Alerta visual (Rojo/Verde) basada en racha y descanso.
  - **Guía Técnica de Micro-ciclo**: Recordatorios de ajustes biomecánicos (acetábulo, longitud de fémur) integrados en la vista de sesión.
- ✅ **Inteligencia de Palancas (Lever-Based Logic)**: El copiloto ahora sugiere tipos de sentadilla (Barra Alta/Baja/Frontal) automáticamente al detectar fémures largos o brazos cortos en la Evaluación Inicial.
- ✅ **Alerta de Onboarding Pendiente**: Contador en el sidebar para perfiles que aún no han pasado por la "Cita Cero" (Bio-Mecánica).
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
