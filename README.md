# Sistema de Gestión de Reservas Hoteleras

Este proyecto es una aplicación web frontend desarrollada en **Angular** para la gestión integral de un hotel. Permite administrar huéspedes, habitaciones y reservas de manera eficiente, con un sistema de autenticación y roles de usuario.

##  Características Principales

###  Autenticación y Seguridad
- **Login Seguro**: Autenticación basada en tokens (JWT).
- **Control de Acceso (RBAC)**:  Funcionalidades diferenciadas para administradores (`ADMIN`) y recepcionistas/usuarios (`USER`).
- **Protección de Rutas**: Guardias de navegación para proteger secciones sensibles.

### Gestión de Huéspedes
- Registro completo de información personal (Nombre, Documento, Nacionalidad, Contacto).
- **Validaciones Avanzadas**: Normalización de nacionalidades y prevención de duplicados.
- Edición y eliminación de registros.
- **Flujo Optimizado**: Opción rápida para crear una reserva inmediatamente después de registrar un huésped.

### Gestión de Habitaciones
- Catálogo completo de habitaciones con detalles como:
  - **Tipo**: Sencilla, Doble, Suite, King.
  - **Estado**: Disponible, Ocupada, Limpieza, Mantenimiento.
  - **Capacidad y Precio**: Configuración flexible.
- **Lógica de Negocio**: Restricción de eliminación solo para habitaciones disponibles.
- Formularios inteligentes con selección de tipos seguros.

###  Gestión de Reservas
- **Ciclo de Vida Completo**:
  - Creación de reservas con validación de fechas (evita fechas pasadas o incoherentes).
  - **Check-In**: Cambio de estado a "En Curso".
  - **Check-Out**: Finalización de la estancia y liberación de la habitación.
  - **Cancelación**: Opción administrativa para cancelar reservas confirmadas.
- **Cálculo Automático**: Total a pagar basado en el número de noches y precio de la habitación.
- **Visualización Clara**: Tabla de reservas con indicadores de estado codificados por color.

##  Tecnologías Utilizadas

- **Frontend Framework**: Angular (v16+)
- **Diseño UI**: Bootstrap 5
- **Iconos**: FontAwesome
- **Notificaciones**: SweetAlert2
- **Manejo de Formularios**: Reactive Forms

##  Prerrequisitos

Asegúrate de tener instalado lo siguiente antes de comenzar:
- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

##  Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/GarciaEduardo07/RepositorioFrontendProyectoFinal.git
   cd RepositorioFrontendProyectoFinal
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   ng serve
   ```
   La aplicación estará disponible en `http://localhost:4200/`.

##  Estructura del Proyecto

El código fuente se organiza de manera modular:

- `src/app/components`: Componentes de la interfaz (Login, Dashboard, Huespedes, Habitaciones, Reservas).
- `src/app/services`: Lógica de comunicación con el backend (HTTP calls).
- `src/app/models`: Interfaces TypeScript para tipado estricto de datos.
- `src/app/guards`: Protección de rutas y verificación de roles.

---
Desarrollado con ❤️ por el equipo ex-del-profe 💔. Derechos reservados 2026.
