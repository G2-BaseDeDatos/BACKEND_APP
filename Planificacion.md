# UNIVERSIDAD TÉCNICA DE AMBATO

## Facultad de Ingeniería en Sistemas, Electrónica e Industrial

### Carrera de Software

---

# PLAN DE TRABAJO – FASE 5 (Versión Final Ajustada)

## Construcción de API REST con Node.js y Oracle

### Sistema GITT – Gestión de Inventario Tecnológico

_Cobertura completa de las 13 tablas, transacciones y control de acceso por roles_

**Ciclo:** Enero 2026 – Julio 2026
**Asignatura:** Base de Datos | **Docente:** Ing. José Caiza, Mg.
**Equipo:** Morales Aigaje Matias Benjamin, Ango Andrango Cristian Alonso, Cevallos Goyes Melany Saleth, Miranda Tarupi Luis Sebastian

---

## 1. Objetivo de la Fase

Construir una API REST segura, con arquitectura MVC y orientación a objetos, usando Node.js + Express sobre Oracle Database. La API expondrá endpoints para las 13 tablas del sistema GITT, garantizará la integridad de las transacciones y controlará el acceso según el rol del usuario (Administrador, Docente, Estudiante).

---

## 2. Stack Tecnológico

**Backend**

- Runtime: Node.js
- Framework: Express.js
- Conexión a Oracle: `oracledb` (pool de conexiones)
- Validación de datos: `express-validator`
- Variables de entorno: `dotenv`
- CORS: `cors`
- (Futuro) Autenticación: `jsonwebtoken`, `bcryptjs`

**Base de Datos**

- Motor: Oracle Database XE
- Conexión: `localhost:1521/XE`, Usuario: `PROYECTOBD`
- Las 13 tablas ya creadas con triggers y secuencias para PK.

**Frontend (Fase 6)**

- React.js + Axios

---

## 3. Roles del Sistema y Permisos (Control de Acceso)

Se definen tres roles, alineados con la tabla `ROLES` de la base de datos. Inicialmente la API funcionará sin autenticación, pero se diseñará para que, cuando se integre JWT, se pueda proteger cada endpoint con estos permisos.

| Rol               | Permisos                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Administrador** | Acceso total: CRUD en todas las tablas. Puede crear usuarios, asignar roles, gestionar departamentos, categorías, ubicaciones, artículos, préstamos, mantenimientos, movimientos, notificaciones, imágenes y consultar auditorías.                                                                                                         |
| **Docente**       | Puede consultar el inventario (artículos, ubicaciones, categorías). Puede crear préstamos (solicitar equipos), devolverlos, ver sus préstamos activos e historial. Puede registrar mantenimientos y movimientos solo sobre los artículos que tiene asignados o bajo su responsabilidad. No puede modificar catálogos maestros ni usuarios. |
| **Estudiante**    | Puede consultar el inventario (ver artículos disponibles, ubicaciones). Puede crear préstamos (solicitar equipos) y devolverlos. No puede modificar nada más.                                                                                                                                                                              |

**Nota para la implementación actual:** Dado que JWT se añadirá en la siguiente fase, se implementará un middleware provisional que reciba un `rol` por query string o header para simular la autorización y validar que las rutas “protegidas” devuelvan 403 si el rol no es suficiente. Esto facilitará la transición a JWT sin cambiar el core.

---

## 4. Módulos de la API – Cobertura de las 13 Tablas

Cada tabla Oracle tiene su módulo correspondiente. La siguiente tabla muestra las operaciones y el rol mínimo requerido para cada una (A=Admin, D=Docente, E=Estudiante).

| #   | Módulo             | Tabla Oracle        | Endpoints y roles permitidos                                                                                              |
| --- | ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Artículos          | ARTICULOS           | GET (todos, por ID, por estado) → A,D,E. POST, PUT, DELETE → solo A.                                                      |
| 2   | Usuarios           | USUARIOS            | GET (todos, por ID) → A,D. POST, PUT, DELETE → solo A.                                                                    |
| 3   | Préstamos          | PRESTAMOS + DETALLE | GET (todos, activos, por ID) → A,D,E (cada uno ve sus propios préstamos; A ve todos). POST → A,D,E. PUT devolver → A,D,E. |
| 4   | Categorías         | CATEGORIAS          | GET → todos. POST, PUT, DELETE → solo A.                                                                                  |
| 5   | Departamentos      | DEPARTAMENTOS       | GET → todos. POST, PUT, DELETE → solo A.                                                                                  |
| 6   | Ubicaciones        | UBICACIONES         | GET (todas, por departamento) → todos. POST, PUT, DELETE → solo A.                                                        |
| 7   | Mantenimientos     | MANTENIMIENTOS      | GET (todos, por artículo) → A,D. POST → A,D (para artículos bajo su responsabilidad).                                     |
| 8   | Movimientos        | MOVIMIENTOS         | GET (todos, por artículo) → A,D. POST → solo A.                                                                           |
| 9   | Notificaciones     | NOTIFICACIONES      | GET (todas, por préstamo) → A,D (solo sus préstamos). PUT marcar enviada → A.                                             |
| 10  | Imágenes Artículos | IMAGENES_ART        | GET por artículo → todos. POST → A,D. DELETE → A.                                                                         |
| 11  | Roles              | ROLES               | GET → A,D. POST, PUT → solo A.                                                                                            |
| 12  | Detalle Préstamos  | (interno)           | Se gestiona automáticamente al crear/devolver un préstamo. No tiene endpoints externos.                                   |
| 13  | Auditoría          | AUDITORIAS          | GET (todas, por usuario) → solo A.                                                                                        |

