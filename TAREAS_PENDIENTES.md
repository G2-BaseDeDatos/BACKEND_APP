# 📋 Tareas Pendientes del Backend (GITT)

Este documento detalla las funcionalidades de negocio que faltan por implementar en la API REST. Ideal para dividir el trabajo entre el equipo (Morales, Ango, Cevallos, Miranda).

---

## 1. 🖼️ Módulo de Imágenes (Subida de Archivos)
Actualmente, el código asume que existe una tabla de imágenes, pero no hay forma de subirlas desde el frontend.
- [ ] **Instalar y configurar `multer`**: Configurar el backend para que pueda recibir archivos físicos (`multipart/form-data`).
- [ ] **Crear Endpoint de Subida**: Programar `POST /api/articulos/:id/imagen`. Debe guardar la imagen en el servidor (ej. en una carpeta `public/uploads`) y registrar la URL generada en la base de datos (en la tabla `IMAGENES_ART` o directamente en `ARTICULOS`).
- [ ] **Corregir Consulta Actual**: Revisar `articuloModel.js` (`findById`) para asegurarse de que la consulta a `IMAGENES_ART` coincida con cómo guardarán finalmente las imágenes, evitando caídas del servidor.

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
- [ ] **Crear `mantenimientoModel.js`, controller y rutas**:
  - `POST /api/mantenimientos`: Registrar el envío a reparación (debe cambiar el estado del artículo a "Mantenimiento").
  - `PUT /api/mantenimientos/:id/finalizar`: Registrar que el equipo fue reparado (volver artículo a "Disponible") y guardar notas técnicas o costos.
  - `GET /api/mantenimientos`: Listar todos los equipos que actualmente se encuentran en reparación.

## 4. 📝 Historial / Trazabilidad (Opcional)
- [ ] **Registrar Movimientos**: Programar un trigger o función que registre cada cambio de estado.
- [ ] **Endpoint de Historial**: `GET /api/articulos/:id/historial` para ver la línea de tiempo de un equipo.

## 5. 🛡️ Validación de Datos en Backend (Express-Validator)
El backend debe tener las mismas validaciones que configuraste en los `ALTER TABLE` para rechazar datos incorrectos antes de que lleguen a Oracle:
- [x] **Validar Usuarios (`usuariosRoutes.js`)**:
  - `ced_usu`: Debe ser string numérico de exactamente 10 caracteres.
  - `cor_usu`: Debe ser estrictamente de la universidad (`@uta.edu.ec`). Tienen que programar un **custom validator** que verifique la estructura según el rol:
    - **Estudiantes:** `{PrimeraLetraNombre}{Apellido}{Últimos4Cédula}@uta.edu.ec` (Ej: Cristian Ango con cédula 155000**7999** → `cango7999@uta.edu.ec`).
    - **Docentes:** `{PrimeraLetraNombre}{Apellido}@uta.edu.ec` (Ej: Matias Morales → `mmorales@uta.edu.ec`).
  - `nom_usu`: Solo letras y espacios, mínimo 3 caracteres.
  - `pas_usu`: Mínimo 8 caracteres.
- [ ] **Validar Artículos (`articulosRoutes.js`)**:
  - `val_art`: Debe ser un número `>= 0` (no negativo).
- [x] **Validar Préstamos (`prestamosRoutes.js`)**:
  - La fecha prevista de retorno (`FPR_PRE`) debe ser estrictamente mayor a la fecha de salida (`FSA_PRE`).

## 6. 🔒 Validación de Roles en Rutas Nuevas
- [x] **Aplicar Middleware `roleAuth`**: Proteger las rutas de Préstamos y Mantenimientos según el rol (Administrador, Docente, Estudiante).
