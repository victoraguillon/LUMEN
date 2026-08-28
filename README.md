# LUMEN

Plataforma de la juventud de la parroquia (Juvemar / Llamado de Samuel). App 100% frontend (HTML/CSS/JS) que está siendo migrada de **Firebase RTDB** a **Supabase** (Postgres + Auth + Realtime + Storage) y desplegada en **Vercel**.

## Arquitectura objetivo

- **Frontend:** estático (sin build), servido por Vercel.
- **Base de datos:** Supabase PostgreSQL, con **RLS** (Row Level Security) activado en todas las tablas.
- **Auth:** Supabase Auth (email/contraseña).
- **Realtime:** suscripciones en vivo para intenciones, encuestas, avisos, eventos, recursos y blog.
- **Fotos de perfil:** Supabase Storage (bucket `avatars`), se guarda la URL pública.
- **Emails:** FormSubmit (se mantiene tal cual; no depende de la BD).

## Credenciales

La configuración de conexión vive en `js/supabase.js`:
- Project URL: `https://etioxnigysbxitiaveyp.supabase.co`
- anon/publishable key: `sb_publishable_...`

> La `service_role` key NO se sube a este repo ni al frontend. Solo se usa localmente o en backend.

## Puesta en marcha (una sola vez)

1. **Esquema + RLS + realtime:** ejecuta `schema.sql` en Supabase → SQL Editor.
2. **Storage:** ejecuta `storage.sql` (crea bucket `avatars` + políticas).
3. La base arranca **vacía**: los datos se cargan desde la propia app (registro y creación de
   contenidos), que genera los IDs automáticamente.

## Despliegue en Vercel

- Conectar el repo de GitHub a Vercel (framework: "Other"/static, build: ninguno).
- Los archivos están en la raíz (`index.html`).

## Estructura

```
js/
  supabase.js        # cliente Supabase (reemplaza firebase.js)
  auth.js            # LumenAuth (Supabase Auth)
  data.js            # LumenData (capa de datos + realtime)
  ui.js              # LumenUI + formularios/inscripciones
  views/             # cada vista (intenciones, encuestas, blog, gestion, perfil, ...)
schema.sql           # tablas + enums + trigger + RLS + realtime
storage.sql          # bucket avatars + políticas
```
