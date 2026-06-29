# Cambios de Usabilidad e Integración de Heurísticas en Krono

Este documento resume los cambios realizados en el frontend de Krono para cumplir con las **10 Heurísticas de Usabilidad de Jakob Nielsen** en los módulos de **Turnos y Calendarios**, **Salas de Reunión** y **Marcaje Digital**.

---

## 1. Módulo: Turnos y Calendarios (Roster Grid)

*   **Heurística 1: Visibilidad del Estado del Sistema**
    *   **Implementación**: Se agregó un badge dinámico y vistoso en el encabezado del Roster:
        *   `● BORRADOR (Planificación)` (color amarillo): Indica que el cuadrante se está editando internamente y los cambios no son oficiales.
        *   `● PUBLICADO Y NOTIFICADO` (color esmeralda): Indica que los turnos ya han sido fijados y enviados a los colaboradores.
*   **Heurística 3: Libertad y Control del Usuario**
    *   **Implementación**: Se colocó un botón alternante. Si el roster está en borrador, permite **Publicar y Notificar**. Si ya está publicado, habilita **Revertir a Borrador** para descongelar el cuadrante y hacer correcciones libres.
*   **Heurística 5: Prevención de Errores**
    *   **Implementación**: Si un supervisor intenta hacer clic en una celda para cambiar un turno cuando el roster ya está **Publicado**, el sistema intercepta la acción y abre un modal de advertencia (`CellEditConfirmModal`), obligando a confirmar antes de aplicar cambios retroactivos.
*   **Heurística 8: Diseño Estético y Minimalista**
    *   **Implementación**: Se removió por completo la confusa pestaña independiente de "Publicación", integrando todo el ciclo de vida de los turnos en una sola grilla interactiva (Roster).
*   **Heurística 9: Reconocer y Recuperar Errores**
    *   **Implementación**: Al intentar importar una plantilla Excel (CSV) sobre un roster que ya está publicado, el asistente de previsualización muestra un banner de advertencia naranja informando el impacto.
*   **Heurística 10: Ayuda y Documentación**
    *   **Implementación**: Caja de ayuda que lee dinámicamente el catálogo de turnos (`DF1`, `NOC`, `LIB`, etc.) y muestra sus descripciones debajo de la tabla para que el usuario no tenga que memorizar los códigos.

---

## 2. Módulo: Salas de Reunión y Anti-Ghosting

*   **Heurística 1: Visibilidad del Estado del Sistema**
    *   **Implementación**: Panel superior consolidado con tarjetas de KPI que muestran el conteo total de salas y cuántas están disponibles, reservadas, en uso (check-in) y liberadas por ausencia.
*   **Heurística 3: Libertad y Control del Usuario**
    *   **Implementación**: Se añadió un botón de papelera en cada tarjeta para eliminar salas. Al pulsarlo, no se borra de inmediato; abre un modal que permite cancelar la acción de borrado en caso de clic erróneo.
*   **Heurística 5: Prevención de Errores**
    *   **Implementación**: El formulario para crear salas valida en tiempo real que la capacidad sea mayor a 0 y que el nombre no esté duplicado, desactivando el botón de guardar si hay algún fallo.
*   **Heurística 6: Reconocimiento antes que Recuerdo**
    *   **Implementación**: Botones con "Presets de Relleno Rápido" (Cabina Focus, Sala Scrum, Sala Directiva) que autocompletan el formulario con configuraciones estándar en un clic.
*   **Heurística 7: Flexibilidad y Eficiencia de Uso**
    *   **Implementación**: Barra de búsqueda interactiva por nombre/BSSID y filtros de pestañas rápidos para visualizar solo salas en ciertos estados.

---

## 3. Módulo: Vectores de Marcaje Digital

*   **Heurística 3: Libertad y Control del Usuario**
    *   **Implementación**: Botón de **Detener** para cancelar o reiniciar la simulación del marcaje Zero-Touch (que corre con timeouts asíncronos) en cualquier momento del proceso.
*   **Heurística 5: Prevención de Errores**
    *   **Implementación**: Interruptores de prueba para **Forzar Fallo Wi-Fi** y **Forzar Fallo GPS / Distancia**, educando al usuario sobre las reglas de marcaje mediante fallas simuladas controladas.
*   **Heurística 7: Flexibilidad y Eficiencia de Uso**
    *   **Implementación**: **Marcaje Manual de Emergencia** mediante un PIN OTP de respaldo de 4 dígitos para cuando el smartphone no tenga datos, batería o el lector de código QR esté dañado.
*   **Heurística 9: Reconocer y Recuperar Errores**
    *   **Implementación**: Feedback de diagnóstico detallado y amigable si fallan las balizas (ej. *"SSID de Wi-Fi no corporativa, conéctese a la red 'Krono-Corp'"*).
*   **Heurística 10: Ayuda y Documentación**
    *   **Implementación**: Acordeón desplegable de Preguntas Frecuentes (FAQ) al final de la página que explica conceptos como el *skew* del token de seguridad y el perímetro de la geocerca.

---

## 4. Módulo: Estructura Organizacional y Gestión Multisucursal (ZKTeco Style)

*   **Heurística 1: Visibilidad del Estado del Sistema**
    *   **Implementación**: Sub-navegación de la estructura organizativa en la cabecera mostrando dinámicamente los contadores de Colaboradores, Departamentos y Sucursales en línea.
*   **Heurística 3: Libertad y Control del Usuario**
    *   **Implementación**: Cada sucursal dispone de un botón de eliminación rápida con diálogo modal de confirmación interactivo que previene borrados accidentales y permite cancelar sin consecuencias.
*   **Heurística 5: Prevención de Errores**
    *   **Implementación**: El formulario de creación de sucursales valida en tiempo real la duplicidad de nombres y bloquea el envío si el campo requerido del nombre está vacío.
*   **Heurística 6: Reconocimiento antes que Recuerdo**
    *   **Implementación**: Botones de presets rápidos para pre-rellenar sucursales típicas (Oficina Corporativa, Planta Industrial y Centro de Distribución), incluyendo zonas horarias CIDR estándar y gestores locales.
*   **Heurística 7: Flexibilidad y Eficiencia de Uso (Drill-Down e Interfaz Adaptativa)**
    *   **Implementación**:
        *   **Relación Jerárquica**: Los departamentos pertenecen ahora a una sucursal. En el formulario de alta de departamentos, se selecciona a qué sucursal pertenecen.
        *   **Drill-down de Sucursal**: Al hacer clic en una tarjeta de sucursal, se abre un **Panel Detallado** que despliega la ficha técnica de la sucursal, las terminales biométricas ZKTeco instaladas, sus departamentos enlazados y todos los colaboradores adscritos.
        *   **Filtros Combinados**: Directorio de colaboradores con filtrado conjunto por Sucursal y Departamento.
        *   **Soporte Adaptativo en Todos los Módulos**: Si la empresa tiene solo 1 sucursal configurada, el sistema oculta todos los selectores de sucursal en el Dashboard, Asistencia en Vivo, Roster, Marcaje, Reportes y Salas de Reunión (evitando ruido visual - Heurística 8). Al agregar una segunda sucursal, el modo Multisucursal se activa globalmente de manera transparente.
*   **Heurística 10: Ayuda y Documentación**
    *   **Implementación**: Panel lateral educativo de ayuda multisucursal detallando el uso de zonas horarias para la reconciliación y filtros de IPs CIDR en marcajes móviles.

