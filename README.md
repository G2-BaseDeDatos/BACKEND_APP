# 🖥️ GITT – API REST Backend

**Sistema de Gestión de Inventario Tecnológico**  
Universidad Técnica de Ambato · Facultad de Ingeniería en Sistemas  
**Equipo:** Morales · Ango · Cevallos · Miranda

---

## 📋 Tabla de Contenidos

1. [Herramientas a Instalar (Requisitos Previos)](#-herramientas-a-instalar-requisitos-previos)
2. [Configuración de Oracle XE y Base de Datos](#-configuración-de-oracle-xe-y-base-de-datos)
3. [Instalación del Proyecto Paso a Paso](#-instalación-del-proyecto-paso-a-paso)
4. [Variables de Entorno (.env)](#-variables-de-entorno-env)
5. [Ejecutar el Servidor](#-ejecutar-el-servidor)
6. [Autenticación JWT](#-autenticación-jwt)
7. [Endpoints de la API](#-endpoints-de-la-api)
8. [Guía de pruebas en Postman](#-guía-de-pruebas-en-postman)

---

## 📦 Herramientas a Instalar (Requisitos Previos)

Para que esta aplicación funcione correctamente en tu computadora, debes instalar **estrictamente en este orden** los siguientes programas. Asegúrate de reiniciar tu computadora tras instalar Oracle y configurar las variables de entorno.

### 1. Git (Control de versiones)
Necesario para descargar el código del proyecto.
- **Nombre de la herramienta:** Git for Windows
- **Descarga:** https://git-scm.com/download/win
- **Instalación:** Descarga el instalador de 64-bit, ejecútalo y dale a "Next" en todo dejando las opciones por defecto.
- **Verificación:** Abre una terminal (CMD o PowerShell) y escribe `git -v`. Debería mostrar la versión de Git.

### 2. Node.js (Entorno de ejecución para el Backend)
Necesario para correr el código JavaScript del servidor y descargar las dependencias.
- **Nombre de la herramienta:** Node.js (Recomendamos la versión **20.x LTS**)
- **Descarga:** https://nodejs.org/es/ (Selecciona el botón que dice "LTS")
- **Instalación:** Ejecuta el archivo `.msi`, acepta los términos y dale a "Next" hasta finalizar.
- **Verificación:** Abre una terminal nueva y escribe `node -v` (debería salir `v20...` o `v18...`) y luego `npm -v` (debería salir un número como `10...`).

### 3. Oracle Database XE (El Motor de Base de Datos)
Es el programa que guardará toda la información del sistema.
- **Nombre de la herramienta:** Oracle Database 21c Express Edition (o versión 18c XE)
- **Descarga:** https://www.oracle.com/database/technologies/xe-downloads.html
- **Instalación:** 
  1. Descarga el ZIP y extráelo.
  2. Ejecuta el `setup.exe`.
  3. **¡MUY IMPORTANTE!** Durante la instalación, te pedirá que ingreses una contraseña para los usuarios `SYS`, `SYSTEM` y `PDBADMIN`. **Anota esta contraseña y no la olvides**, la necesitarás más adelante.
  4. Finaliza la instalación. El servicio por defecto se llamará `OracleServiceXE` y escuchará en el puerto `1521`.

### 4. Oracle Instant Client 64-bit ⚠️ (CRÍTICO PARA NODE.JS)
Este paso es **obligatorio** para que el backend (`Node.js`) pueda comunicarse con `Oracle`.
- **Nombre de la herramienta:** Oracle Instant Client - Basic Package
- **Descarga:** [Enlace a descargas para Windows x64](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html)
- **Pasos de Instalación y Configuración:**
  1. Descarga el **Basic Package (ZIP)** para Windows x64.
  2. Crea una carpeta en tu disco local C llamada `instantclient` (la ruta debe ser exactamente `C:\instantclient`).
  3. Extrae el contenido del ZIP dentro de esta nueva carpeta. Asegúrate de que el archivo `oci.dll` esté visible en esa carpeta.
  4. Ahora, debes agregar esta carpeta al `PATH` de Windows:
     - Presiona la tecla **Windows** y busca: *"Editar las variables de entorno del sistema"*.
     - Haz clic en el botón **"Variables de entorno..."**.
     - En la sección **"Variables del sistema"** (abajo), busca la variable llamada `Path`, selecciónala y haz clic en **"Editar..."**.
     - Haz clic en **"Nuevo"** y escribe: `C:\instantclient`
     - Haz clic en Aceptar en todas las ventanas.
  5. **Obligatorio:** Cierra todas las terminales y editores de código que tengas abiertos (VS Code, CMD, etc.) para que reconozcan el cambio.

### 5. DBeaver o SQL Developer (Administrador de Base de Datos)
Herramienta visual para ejecutar los scripts SQL y crear las tablas.
- **Nombre de la herramienta:** DBeaver Community Edition (Recomendado)
- **Descarga:** https://dbeaver.io/download/
- **Instalación:** Descarga el "Windows (installer)" y sigue los pasos por defecto.

---

## 🗄️ Configuración de Oracle XE y Base de Datos

Antes de correr el proyecto, debes crear la base de datos y sus tablas.

### Paso 1: Conectarse a la base de datos
1. Abre DBeaver.
2. Crea una nueva conexión seleccionando **Oracle**.
3. En **Host** pon `localhost`. En **Database** o **Service Name** pon `XE`. En **Port** pon `1521`.
4. En **Username** pon `system`.
5. En **Password** pon la contraseña que creaste al instalar Oracle XE.
6. Haz clic en "Finish" o "Test Connection".

### Paso 2: Crear el usuario (esquema) del proyecto
Abre un "SQL Editor" en DBeaver (conectado a `system`) y ejecuta esto, seleccionando todo el texto y presionando el botón de ejecutar:

```sql
-- Crear usuario del proyecto. Si te da error de perfil, asegúrate de ser SYSTEM.
CREATE USER PROYECTOBD IDENTIFIED BY tu_password;
GRANT CONNECT, RESOURCE TO PROYECTOBD;
GRANT CREATE SESSION TO PROYECTOBD;
ALTER USER PROYECTOBD QUOTA UNLIMITED ON USERS;
```
*(Puedes cambiar `tu_password` por una contraseña que prefieras, pero anótala).*

### Paso 3: Crear las tablas del sistema
1. Desconéctate de `system` en DBeaver.
2. Crea una **nueva conexión** en DBeaver a Oracle, pero esta vez usa **Username:** `PROYECTOBD` y **Password:** `tu_password` (el que pusiste en el paso anterior).
3. Abre un nuevo "SQL Editor" con esta nueva conexión.
4. Pega y ejecuta todos los scripts SQL provistos por tu equipo (Creación de tablas, secuencias, triggers e inserción de datos iniciales/catálogos).

---

## 🚀 Instalación del Proyecto Paso a Paso

Una vez que todas las herramientas están instaladas y la base de datos creada, prepara el backend:

### 1. Clonar el código fuente
Abre una terminal nueva (CMD, PowerShell o Git Bash) y ejecuta:
```bash
git clone https://github.com/G2-BaseDeDatos/BACKEND_APP.git
```

### 2. Entrar a la carpeta del proyecto
```bash
cd BACKEND_APP
```

### 3. Instalar las dependencias de Node.js
Ejecuta el siguiente comando para que NPM descargue todas las librerías necesarias (como `express`, `oracledb`, `jsonwebtoken`, etc.):
```bash
npm install
```

---

## 🔐 Variables de Entorno (.env)

El proyecto necesita saber cómo conectarse a TU base de datos local. Esto se hace mediante un archivo oculto llamado `.env`.

1. Abre la carpeta `BACKEND_APP` en **Visual Studio Code**.
2. En la raíz del proyecto (al mismo nivel que `package.json`), crea un archivo nuevo y llámalo exactamente: `.env`
3. Abre el archivo `.env` y pega exactamente lo siguiente:

```env
# Puerto donde correrá el servidor Backend
PORT=3006

# Credenciales de tu Base de Datos Oracle local
DB_USER=PROYECTOBD
DB_PASSWORD=tu_password_aqui
DB_CONNECT_STRING=localhost:1521/XE

# Seguridad JWT (No necesitas cambiar esto para desarrollo local)
JWT_SECRET=super_secreto_para_gitt_app_backend_123
JWT_EXPIRES_IN=8h
```

**⚠️ REVISIÓN CRÍTICA:** Asegúrate de cambiar `tu_password_aqui` por la contraseña que le pusiste al usuario `PROYECTOBD` en el paso 2 de la configuración de base de datos.

---

## ▶️ Ejecutar el Servidor

¡Ya está todo listo! Vamos a prender la aplicación.

1. Asegúrate de estar dentro de la carpeta `BACKEND_APP` en tu terminal.
2. Para prender el servidor en modo desarrollo (se actualiza solo si cambias el código), ejecuta:
   ```bash
   npm run dev
   ```

### Salida esperada al iniciar
Si hiciste todo correctamente (incluyendo lo del Instant Client y la Base de datos), verás esto en la consola:
```
🔧 oracledb Thick mode activado (Instant Client 64-bit).
✅ Pool de conexiones Oracle inicializado.
🚀 Backend GITT corriendo en http://localhost:3006
```

**¿Te sale un error? Posibles soluciones:**
- `NJS-045: cannot load a node-oracledb Thick mode...` 👉 El `PATH` del Instant Client está mal configurado o no reiniciaste la terminal.
- `ORA-12541: TNS:no listener` o `ORA-12154` 👉 El servicio de Oracle XE está apagado. Ve a "Servicios" en Windows, busca `OracleServiceXE` y dale a Iniciar.
- `ORA-01017: invalid username/password` 👉 Escribiste mal `DB_USER` o `DB_PASSWORD` en tu archivo `.env`.

---

## 🔑 Autenticación JWT

La API usa **JWT (JSON Web Token)**. El flujo es:

```
1. POST /api/auth/login  →  recibes un token
2. Copias el token
3. En cada request siguiente añades el header:
   Authorization: Bearer <token>
```

### Configurar Postman para JWT

1. Haz login y copia el `token` de la respuesta.
2. En Postman, ve a la pestaña **Authorization**.
3. Selecciona tipo **Bearer Token**.
4. Pega el token en el campo **Token**.
5. Postman añadirá el header automáticamente en todos los requests.

**Duración del token:** 8 horas. Después debes hacer login nuevamente.

### Roles del sistema

| Rol | Permisos |
|---|---|
| `Administrador` | Acceso total a todos los endpoints |
| `Docente` | Lectura general + préstamos + mantenimientos |
| `Estudiante` | Solo lectura + crear préstamos propios |

---

## 📡 Endpoints de la API

**URL base:** `http://localhost:3006`

---

### 🔓 Auth — `/api/auth` (público, sin token)

#### `POST /api/auth/login`
Inicia sesión y retorna un JWT.

```http
POST http://localhost:3006/api/auth/login
Content-Type: application/json

{
  "cor_usu": "cango@uta.edu.ec",
  "pas_usu": "hash_pwd_1"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id_usu": 1,
      "nom_usu": "Cristian Ango",
      "cor_usu": "cango@uta.edu.ec",
      "rol": "Administrador"
    }
  },
  "message": "Inicio de sesión exitoso"
}
```

---

### 👥 Roles — `/api/roles`
> Requiere rol: **Administrador** o **Docente**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/roles` | Listar todos los roles |
| GET | `/api/roles/:id` | Obtener rol por ID |

**Ejemplo:**
```http
GET http://localhost:3006/api/roles
Authorization: Bearer <token>
```

---

### 🗂️ Categorías — `/api/categorias`
> Requiere rol: **cualquiera**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/categorias` | Listar todas las categorías |
| GET | `/api/categorias/:id` | Obtener categoría por ID |

---

### 🏢 Departamentos — `/api/departamentos`
> Requiere rol: **cualquiera**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/departamentos` | Listar todos los departamentos |
| GET | `/api/departamentos/:id` | Obtener departamento por ID |

---

### 📍 Ubicaciones — `/api/ubicaciones`
> Requiere rol: **cualquiera**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/ubicaciones` | Listar todas las ubicaciones |
| GET | `/api/ubicaciones/:id` | Obtener ubicación por ID |
| GET | `/api/ubicaciones/departamento/:idDep` | Ubicaciones de un departamento |

**Ejemplo con filtro por departamento:**
```http
GET http://localhost:3006/api/ubicaciones/departamento/1
Authorization: Bearer <token>
```

---

### 👤 Usuarios — `/api/usuarios`
> GET: Administrador, Docente · POST/PUT/DELETE: solo **Administrador**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Listar todos los usuarios |
| GET | `/api/usuarios/:id` | Obtener usuario por ID |
| POST | `/api/usuarios` | Crear nuevo usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |

**Body para POST y PUT:**
```json
{
  "id_rol": 1,
  "ced_usu": "1800000001",
  "nom_usu": "Nombre Apellido",
  "cor_usu": "correo@uta.edu.ec",
  "pas_usu": "contraseña123"
}
```

---

### 📦 Artículos — `/api/articulos`
> GET: todos · POST/PUT/DELETE: solo **Administrador**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/articulos` | Listar artículos (con filtros opcionales) |
| GET | `/api/articulos/:id` | Obtener artículo por ID (incluye imágenes) |
| GET | `/api/articulos/estado/:est` | Filtrar por estado |
| POST | `/api/articulos` | Registrar nuevo artículo |
| POST | `/api/articulos/:id/imagen` | Subir una imagen física y enlazarla al artículo |
| PUT | `/api/articulos/:id` | Actualizar artículo |
| DELETE | `/api/articulos/:id` | Dar de baja (cambia estado a "Baja") |

**Filtros disponibles en GET `/api/articulos`:**
```http
GET http://localhost:3006/api/articulos?estado=Disponible
GET http://localhost:3006/api/articulos?categoria=1
GET http://localhost:3006/api/articulos?ubicacion=2
GET http://localhost:3006/api/articulos?responsable=1
```

**Estados válidos para `/estado/:est`:**
- `Disponible`
- `Prestado`
- `Mantenimiento`
- `Baja`

**Body para POST:**
```json
{
  "id_cat": 1,
  "id_ubi": 1,
  "id_usu": 1,
  "cod_art": "PC-001",
  "nom_art": "Laptop Dell Inspiron",
  "est_art": "Disponible",
  "val_art": 850.00
}
```

---

### 🤝 Préstamos — `/api/prestamos`
> GET mis-prestamos: todos · GET/POST/PUT: **Administrador, Docente**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/prestamos/mis-prestamos` | Ver equipos prestados al usuario autenticado |
| GET | `/api/prestamos` | Listado global de todos los préstamos |
| POST | `/api/prestamos` | Crear un préstamo (asigna artículos) |
| PUT | `/api/prestamos/:id/devolucion` | Registrar devolución (libera artículos) |

**Body para POST (Crear Préstamo):**
```json
{
  "id_usu": 1,
  "fsa_pre": "2026-05-10",
  "fpr_pre": "2026-05-15",
  "articulos_ids": [1, 2]
}
```

---

### 🛠️ Mantenimientos — `/api/mantenimientos`
> GET / POST / PUT: **Administrador, Docente**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/mantenimientos` | Listar equipos actualmente en reparación (Mantenimiento) |
| POST | `/api/mantenimientos` | Enviar equipo a reparación (Preventivo/Correctivo) |
| PUT | `/api/mantenimientos/:id/finalizar` | Finalizar reparación y devolver estado a Disponible |

**Body para POST (Enviar a reparación):**
```json
{
  "id_art": 1,
  "tip_man": "Correctivo",
  "fec_man": "2026-05-10",
  "des_man": "Cambio de disco duro por daño físico"
}
```

**Body para PUT (Finalizar reparación):**
```json
{
  "id_art": 1,
  "notas_adicionales": "Se instaló un SSD de 1TB marca Kingston. Costo $50."
}
```

---

### 🔔 Notificaciones — `/api/notificaciones`
> GET / PUT: **Todos (Administrador, Docente, Estudiante)**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/notificaciones/mis-notificaciones` | Listar las notificaciones del usuario logueado (incluye el detalle del préstamo) |
| PUT | `/api/notificaciones/:id/leer` | Marcar una notificación específica como 'Leida' |

---

### ✅ Health Check — sin autenticación

```http
GET http://localhost:3006/health
```

**Respuesta:**
```json
{
  "success": true,
  "data": { "status": "ok", "timestamp": "2026-05-06T..." },
  "message": "API GITT funcionando correctamente"
}
```

---

## 🧪 Guía de pruebas en Postman

### Importar colección rápida

1. Abre Postman → **New Collection** → nombre: `GITT API`
2. Crea una variable de colección:
   - `baseUrl` = `http://localhost:3006`
   - `token` = *(vacío, se llenará al hacer login)*
3. En cada request usa `{{baseUrl}}/api/...`
4. Después del login, copia el token y actualiza la variable `token`.

### Orden de prueba recomendado

```
1. POST  {{baseUrl}}/api/auth/login          ← obtén el token
2. GET   {{baseUrl}}/api/roles               ← verifica catálogos
3. GET   {{baseUrl}}/api/categorias
4. GET   {{baseUrl}}/api/departamentos
5. GET   {{baseUrl}}/api/ubicaciones
6. GET   {{baseUrl}}/api/usuarios
7. GET   {{baseUrl}}/api/articulos
8. GET   {{baseUrl}}/api/articulos/estado/Disponible
9. POST  {{baseUrl}}/api/articulos           ← crea un artículo
10. GET  {{baseUrl}}/api/articulos/1         ← verifica con imágenes
```

### Respuesta estándar de la API

Todos los endpoints retornan el mismo formato:

```json
// Éxito
{ "success": true,  "data": { ... },  "message": "Descripción" }

// Error
{ "success": false, "data": null, "message": "Descripción del error" }
```

### Códigos HTTP comunes

| Código | Significado |
|---|---|
| `200` | OK |
| `201` | Creado correctamente |
| `400` | Error de validación en el body |
| `401` | Sin token o token inválido/expirado |
| `403` | Token válido pero rol sin permiso |
| `404` | Recurso no encontrado |
| `409` | Conflicto (dato duplicado o dependencia) |
| `500` | Error interno del servidor |

---

## 🏗️ Arquitectura del proyecto

```
src/
├── Config/
│   └── db.js               # Pool de conexiones Oracle
├── Models/                 # Lógica SQL (uno por tabla)
│   ├── authModel.js
│   ├── rolModel.js
│   ├── categoriaModel.js
│   ├── departamentoModel.js
│   ├── ubicacionModel.js
│   ├── usuarioModel.js
│   └── articuloModel.js
├── Controllers/            # Orquesta petición → modelo → respuesta
├── Routes/                 # Define URLs y aplica middlewares
├── Middlewares/
│   ├── roleAuth.js         # Verifica JWT y rol
│   └── errorHandler.js     # Captura errores globalmente
├── Utils/
│   └── responseHelper.js   # Formato { success, data, message }
├── app.js                  # Express + middlewares + rutas
└── server.js               # Inicia pool Oracle y levanta servidor
```

**Flujo de una petición:**
```
Cliente → Route → roleAuth(JWT) → Controller → Model → Oracle
       ←        ←               ←            ←       ←
```
