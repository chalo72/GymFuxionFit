# 🛡️ Recursos Protegidos (Zona Segura Antigravity)

Este archivo registra los módulos y archivos que han alcanzado un estado de estabilidad y diseño aprobado por el usuario. **PROHIBIDO** realizar cambios totales o sobreescrituras completas en estos archivos sin autorización explícita.

## 🧱 Archivos Bajo Bloqueo Fortaleza (LOCKED)

- [x] `src/pages/Reception.tsx` - Interfaz híbrida v3.8 aprobada. Ediciones futuras deben ser INCREMENTALES.
- [x] `src/hooks/useGymData.ts` - Lógica de datos core y sincronización financiera.
- [x] `src/index.css` - Sistema de diseño Glassmorphism y variables de color.
- [x] `src/components/layout/Sidebar.tsx` - Navegación principal.

## 📜 Reglas de Evolución Incremental
1. **No Overwrite**: Prohibido usar `write_to_file` para editar archivos en esta lista. Usar solo `replace_file_content` o `multi_replace_file_content` con bloques mínimos.
2. **Preservación Estética**: Cualquier nueva funcionalidad debe heredar estilos existentes, no redefinirlos.
3. **Validación Previa**: Leer el archivo completo antes de proponer un cambio parcial.
4. **Respeto al Autor**: Mantener los comentarios de arquitectura (OMNI_RECEPTION, etc.) intactos.
