# 🖥️ GITT – API REST Backend

**Sistema de Gestión de Inventario Tecnológico**  
Universidad Técnica de Ambato · Facultad de Ingeniería en Sistemas  
**Equipo:** Morales · Ango · Cevallos · Miranda

---

## 📋 Tabla de Contenidos

1. [Requisitos previos](#-requisitos-previos)
2. [Configuración de Oracle XE](#-configuración-de-oracle-xe)
3. [Instalación del proyecto](#-instalación-del-proyecto)
4. [Variables de entorno](#-variables-de-entorno)
5. [Ejecutar el servidor](#-ejecutar-el-servidor)
6. [Autenticación JWT](#-autenticación-jwt)
7. [Endpoints de la API](#-endpoints-de-la-api)
8. [Guía de pruebas en Postman](#-guía-de-pruebas-en-postman)

---

## 📦 Requisitos previos

Instala las siguientes herramientas **en este orden**:

### 1. Node.js (v18 o superior)
- Descarga: https://nodejs.org/
- Verifica: `node -v` y `npm -v`

### 2. Oracle Database XE
- Descarga: https://www.oracle.com/database/technologies/xe-downloads.html
- Instala y anota la contraseña de SYSTEM que configures.
- El servicio debe llamarse `OracleServiceXE` y escuchar en el puerto `1521`.

### 3. Oracle Instant Client 64-bit ⚠️ (obligatorio para Node.js)

> Necesario porque `node-oracledb` requiere librerías nativas de 64 bits.

1. Descarga el **Basic Package (ZIP)** para Windows x64:  
   https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html
2. Extrae el ZIP en `C:\instantclient` (la carpeta debe contener `oci.dll`).
3. Agrega `C:\instantclient` a la variable de entorno **PATH** del usuario:
   ```powershell
   [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\instantclient", "User")
   ```
4. Abre una **nueva terminal** para que tome el nuevo PATH.

### 4. DBeaver (opcional, para gestionar la BD)
- Descarga: https://dbeaver.io/download/

---

## 🗄️ Configuración de Oracle XE

### Crear el usuario y la base de datos

Conéctate a Oracle como **SYSTEM** (desde SQL*Plus o DBeaver) y ejecuta:

```sql
-- Crear usuario del proyecto
CREATE USER PROYECTOBD IDENTIFIED BY tu_password;
GRANT CONNECT, RESOURCE TO PROYECTOBD;
GRANT CREATE SESSION TO PROYECTOBD;
ALTER USER PROYECTOBD QUOTA UNLIMITED ON USERS;
```

### Crear las tablas

Con el usuario `PROYECTOBD` conectado, ejecuta los scripts SQL del proyecto para crear las 13 tablas con sus secuencias y triggers.

### Verificar la conexión

```sql
-- Desde SYSTEM: verificar que PROYECTOBD existe
SELECT USERNAME FROM DBA_USERS WHERE USERNAME = 'PROYECTOBD';
```

---

## 🚀 Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/G2-BaseDeDatos/BACKEND_APP.git
cd BACKEND_APP
```

### 2. Instalar dependencias

```bash
npm install
```

Las dependencias principales son:

| Paquete | Versión | Uso |
|---|---|---|
| `express` | ^5.x | Framework web |
| `oracledb` | ^6.x | Driver Oracle |
| `jsonwebtoken` | ^9.x | Autenticación JWT |
| `bcryptjs` | ^2.x | Hash de contraseñas |
| `express-validator` | ^7.x | Validación de inputs |
| `dotenv` | ^17.x | Variables de entorno |
| `cors` | ^2.x | Política de origen cruzado |
| `nodemon` | ^3.x | Auto-recarga en desarrollo |

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz de `BACKEND_APP/` con este contenido:

```env
# Servidor
PORT=3006

# Oracle Database
DB_USER=PROYECTOBD
DB_PASSWORD=tu_password_aqui
DB_CONNECT_STRING=localhost:1521/XE

# JWT
JWT_SECRET=cambia_esto_por_un_secreto_seguro
JWT_EXPIRES_IN=8h
```

> ⚠️ El archivo `.env` está en `.gitignore`. **Nunca lo subas al repositorio.**

---

## ▶️ Ejecutar el servidor

### Modo desarrollo (con auto-recarga)
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

### Salida esperada al iniciar
```
🔧 oracledb Thick mode activado (Instant Client 64-bit).
✅ Pool de conexiones Oracle inicializado.
🚀 Backend GITT corriendo en http://localhost:3006
```

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
