# Documentación del proyecto

Esta carpeta reúne la documentación del sistema de gestión del taller.

## Guías principales

- [Instalación y configuración](05-instalacion/instalacion-configuracion.md)
- [Propuesta del proyecto](02-propuesta/proposal.md)
- [Modelo de datos vigente](02-propuesta/modelo-datos.md)
- [Documentación de la API REST](07-api/api-doc.md)
- [Metodología de trabajo](01-metodologia/metodologia.md)
- [Equipo](01-metodologia/equipo.md)
- [Proceso de desarrollo](01-metodologia/proceso.md)
- [Tracking de features](04-tracking/features.md)
- [Registro de reuniones](03-reuniones/README.MD)

## Estructura

```text
docs/
├── 01-metodologia/
├── 02-propuesta/
├── 03-reuniones/
├── 04-tracking/
├── 05-instalacion/
└── 07-api/
```

La fuente original de la referencia API es [`server/api-doc.md`](../server/api-doc.md); su copia publicada en [07-api/api-doc.md](07-api/api-doc.md) debe mantenerse sincronizada. El schema Prisma es la fuente de verdad para persistencia.