**Observación:** El módulo de préstamos incluye la lógica de `DETALLE_PRESTAMOS` de forma interna; el cliente no necesita llamar a un endpoint separado para el detalle.

---

## 5. Transacciones y Manejo de IDs generados por Trigger

- **Generación de PK:** Los INSERT de todos los modelos **nunca incluirán la columna ID**. El trigger de cada tabla la asigna automáticamente. El método `create` del modelo devolverá el nuevo ID, obtenido mediante una consulta a `seq_xxxx.CURRVAL` inmediatamente después del INSERT.
- **Transacciones:** Las operaciones que modifican varias tablas (crear préstamo, devolver, registrar mantenimiento, etc.) se ejecutarán dentro de una transacción explícita usando `connection.execute()` con `autoCommit: false`, llamando a `commit()` si todo es exitoso o `rollback()` en caso de error. La conexión se obtiene del pool y se libera en el `finally`.

Ejemplo de flujo en el modelo de Préstamos:

1. Obtener conexión (`pool.getConnection()`).
2. Iniciar transacción (`autoCommit: false`).
3. Verificar que los artículos estén disponibles (si alguno no, lanzar error y `rollback`).
4. Insertar cabecera en `PRESTAMOS`.
5. Obtener `ID_PRE` con `seq_prestamos.CURRVAL`.
6. Insertar cada artículo en `DETALLE_PRESTAMOS`.
7. Actualizar el estado de cada artículo a `'Prestado'`.
8. `commit()`.
9. Retornar el ID generado.
10. Liberar conexión en `finally`.

Esto garantiza la atomicidad y las reglas de negocio.

---

## 6. Endpoints Detallados (con Roles Mínimos)

### Roles → `/api/roles`

| Método | Ruta           | Rol mínimo    | Descripción              |
| ------ | -------------- | ------------- | ------------------------ |
| GET    | /api/roles     | Docente       | Listar todos los roles   |
| GET    | /api/roles/:id | Docente       | Obtener rol por ID       |
| POST   | /api/roles     | Administrador | Crear nuevo rol          |
| PUT    | /api/roles/:id | Administrador | Actualizar nombre de rol |

### Categorías → `/api/categorias`

| Método | Ruta                | Rol mínimo    | Descripción                 |
| ------ | ------------------- | ------------- | --------------------------- |
| GET    | /api/categorias     | Todos         | Listar todas las categorías |
| GET    | /api/categorias/:id | Todos         | Obtener categoría por ID    |
| POST   | /api/categorias     | Administrador | Crear nueva categoría       |
| PUT    | /api/categorias/:id | Administrador | Actualizar categoría        |
| DELETE | /api/categorias/:id | Administrador | Eliminar categoría          |

### Departamentos → `/api/departamentos`

| Método | Ruta                   | Rol mínimo    | Descripción                    |
| ------ | ---------------------- | ------------- | ------------------------------ |
| GET    | /api/departamentos     | Todos         | Listar todos los departamentos |
| GET    | /api/departamentos/:id | Todos         | Obtener departamento por ID    |
| POST   | /api/departamentos     | Administrador | Crear nuevo departamento       |
| PUT    | /api/departamentos/:id | Administrador | Actualizar departamento        |
| DELETE | /api/departamentos/:id | Administrador | Eliminar departamento          |

### Ubicaciones → `/api/ubicaciones`

| Método | Ruta                                 | Rol mínimo    | Descripción                    |
| ------ | ------------------------------------ | ------------- | ------------------------------ |
| GET    | /api/ubicaciones                     | Todos         | Listar todas las ubicaciones   |
| GET    | /api/ubicaciones/:id                 | Todos         | Obtener ubicación por ID       |
| GET    | /api/ubicaciones/departamento/:idDep | Todos         | Ubicaciones de un departamento |
| POST   | /api/ubicaciones                     | Administrador | Crear nueva ubicación          |
| PUT    | /api/ubicaciones/:id                 | Administrador | Actualizar ubicación           |
| DELETE | /api/ubicaciones/:id                 | Administrador | Eliminar ubicación             |

