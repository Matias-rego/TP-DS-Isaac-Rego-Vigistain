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

 ## /status

- Request: no body
- Response: plain text `ok`

## /auth

### POST /auth/register
- Request:
  - Content-Type: `multipart/form-data`
  - Fields:
    - `username` (string)
    - `email` (string)
    - `password` (string)
    - `foto` (file, opcional)
- Response:
  - `200` o `201`: `{ message: string }`
  - `500`: `{ error: string }`

### POST /auth/login
- Request:
  - Content-Type: `application/json`
  - Body: `{ username: string, password: string }`
- Response:
  - `200`: cookie `access_token`
  - `401`: `{ message: 'Usuario o contraseña incorrectos' }`
  - `403`: `{ message: string }`
  - `500`: `{ message: 'Error en el servidor', error: any }`

### POST /auth/logout
- Request: no body
- Response: `200` `{ message: 'Logout successful' }`

### POST /auth/refresh
- Request: no body
- Response: `200` `{ message: 'Refresh token endpoint not implemented yet' }`

### POST /auth/forgot-password
- Request:
  - Content-Type: `application/json`
  - Body: `{ email: string }`
- Response:
  - `200`: `{ message: 'Correo de recuperación enviado' }`
  - `404`: `{ error: 'Usuario no encontrado' }`
  - `500`: `{ error: 'Error interno del servidor' }`

### POST /auth/reset-password/:token
- Request:
  - Path param: `token` (string)
  - Content-Type: `application/json`
  - Body: `{ password: string }`
- Response:
  - `200`: `{ message: 'Contraseña actualizada correctamente' }`
  - `400`: `{ error: string }`
  - `404`: `{ error: 'Usuario no encontrado' }`

### PUT /auth/validate/:token
- Request:
  - Path param: `token` (string)
  - No body
- Response:
  - `200`: `{ success: true, message: string, usuario: object }`
  - `400`: `{ success: false, message: string }`

### GET /auth/me
- Request: no body
- Response:
  - `200`: `{ id_user, userName, email, rol, urlPicture, status }`
  - `404`: `{ message: 'Usuario no encontrado' }`

## /users

### GET /users
- Request: no body
- Response:
  - `200`: lista de usuarios activos
  - `404`: `{ error: 'No se encontraron usuarios' }`
  - `500`: `{ error: string }`

### POST /users
- Request: body no documentado en el controlador (`createUser` sin implementación)
- Response: depende de implementación futura

### GET /users/search
- Request:
  - Query params opcionales:
    - `q` (string)
    - `rol` (string)
    - `validationStatus` (`true` | `false`)
- Response:
  - `200`: lista de usuarios filtrados
  - `500`: `{ error: string }`

### GET /users/:id
- Request:
  - Path param: `id` (number)
- Response:
  - `200`: usuario completo
  - `404`: `{ error: 'Usuario no encontrado' }`
  - `500`: `{ error: 'Error interno' }`

### PUT /users/:id
- Request:
  - Content-Type: `multipart/form-data`
  - Path param: `id` (number)
  - Fields opcionales:
    - `username` (string)
    - `email` (string)
    - `rol` (string)
    - `validationStatus` (boolean)
    - `foto` (file)
- Response:
  - `200`: `{ user: object, success: string }`
  - `400`: `{ error: 'No hay datos para actualizar' }`
  - `500`: `{ error: 'Error al modificar usuario' }`

### PATCH /users/:id
- Request: igual que PUT /users/:id
- Response: igual que PUT /users/:id

### DELETE /users/:id
- Request:
  - Path param: `id` (number)
- Response: controlador no implementado en `deleteUser`

## /clients

### POST /clients
- Request:
  - Content-Type: `application/json`
  - Body: `{ clientName: string, clientEmail: string, clientPhone: string, Cuit: string }`
- Response:
  - `201`: cliente creado
  - `500`: `{ message: 'Error del servidor' }`

### GET /clients
- Request: no body
- Response:
  - `200`: lista de clientes
  - `500`: `{ error: 'Error al obtener todos los clientes' }`

### GET /clients/search
- Request:
  - Query params opcionales:
    - `q` (string)
    - `categoryClient` (string)
- Response:
  - `200`: lista de clientes filtrados con `category_client`
  - `500`: `{ error: 'Error en el getPartialClient' }`

### GET /clients/:id
- Request:
  - Path param: `id` (number)
- Response:
  - `200`: cliente
  - `500`: `{ error: 'Error al obtener un cliente', errorData: any }`

### PUT /clients/:id
- Request:
  - Content-Type: `application/json`
  - Body opcional: `{ clientName?: string, clientEmail?: string, cuit?: string, clientPhone?: string }`
- Response:
  - `200`: cliente modificado
  - `500`: `{ error: 'Error modificando al cliente' }`

## /client-types

### POST /client-types
- Request:
  - Content-Type: `application/json`
  - Body: `{ categoryClientName: string, amountForCategoryUp: number }`
- Response:
  - `201`: categoría creada
  - `500`: `{ message: 'Error interno del servidor' }`

### GET /client-types
- Request: no body
- Response:
  - `200`: lista de categorías
  - `500`: `{ error: 'Internal server error' }`

### GET /client-types/:description
- Request:
  - Path param: `description` (string)
