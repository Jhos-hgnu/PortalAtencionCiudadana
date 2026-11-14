# Portal de Atención Ciudadana

Sistema web de quejas ciudadanas: **Portal público** + **Panel de Administración Municipal**.

**Flujo:** Ciudadano → Frontend (React) → API (Express) → Firebase Firestore → API → Panel de Administración.

**Stack:** React + Vite + Tailwind · Node/Express + TypeScript · Firebase Firestore (capa gratuita Spark).

## Desarrollo
```bash
npm run install:all
cp backend/.env.example backend/.env   # completar ADMIN_KEY y credenciales de Firebase
npm run dev:back    # http://localhost:3000
npm run dev:front   # http://localhost:5173 (proxy /api -> 3000)
npm --prefix backend test
```
Sin credenciales de Firebase, en desarrollo el backend usa memoria volátil (avisa en consola). En producción **se niega a arrancar** sin Firebase.

## Estructura de datos (Firestore)
- `quejas/{folio}`: nombre, email?, telefono?, categoria, asunto, descripcion, ubicacion, estado, notaInterna?, tieneFoto, createdAt, updatedAt.
- `fotos/{folio}`: mime, data (bytes). Separada para que los listados no carguen imágenes. Máx. 800 KB (el frontend comprime antes de enviar).
- Folio con formato `QC-XXXXXXXX`. Reglas de seguridad cerradas (`firestore.rules`): solo el backend accede.

## API
Públicas:
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/quejas/meta` | Categorías y estados |
| POST | `/api/quejas` | Registra queja (`multipart/form-data`, campo `foto` opcional) → 201 `{folio}` |
| GET | `/api/quejas/:folio/estado` | Seguimiento (sin datos personales) |

Administración (header `x-admin-key`):
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/verificar` | Valida la clave |
| GET | `/api/admin/resumen` | Indicadores |
| GET | `/api/admin/quejas?estado&categoria&q&page&pageSize` | Listado filtrado |
| GET | `/api/admin/quejas/:folio` | Detalle |
| GET | `/api/admin/quejas/:folio/foto` | Fotografía |
| PATCH | `/api/admin/quejas/:folio/estado` | `{estado, nota?}` |

Errores: JSON `{ error, detalles?: { campo: mensaje } }` con 400 (validación), 401, 404, 413 (foto grande), 429 (límite de peticiones), 503 (admin sin configurar).

## Seguridad
Validación con zod, verificación del tipo real de imagen por bytes, límite de tamaño, `helmet`, límites por IP, comparación de clave en tiempo constante.

## Despliegue (Render)
Variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_KEY`. Ver `render.yaml`.

## Frontend
- `/` Portal ciudadano: formulario validado, fotografía con compresión en el navegador, confirmación con folio y consulta de seguimiento.
- `/admin` Panel municipal: acceso con `ADMIN_KEY`, indicadores, filtros/búsqueda, tabla paginada, detalle con descripción original y fotografía, y cambio de estado.
