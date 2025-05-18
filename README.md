# **Documentación del Sistema** 
  
## Información del Producto  
  
**Nombre del Producto:** Lugavi MX  
  
**Descripción:** Plataforma de comercio electrónico para la compra de vestidos de gala y cocktail.  
  
## Integrantes del Equipo  
  
* Barraza Hernández, Henrry Josué  
* Cabanillas Pacheco, María Jose  
* Ortiz Burgueño, Linda Faviola  
* Ortiz Ortiz, Jesús Manuel  
* Pérez Melgoza, Jorge Román  
* Quintero Andrade, Álvaro Gabriel  
* Rivera García, Blanca Angélica  
* Santoyo Terrazas, Nadia Guadalupe  

# **1. Introducción**

**Descripción general:** Lugavi MX es una plataforma de comercio electrónico desarrollada para ofrecer una experiencia de compra de vestidos de gala y cocktail. Representa una solución digital moderna y elegante, orientada a posicionar a la marca a nivel nacional e internacional. El sitio web incluye funcionalidades como catálogo de productos, carrito de compras, sistema de pagos seguros, panel de administración y gestión de pedidos.

**Audiencia:** Clientes finales (compradores), administradores del sitio (empleados de Lugavi MX), equipo de desarrollo y soporte técnico.

**Cobertura o alcance:** El sistema cubre desde el registro e inicio de sesión de usuarios hasta la administración de pedidos, productos, pagos y notificaciones, incluyendo integración con redes sociales y seguimiento de envíos. Soporta operaciones tanto en escritorio como en dispositivos móviles.

# **2. Resumen del Sistema**

**Objetivo general:** Desarrollar un sitio web de comercio electrónico para Lugavi MX que proporcione una experiencia de usuario intuitiva, segura y elegante, incrementando el alcance comercial y fortaleciendo la identidad de la marca.

**Características o funcionalidades principales:**

* Catálogo de vestidos con filtros por talla, precio, categoría y color
* Registro/Login de usuarios
* Carrito de compras con modificación de cantidades y cálculo total
* Procesamiento de pagos mediante tarjeta y PayPal
* Perfil de usuario con historial de pedidos
* Panel administrativo con CRUD de productos, pedidos, usuarios
* Notificaciones automáticas por correo y en pantalla
* Integración con redes sociales para compartir productos

**Arquitectura general del diseño:** Basada en una arquitectura de tres capas:

* Capa de presentación: HTML, CSS, Bootstrap, JavaScript
* Capa de aplicación: Node.js + Express (REST API)
* Capa de datos: MongoDB (NoSQL) con Mongoose

**Diagrama de arquitectura:** (Insertar imagen "diagrama\_arquitectura.png")

# **3. Requisitos**

**Funcionales:** (Ver tabla de requisitos funcionales en la página 7 del documento EQUIPO 2)

**No funcionales:**

* Interfaz responsiva y atractiva
* Seguridad en autenticación y pagos
* Escalabilidad para incluir nuevos módulos
* Alto rendimiento bajo carga concurrente
* Acceso continuo 24/7 desde cualquier dispositivo

**Técnicos:**

* Lenguajes: JavaScript (frontend y backend)
* Frameworks/Librerías: Express.js, Bootstrap, Mongoose, bcryptjs, dotenv
* Base de datos: MongoDB 6.0
* Herramientas: Figma (prototipado), GitHub (control de versiones), VS Code
* Arquitectura del sistema:
    * Modularidad mediante rutas y controladores en Node.js
    * Componentes RESTful: usuarios, artículos, pedidos, pagos
    * Frontend estático y API desacoplada para interoperabilidad

# **4. Instalación**

**Requisitos de software:**

* Node.js (v18 o superior)
* MongoDB local o en Atlas
* Navegador actualizado (Chrome, Firefox)

**Requisitos de hardware:**

* 4GB RAM mínimo
* Procesador 2 GHz
* 1GB de espacio libre

**Pasos detallados para instalación:**

Clonar el repositorio:



git clone https://github.com/tu-usuario/lugavi-mx.git
cd lugavi-mx
Instalar dependencias:



cd backend
npm install
Crear archivo .env y agregar:



MONGO_URI=mongodb://localhost:27017/lugavi
PORT=3000
Iniciar el servidor:



npm start
Abrir en navegador:



frontend/index.html
**Estructura de carpetas:**



lugavi-mx/
├── frontend/
├── backend/
├── docs/
├── .env.example
└── README.md
# **5. Uso del Sistema**

## **Guía detallada para usuarios (Cliente)**

Esta guía explica paso a paso cómo un cliente puede navegar y utilizar todas las funciones esenciales del sistema Lugavi MX:

**Paso 1: Ingresar al sitio web**

Abre el navegador y escribe la URL del sitio web de Lugavi MX. Verás la página de inicio con opciones para iniciar sesión o registrarte.

**Paso 2: Registro de nuevo usuario**

* Haz clic en "Regístrate".
* Completa el formulario con: nombre, correo electrónico, contraseña.
* Verifica que los datos sean correctos y haz clic en “Registrar”.
* Recibirás un correo de confirmación (si aplica).

**Paso 3: Inicio de sesión**

* En la página principal, haz clic en “Iniciar sesión”.
* Introduce tu correo y contraseña.
* Si los datos son correctos, accederás al panel de usuario.

**Paso 4: Navegar por el catálogo**

* Desde el menú superior, selecciona “Catálogo”.
* Filtra los productos por categoría, talla, color o precio.
* Haz clic sobre un producto para ver su ficha detallada.

**Paso 5: Agregar productos al carrito**

* En la ficha del producto, selecciona la talla y cantidad.
* Presiona el botón “Agregar al carrito”.
* Aparecerá una notificación indicando que el producto fue agregado.

**Paso 6: Revisar y modificar el carrito**

* Haz clic en el ícono del carrito (parte superior derecha).
* Verás una lista con todos los productos agregados.
* Puedes cambiar la cantidad o eliminar productos.
* El total se actualiza automáticamente.

**Paso 7: Realizar una compra**

* Desde el carrito, presiona “Proceder al pago”.
* Elige o agrega una dirección de envío.
* Selecciona método de pago (tarjeta o PayPal).
* Confirma la compra.
* Recibirás un mensaje de éxito.

**Paso 8: Consultar tus pedidos**

* En el menú, selecciona “Mis pedidos”.
* Verás un historial con los pedidos realizados, su fecha, estado y total.

**Paso 9: Actualizar tu perfil**

* Haz clic en “Perfil”.
* Desde ahí puedes modificar tus datos personales, cambiar tu contraseña o gestionar direcciones de envío.

**Paso 10: Cerrar sesión**

* Desde el menú superior, haz clic en “Cerrar sesión” para salir del sistema de forma segura.

Esta guía asegura una experiencia clara y accesible para todos los usuarios que interactúan con la tienda en línea de Lugavi MX.

## **Guía detallada para usuarios (Administrador)**

Esta sección describe el flujo de trabajo para el administrador del sistema Lugavi MX, encargado de gestionar productos, pedidos, usuarios y generar reportes.

**Paso 1: Iniciar sesión como administrador**

* Accede al sitio web de Lugavi MX.
* Introduce el correo y contraseña de administrador previamente asignados.
* Serás redirigido al panel administrativo si las credenciales son válidas.

**Paso 2: Acceder al panel de administración**

* Desde el menú, selecciona la opción “Panel de control” o “Administrador”.
* Verás un tablero con accesos rápidos a módulos clave: productos, pedidos, usuarios, estadísticas.

**Paso 3: Gestión de productos**

* Ir a la sección “Artículos” o “Productos”.
* Acciones disponibles:
    * Crear nuevo artículo (vestido): ingresar nombre, descripción, talla, precio, stock, categoría, imagen.
    * Editar artículo existente.
    * Eliminar artículos.
* Filtrar y buscar artículos por nombre o categoría.

**Paso 4: Gestión de pedidos**

* Accede a “Pedidos”.
* Lista de pedidos ordenados por fecha o estado.
* Acciones disponibles:
    * Ver detalles del pedido: cliente, artículos, monto total.
    * Cambiar el estado del pedido (pendiente, enviado, entregado).
    * Añadir comentarios o activar notificaciones al cliente.

**Paso 5: Gestión de usuarios (clientes)**