- Response:
  - `200`: lista de categorías coincidentes
  - `500`: `{ error: 'Internal server error' }`

### DELETE /client-types/:id
- Request:
  - Path param: `id` (number)
- Response:
  - `200`: `{ message: 'Client deleted successfully' }`
  - `500`: `{ error: 'Internal server error' }`

### PUT /client-types/:id
- Request:
  - Content-Type: `application/json`
  - Body opcional: `{ categoryClientName?: string, amountForCategoryUp?: number }`
- Response:
  - `200`: categoría actualizada
  - `500`: `{ error: 'Internal server error' }`

## /failure-types

### GET /failure-types
- Request: no body
- Response:
  - `200`: lista de tipos de falla
  - `404`: `{ message: 'No se encontraron tipos de falla' }`
  - `500`: `{ message: string }`

### GET /failure-types/:query
- Request:
  - Path param: `query` (string)
- Response:
  - `200`: lista de tipos de falla coincidentes
  - `500`: `{ message: string, error?: any }`

### POST /failure-types
- Request:
  - Content-Type: `application/json`
  - Body: `{ failureDescription: string, estimatedImport?: number }`
- Response:
  - `201`: tipo de falla creado
  - `500`: `{ message: string, error?: any }`

### DELETE /failure-types/:id
- Request:
  - Path param: `id` (number)
- Response:
  - `200`: `{ message: 'Tipo de falla eliminado correctamente' }`
  - `409`: `{ message: string }`
  - `500`: `{ message: 'Error al eliminar un tipo de falla' }`

### PUT /failure-types/:id
- Request:
  - Content-Type: `application/json`
  - Path param: `id` (number)
  - Body opcional: `{ failureDescription?: string, estimatedImport?: number }`
- Response:
  - `200`: `{ user: object, success: string }`
  - `500`: `{ error: 'Error al modificar usuario' }`

## /payment-types

### GET /payment-types
- Request: no body
- Response:
  - `200`: lista de tipos de pago
  - `500`: `{ error: string }`

### POST /payment-types
- Request:
  - Content-Type: `application/json`
  - Body: `{ paymentTypeName: string, paymentMethod: string, type_of_payment: string, percentaje: number }`
- Response:
  - `201`: tipo de pago creado
  - `500`: `{ error: 'Error al crear el tipo de pago' }`

### GET /payment-types/:query
- Request:
  - Path param: `query` (string)
- Response:
  - `200`: lista de tipos de pago coincidentes
  - `500`: `{ error: 'Error al obtener los tipos de pago' }`

### DELETE /payment-types/:id
- Request:
  - Path param: `id` (number)
- Response:
  - `200`: tipo de pago eliminado
  - `500`: `{ error: 'Error al eliminar el tipo de pago' }`

### PUT /payment-types/:id
- Request:
  - Content-Type: `application/json`
  - Body opcional: `{ paymentTypeName?: string, paymentMethod?: string, type_of_payment?: string, percentaje?: number }`
- Response:
  - `200`: tipo de pago actualizado
  - `500`: `{ error: 'Error al modificar el tipo de pago' }`

## /equipments

### GET /equipments/search
- Request:
  - Query param: `q` (string)
- Response:
  - `200`: lista de equipos con información de cliente
  - `200`: `[]` si no se recibe `q`
  - `500`: `{ error: 'Error en el getPartialEquipment' }`

### POST /equipments/upload-photo
- Request:
  - Content-Type: `multipart/form-data`
  - File field: `foto`
- Response:
  - `200`: `{ url: string }`
  - `400`: `{ message: 'No se recibió ninguna imagen.' }`
  - `500`: `{ message: string }`

### POST /equipments
- Request:
  - Content-Type: `application/json`
  - Body: `{ tipo_equipment: string, brand: string, model: string, observations?: string, id_client: number }`
- Response:
  - `201`: equipo creado
  - `500`: `{ message: 'Error al registrar el Equipo' }`

## /orders

### GET /orders/ofEquipment/:id
- Request:
  - Path param: `id` (number)
- Response:
  - `200`: lista de órdenes del equipo
  - `400`: `{ message: 'El ID de equipo no es válido' }`
  - `500`: `{ message: 'Error en el getOrderOfEquipment' }`

### POST /orders
- Request:
  - Content-Type: `application/json`
  - Body: `{ id_equipment: number, observations?: string, equipmentPhotoUrl?: string, estimatedDate?: string }`
- Response:
  - `201`: `{ message: 'Orden registrada con éxito', order: object }`
  - `500`: `{ message: 'Error al registrar la orden' }`

## /failures

### POST /failures
- Request:
  - Content-Type: `application/json`
  - Body: array de objetos:
    - `{ id_failure_type: number, failureDescription: string, id_equipment: number }`
- Response:
  - `201`: `{ message: 'Fallas registradas con éxito', count: number }`
  - `400`: `{ message: string, details: string[] }`
  - `500`: `{ message: 'Error al registrar las fallas' }`

### GET /failures/ofEquipment/:id
- Request:
  - Path param: `id` (number)
- Response:
  - `200`: lista de fallas del equipo con `failureType`
  - `400`: `{ message: 'El ID de equipo no es válido' }`
  - `500`: `{ message: 'Error al obtener las fallas de un equipo' }`
```


