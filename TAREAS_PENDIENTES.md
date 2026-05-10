# 📋 Tareas Pendientes del Backend (GITT)

Este documento detalla las funcionalidades de negocio que faltan por implementar en la API REST. Ideal para dividir el trabajo entre el equipo (Morales, Ango, Cevallos, Miranda).

---

## 1. 🖼️ Módulo de Imágenes (Subida de Archivos)
Actualmente, el código asume que existe una tabla de imágenes, pero no hay forma de subirlas desde el frontend.
- [x] **Instalar y configurar `multer`**: Configurar el backend para que pueda recibir archivos físicos (`multipart/form-data`).
- [x] **Crear Endpoint de Subida**: Programar `POST /api/articulos/:id/imagen`. Debe guardar la imagen en el servidor (ej. en una carpeta `public/uploads`) y registrar la URL generada en la base de datos (en la tabla `IMAGENES_ART` o directamente en `ARTICULOS`).
- [x] **Corregir Consulta Actual**: Revisar `articuloModel.js` (`findById`) para asegurarse de que la consulta a `IMAGENES_ART` coincida con cómo guardarán finalmente las imágenes, evitando caídas del servidor.

## 2. 🤝 Módulo de Préstamos (Core del Sistema)
Toda la lógica de asignar equipos a usuarios y gestionar sus devoluciones.
- [x] **Crear `prestamoModel.js`**: Consultas SQL para insertar a `PRESTAMOS` y `DETALLE_PRESTAMOS`.
- [x] **Endpoints a crear (`prestamosController.js` y `prestamosRoutes.js`)**:
  - `POST /api/prestamos`: Crear un préstamo. *(Nota: ¡La BD ya cambia el estado del artículo a "Prestado" gracias al trigger `TRG_ACTUALIZAR_ESTADO_ARTICULO`! El backend solo debe insertar el registro)*.
  - `PUT /api/prestamos/:id/devolucion`: Actualizar el `EST_PRE` a 'Devuelto' (el trigger de BD se encarga de liberar los artículos a 'Disponible').
  - `GET /api/prestamos/mis-prestamos`: Para que un Estudiante/Docente vea sus equipos actuales.
  - `GET /api/prestamos`: Listado global de préstamos.
- [x] **Capturar Errores de Triggers**: El backend debe estar preparado para capturar el error `ORA-20001` (cuando un artículo ya está en un préstamo activo según `TRG_ARTICULO_UNICO_PRESTAMO`) y devolver un mensaje amigable `400 Bad Request` al cliente.

## 3. 🛠️ Módulo de Mantenimientos
Para controlar los equipos que entran a reparación.
- [x] **Crear `mantenimientoModel.js`, controller y rutas**:
  - `POST /api/mantenimientos`: Registrar el envío a reparación (debe cambiar el estado del artículo a "Mantenimiento").
  - `PUT /api/mantenimientos/:id/finalizar`: Registrar que el equipo fue reparado (volver artículo a "Disponible") y guardar notas técnicas o costos.
  - `GET /api/mantenimientos`: Listar todos los equipos que actualmente se encuentran en reparación.

## 4. 📝 Módulo de Movimientos (Trazabilidad)
Para tener el "historial de vida" de cada equipo. Esto le da sentido a la tabla de Movimientos, permitiendo saber por cuántas manos ha pasado una laptop antes de dañarse.
- [x] **Crear `movimientoModel.js`**: Consultas para insertar movimientos.
- [x] **Conexión con otros módulos**: Cada vez que se haga un Préstamo, Devolución o Mantenimiento, el backend debe insertar automáticamente un registro en `MOVIMIENTOS`.
- [x] **Endpoint `GET /api/articulos/:id/movimientos`**: Un endpoint para que el Administrador vea la línea de tiempo completa de un equipo.

## 5. 🔔 Módulo de Notificaciones
Darle uso real a la comunicación del sistema para que los usuarios no tengan que adivinar.
- [x] **Crear `notificacionModel.js` y rutas**:
- [x] **Generación Automática**: Cuando un Docente/Administrador apruebe o asigne un préstamo, el backend insertará un registro en `NOTIFICACIONES` dirigido al Estudiante.
- [x] **Endpoint `GET /api/notificaciones/mis-notificaciones`**: Para que el usuario lea sus alertas (ej. "Tienes 1 día para devolver el proyector").
- [x] **Endpoint `PUT /api/notificaciones/:id/leer`**: Para marcar la alerta como leída.

## 6. 🛡️ Módulo de Auditorías (Seguridad)
Obligatorio en sistemas de información serios. Si un Administrador da de baja un equipo costoso, debe quedar un rastro inborrable.
- [ ] **Crear `auditoriaModel.js`**:
- [ ] **Middleware de Auditoría Automática**: Crear un middleware que intercepte peticiones sensibles (como `DELETE /api/articulos/:id` o la creación de usuarios) y guarde automáticamente en `AUDITORIAS` quién lo hizo (ID del usuario), a qué hora, desde qué IP y qué acción realizó.
- [ ] **Endpoint `GET /api/auditorias`**: Solo para uso del Administrador principal.

## 7. 🛡️ Validación de Datos en Backend (Express-Validator)
El backend debe tener las mismas validaciones que configuraste en los `ALTER TABLE` para rechazar datos incorrectos antes de que lleguen a Oracle:
- [x] **Validar Usuarios (`usuariosRoutes.js`)**:
  - `ced_usu`: Debe ser string numérico de exactamente 10 caracteres.
  - `cor_usu`: Debe ser estrictamente de la universidad (`@uta.edu.ec`). Tienen que programar un **custom validator** que verifique la estructura según el rol:
    - **Estudiantes:** `{PrimeraLetraNombre}{Apellido}{Últimos4Cédula}@uta.edu.ec` (Ej: Cristian Ango con cédula 155000**7999** → `cango7999@uta.edu.ec`).
    - **Docentes:** `{PrimeraLetraNombre}{Apellido}@uta.edu.ec` (Ej: Matias Morales → `mmorales@uta.edu.ec`).
  - `nom_usu`: Solo letras y espacios, mínimo 3 caracteres.
  - `pas_usu`: Mínimo 8 caracteres.
- [x] **Validar Artículos (`articulosRoutes.js`)**:
  - `val_art`: Debe ser un número `>= 0` (no negativo).
- [x] **Validar Préstamos (`prestamosRoutes.js`)**:
  - La fecha prevista de retorno (`FPR_PRE`) debe ser estrictamente mayor a la fecha de salida (`FSA_PRE`).

## 6. 🔒 Validación de Roles en Rutas Nuevas
- [x] **Aplicar Middleware `roleAuth`**: Proteger las rutas de Préstamos y Mantenimientos según el rol (Administrador, Docente, Estudiante).