### Usuarios → `/api/usuarios`

| Método | Ruta              | Rol mínimo    | Descripción                                                        |
| ------ | ----------------- | ------------- | ------------------------------------------------------------------ |
| GET    | /api/usuarios     | Docente       | Listar todos los usuarios (Admin ve todos, Docente ve info básica) |
| GET    | /api/usuarios/:id | Docente       | Obtener usuario por ID                                             |
| POST   | /api/usuarios     | Administrador | Crear nuevo usuario (incluye asignar rol)                          |
| PUT    | /api/usuarios/:id | Administrador | Actualizar usuario                                                 |
| DELETE | /api/usuarios/:id | Administrador | Eliminar usuario (inactivo lógico)                                 |

### Artículos → `/api/articulos`

| Método | Ruta                       | Rol mínimo    | Descripción                                                                           |
| ------ | -------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| GET    | /api/articulos             | Todos         | Listar todos los artículos (con filtros: ?categoria=&estado=&ubicacion=&responsable=) |
| GET    | /api/articulos/:id         | Todos         | Obtener artículo por ID (incluye URLs de imágenes)                                    |
| GET    | /api/articulos/estado/:est | Todos         | Filtrar por estado                                                                    |
| POST   | /api/articulos             | Administrador | Registrar nuevo artículo                                                              |
| PUT    | /api/articulos/:id         | Administrador | Actualizar artículo                                                                   |
| DELETE | /api/articulos/:id         | Administrador | Dar de baja (cambiar estado)                                                          |

### Imágenes → `/api/imagenes`

| Método | Ruta                       | Rol mínimo    | Descripción                  |
| ------ | -------------------------- | ------------- | ---------------------------- |
| GET    | /api/imagenes/articulo/:id | Todos         | Imágenes de un artículo      |
| POST   | /api/imagenes              | Docente       | Agregar imagen a un artículo |
| DELETE | /api/imagenes/:id          | Administrador | Eliminar imagen              |

### Préstamos → `/api/prestamos`

| Método | Ruta                        | Rol mínimo                       | Descripción                                                     |
| ------ | --------------------------- | -------------------------------- | --------------------------------------------------------------- |
| GET    | /api/prestamos              | Docente (propios), Admin (todos) | Listar préstamos según rol (con filtros ?estado=)               |
| GET    | /api/prestamos/activos      | Todos (propios)                  | Solo préstamos activos del usuario autenticado / todos si Admin |
| GET    | /api/prestamos/:id          | Docente (si propio)              | Obtener préstamo con su detalle                                 |
| POST   | /api/prestamos              | Estudiante                       | Crear préstamo (con lista de artículos). Usa transacción.       |
| PUT    | /api/prestamos/:id/devolver | Dueño del préstamo               | Devolver: cierra préstamo y libera artículos. Transacción.      |

**Lógica de negocio en POST:**

- Validar que todos los artículos existan y estén “Disponibles”. Si alguno ya está prestado, devolver 409.
- Insertar cabecera y detalle dentro de transacción, cambiar estados a “Prestado”.
- Registrar automáticamente en auditoría (insert en AUDITORIAS) la acción “Préstamo creado por ID_USU”.

**Lógica de negocio en PUT devolver:**

- Cambiar `EST_PRE` a “Cerrado”, `EST_ART` de cada artículo a “Disponible”. Transacción.
- Registrar movimiento o auditoría si se desea.

### Mantenimientos → `/api/mantenimientos`

| Método | Ruta                             | Rol mínimo | Descripción                                                                 |
| ------ | -------------------------------- | ---------- | --------------------------------------------------------------------------- |
| GET    | /api/mantenimientos              | Docente    | Listar todos (Admin ve todos, Docente los de sus artículos)                 |
| GET    | /api/mantenimientos/articulo/:id | Docente    | Mantenimientos de un artículo                                               |
| POST   | /api/mantenimientos              | Docente    | Registrar mantenimiento (actualiza EST_ART a “Mantenimiento”). Transacción. |

**Regla:** Solo un docente asignado al artículo (ID_USU) puede registrar mantenimiento; el Admin puede sobre cualquier artículo.

### Movimientos → `/api/movimientos`

