# Documentación de la API REST

Esta API expone los recursos del sistema bajo el prefijo base `/api`.

## Vista en árbol de todos los endpoints

```text
/api
├─/status — verificación de salud de la API (sin auth)
├─/auth
│ ├─POST /register — registrar usuario (sin auth)
│ ├─POST /login — iniciar sesión (sin auth)
│ ├─POST /logout — cerrar sesión (con auth)
│ ├─POST /forgot-password — recuperar contraseña (sin auth)
│ ├─POST /reset-password/:token — restablecer contraseña (sin auth)
│ └─GET /me — obtener usuario autenticado (con auth)
├─/users
│ ├─GET / — listar usuarios (con auth)
│ ├─POST / — crear usuario (con auth)
│ ├─GET /:id — ver usuario (con auth)
│ ├─PUT /:id — actualizar usuario (con auth)
│ ├─PATCH /:id — actualización parcial (con auth)
│ └─DELETE /:id — eliminar usuario (con auth)
├─/failures — módulo montado sin endpoints operativos
├─/clients
│ ├─POST / — crear cliente (con auth)
│ ├─GET / — listar clientes (con auth)
│ ├─GET /:id — ver cliente (con auth)
│ ├─PUT /:id — actualizar cliente (con auth)
│ └─GET /search — buscar clientes (con auth)
├─/payment-types
│ ├─GET / — listar tipos de pago (con auth)
│ ├─POST / — crear tipo de pago (con auth)
│ ├─GET /:query — buscar tipo de pago (con auth)
│ ├─DELETE /:id — eliminar tipo de pago (con auth)
│ └─PUT /:id — actualizar tipo de pago (con auth)
├─/failure-types
│ ├─GET / — listar tipos de falla (con auth)
│ ├─GET /:query — buscar tipo de falla (con auth)
│ ├─POST / — crear tipo de falla (con auth)
│ ├─DELETE /:id — eliminar tipo de falla (con auth)
│ └─PUT /:id_failure_type — actualizar tipo de falla (con auth)
└/client-types
 ├─POST / — crear categoría de cliente (con auth)
 ├─GET / — listar categorías (con auth)
 ├─GET /:description — buscar categoría (con auth)
 ├─DELETE /:id — eliminar categoría (con auth)
 └─PUT /:id — actualizar categoría (con auth)
```