* Ir a la sección “Clientes”.
* Consultar lista de usuarios registrados.
* Acciones disponibles:
    * Ver historial de pedidos por cliente.
    * Ver/editar información básica del cliente.
    * Suspender cuentas en caso de actividad sospechosa.

**Paso 6: Consultar estadísticas**

* Ir a la sección “Informes” o “Estadísticas”.
* Visualizar gráficas y reportes de:
    * Ventas totales por mes.
    * Productos más vendidos.
    * Usuarios más activos.
    * Estados de pedidos.

**Paso 7: Gestión del inventario**

* Desde “Productos”, verificar stock.
* El sistema puede notificar automáticamente cuando un artículo tiene bajo inventario.

**Paso 8: Cerrar sesión**

* Desde el menú superior, seleccionar “Cerrar sesión” para proteger el acceso administrativo.

Esta guía proporciona al administrador una ruta clara para el uso eficiente del sistema, facilitando la operatividad de la tienda virtual de Lugavi MX.

## **Flujo de procesos:**

Login → Catálogo → Carrito → Pago → Pedido → Confirmación por correo

El flujo de uso para el usuario final dentro del sistema Lugavi MX puede dividirse en dos grandes perfiles: Cliente y Administrador.

**A. Cliente (comprador)**

**Inicio de sesión o registro**

* El usuario accede al sitio web.
* Si ya tiene cuenta: ingresa correo y contraseña.
* Si es nuevo: completa el formulario de registro.

**Exploración del catálogo**

* Navega por la página principal o ingresa al menú "Catálogo".
* Utiliza filtros para buscar por talla, precio, color o categoría.
* Visualiza productos con imagen, descripción, precio y disponibilidad.

**Gestión del carrito de compras**

* Agrega uno o varios productos.
* Visualiza el carrito: puede aumentar/disminuir cantidades o eliminar artículos.
* El sistema actualiza el total en tiempo real.

**Confirmación de pedido**

* Revisa el resumen del carrito.
* Selecciona una dirección de envío (existente o nueva).
* Elige un método de pago: tarjeta o PayPal.

**Pago y finalización**

* Completa los datos necesarios para el pago.
* Confirma la compra.
* Recibe una notificación por correo con el resumen del pedido.

**Seguimiento y perfil**

* Accede a "Mis Pedidos" para revisar el estado de cada orden.
* Desde su perfil puede cambiar contraseñas, actualizar datos o gestionar direcciones.

**B. Administrador (gestión del sistema)**

**Inicio de sesión administrativo**

* Accede con cuenta de administrador (nivel de acceso).

**Gestión de productos**

* CRUD de artículos (agregar, editar, eliminar, actualizar stock).

**Gestión de pedidos**

* Visualiza pedidos recibidos, su estado y detalles.
* Cambia el estado de un pedido: recibido, en proceso, enviado, entregado.
* Envía notificaciones al cliente sobre cambios en su pedido.

**Gestión de usuarios**

* Ver listado de clientes.
* Consultar historial de pedidos por usuario.

**Estadísticas**

* Visualiza informes de ventas, productos más vendidos, comportamiento de usuarios.

## **Capturas de pantalla (del prototipo Figma):**

(Insertar "login.png") Campos de acceso
(Insertar "catalogo.png") Vista con filtros
(Insertar "carrito.png") Lista de productos
(Insertar "pago.png") Formulario de datos de envío y método de pago
(Insertar "perfil.png") Información del usuario

# **6. Base de Datos**

**Modelo de datos:** Implementado en MongoDB con las siguientes colecciones:

* clientes: datos personales, carrito y pedidos
* articulos: productos en venta
* categorias: clasificación de artículos
* pedidos: historial con detalles y estado
* administradores: control de sistema
* pagos: información de transacciones

**Diagrama entidad-relación:** (Insertar "modelo\_datos.png")

**Ejemplo de consultas:**

```javascript
// Obtener pedidos por cliente
Pedido.find({ clienteId: 'ID_CLIENTE' });

// Buscar artículos en stock de cierta categoría
Articulo.find({ categoriaId: 'ID_CATEGORIA', stock: { $gt: 0 } });

// Validar usuario por correo
Cliente.findOne({ correo: 'correo@correo.com' }).then(validarPassword);