| Método | Ruta                          | Rol mínimo    | Descripción                                                   |
| ------ | ----------------------------- | ------------- | ------------------------------------------------------------- |
| GET    | /api/movimientos              | Docente       | Listar todos los movimientos                                  |
| GET    | /api/movimientos/articulo/:id | Docente       | Movimientos de un artículo                                    |
| POST   | /api/movimientos              | Administrador | Registrar traslado (cambia ID_UBI del artículo). Transacción. |

### Notificaciones → `/api/notificaciones`

| Método | Ruta                             | Rol mínimo    | Descripción                               |
| ------ | -------------------------------- | ------------- | ----------------------------------------- |
| GET    | /api/notificaciones              | Docente       | Ver sus notificaciones (según préstamos)  |
| GET    | /api/notificaciones/prestamo/:id | Docente       | Notificaciones de un préstamo             |
| PUT    | /api/notificaciones/:id          | Administrador | Marcar como enviada (EST_NOT = “Enviado”) |

### Auditorías → `/api/auditorias`

| Método | Ruta                        | Rol mínimo    | Descripción                 |
| ------ | --------------------------- | ------------- | --------------------------- |
| GET    | /api/auditorias             | Administrador | Listar todas las auditorías |
| GET    | /api/auditorias/usuario/:id | Administrador | Auditorías de un usuario    |

---

## 7. Arquitectura y Estructura de Archivos

Se conserva la carpeta `src/` con:
src/
├── Config/
│ └── db.js # Pool de conexiones (oracledb.createPool) y utilidad getConnection
├── Models/ # Clases con métodos SQL, uno por tabla
├── Controllers/ # Orquestan petición/respuesta
├── Routes/ # Definición de rutas
├── Middlewares/
│ ├── errorHandler.js # Manejo centralizado
│ └── roleAuth.js # Middleware provisional para control de roles (espera X-Role en header)
├── Utils/
│ └── responseHelper.js # Formato { success, data, message }
├── app.js # Configura Express, carga rutas, middlewares
└── server.js # Inicia el servidor

text

**Flujo de una petición con control de rol:**  
Cliente → Route → `roleAuth(rolesPermitidos)` → Controller → Model → Oracle → Controller → responseHelper → Cliente

---

## 8. Formato de Respuesta Estándar

Todas las respuestas siguen:

````json
{ "success": true, "data": { ... }, "message": "Operación exitosa" }
En caso de error:

```json
{ "success": false, "data": null, "message": "Mensaje descriptivo del error" }
No se devuelven trazas de error en producción.

9. Manejo de Transacciones y Generación de IDs (Resumen)
Inserción sin ID: Todos los INSERT SQL excluyen la columna ID.

Obtención del nuevo ID: Inmediatamente después del INSERT, se consulta SELECT seq_xxxx.CURRVAL FROM DUAL para retornar el ID generado al cliente.

Transacciones: Se utilizará connection.execute() con autoCommit: false y los métodos commit() / rollback() en un bloque try/catch, con liberación de la conexión en finally.

10. Orden de Desarrollo (Ajustado)

Se respeta la dependencia entre módulos:
Configurar db.js (pool, getConnection, liberación).

Crear responseHelper.js y errorHandler.js.

Middleware roleAuth.js para simular roles.

Modelos de catálogos: Roles, Categorías, Departamentos (solo GET inicialmente, luego CRUD).

Ubicaciones (requiere Departamentos).

Usuarios (requiere Roles).

Artículos (requiere Categorías, Ubicaciones, Usuarios) – incluir JOIN y filtros.

Imágenes Artículos (depende de Artículos).

Préstamos (transaccional – el más complejo).

Mantenimientos (transaccional, con actualización de EST_ART).

Movimientos (transaccional).

Notificaciones (GET + PUT simple).

Auditorías (solo GET).

11. Buenas Prácticas Reforzadas
Single Responsibility: Model solo SQL, Controller solo orquesta, Route solo mapea.

Transacciones: Siempre para operaciones multi-tabla.

Validación: Todos los inputs serán validados con express-validator antes de llegar al controlador.

Manejo de errores: try/catch + errorHandler.js, nunca exponer stack.

Conexiones: Cada operación obtiene una conexión del pool y la libera en finally.

Variables de entorno: Todas las credenciales y configuración sensible en .env (DB_USER, DB_PASSWORD, DB_CONNECT_STRING, PORT).

12. Variables de Entorno Requeridas
text
DB_USER=PROYECTOBD
DB_PASSWORD=tu_password
DB_CONNECT_STRING=localhost:1521/XE
PORT=3000
JWT_SECRET= (para fase posterior)
13. Próximos Pasos
Fase 6: Integración con React, consumo de la API.

Fase 7: Implementación de autenticación JWT real, protección de rutas con roles.

Fase 8: Documentación Swagger/OpenAPI, pruebas.

text
````
