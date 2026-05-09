# 📜 OpenSpec SDD — Módulo de Contabilidad

**ID:** SPEC-20260509-001
**Estado:** PROPUESTA
**Autor:** Antigravity (Zen - Arquitecto)

---

## 🔍 1. Context (El Porqué)

El usuario desea separar la lógica de contabilidad de la página de Analíticas. Actualmente, `Analytics.tsx` contiene tanto gráficos de tendencia como balances financieros (Contabilidad Real y Simulación). Mover la contabilidad a su propio módulo mejorará la organización, la legibilidad y permitirá un análisis financiero más profundo sin saturar la vista de analíticas visuales.

---

## 🎯 2. Outcomes (Resultados)

*   **Nuevo Componente**: Creación de `src/pages/Accounting.tsx` para albergar las secciones de Contabilidad.
*   **Refactorización**: Extracción de las secciones "Contabilidad Real" y "Simulación de Ingresos" de `Analytics.tsx` hacia `Accounting.tsx`.
*   **Actualización de Menú**: Adición de la opción "Contabilidad" en `Sidebar.tsx`.
*   **Enrutamiento**: Configuración de la ruta `/accounting` en el sistema de rutas.
*   **Limpieza**: `Analytics.tsx` se mantendrá enfocado en gráficos de tendencias y distribución de planes.

---

## 📈 3. Success Metrics (Métricas de Éxito)

*   **Integridad**: No se pierde ninguna funcionalidad ni dato calculado.
*   **Compilación**: 0 errores de TypeScript tras la separación.
*   **Accesibilidad**: El módulo es accesible desde el menú lateral y responde correctamente.

---

## ✅ 4. Acceptance Criteria (Criterios de Aceptación)

- [ ] Archivo `src/pages/Accounting.tsx` creado y funcional.
- [ ] Tarjetas de "Contabilidad Real" y "Simulación" removidas de `Analytics.tsx`.
- [ ] Tarjetas de "Contabilidad Real" y "Simulación" renderizadas en `Accounting.tsx` con los mismos datos de `useGymData()`.
- [ ] Item "Contabilidad" visible en el `Sidebar.tsx`.
- [ ] Ruta `/accounting` operativa.

---
