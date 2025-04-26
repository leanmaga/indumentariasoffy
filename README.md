# E-commerce con Next.js, MongoDB y Cloudinary

Este es un e-commerce completo desarrollado con Next.js, MongoDB y Cloudinary, con integración de MercadoPago para procesar pagos.

## Características principales

1. **Página de inicio**: Presentación atractiva con productos destacados y categorías.
2. **Autenticación de usuario**:
   - **Administrador**: Puede acceder a un panel donde gestiona productos, pedidos y usuarios.
   - **Usuarios**: Pueden registrarse para realizar compras.
3. **Carrito de compras**: Permite agregar productos, modificar cantidades y proceder al pago.
4. **Pasarela de pago**: Integración con MercadoPago.
5. **Base de datos**: MongoDB para almacenar información de productos, usuarios y pedidos.
6. **Almacenamiento de imágenes**: Cloudinary para gestionar las imágenes de los productos.

## Tecnologías utilizadas

- **Frontend**: Next.js 14 con App Router, React y Tailwind CSS
- **Backend**: API Routes de Next.js
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: NextAuth.js
- **Gestión de estado**: Zustand
- **Imágenes**: Cloudinary
- **Pagos**: MercadoPago
- **Formularios**: React Hook Form
- **Notificaciones**: React Hot Toast

## Configuración del proyecto

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/tu-usuario/ecommerce-nextjs.git
   cd ecommerce-nextjs
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

   ```
   # MongoDB
   MONGODB_URI=mongodb+srv://tu-usuario:tu-password@tu-cluster.mongodb.net/ecommerce

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=tu-clave-secreta

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=tu-api-key
   CLOUDINARY_API_SECRET=tu-api-secret

   # MercadoPago
   MERCADOPAGO_ACCESS_TOKEN=tu-access-token
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu-public-key
   ```

4. **Inicia el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

5. **Accede a la aplicación**:
   Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

```
e-commerce-app/
├── app/                      # Directorio de la aplicación (App Router)
│   ├── api/                  # Rutas de API
│   ├── auth/                 # Páginas de autenticación
│   ├── admin/                # Panel de administración
│   ├── products/             # Páginas de productos
│   ├── cart/                 # Página del carrito
│   ├── checkout/             # Página de checkout
│   └── contact/              # Página de contacto
├── components/               # Componentes reutilizables
├── lib/                      # Utilidades y lógica de la aplicación
└── models/                   # Modelos de datos para MongoDB
```

## Acceso al panel de administración

Para acceder al panel de administración, debes crear un usuario administrador manualmente en la base de datos o modificar el siguiente código en `app/api/auth/register/route.js` para crear un administrador durante el proceso de registro:

```javascript
// Crear nuevo usuario
const newUser = new User({
  name,
  email,
  password,
  phone,
  role: "admin", // Cambiar 'user' por 'admin'
});
```

Una vez que tengas un usuario con rol de administrador, podrás acceder al panel de administración en [http://localhost:3000/admin](http://localhost:3000/admin).

## Despliegue

Para desplegar la aplicación en producción:

1. **Construye la aplicación**:

   ```bash
   npm run build
   ```

2. **Inicia el servidor de producción**:

   ```bash
   npm start
   ```

3. **Despliegue en plataformas**:
   - Vercel: Conecta tu repositorio de GitHub con Vercel para un despliegue automático.
   - Netlify: Configura tu proyecto para despliegue continuo.
   - Railway/Render/etc.: Sigue las guías específicas de cada plataforma.

## Configuración de MercadoPago

1. Crea una cuenta en [MercadoPago Developers](https://developers.mercadopago.com/)
2. Obtén tus credenciales de prueba/producción
3. Configura las variables de entorno con tus credenciales
4. Para probar los pagos, utiliza las [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/test-cards) proporcionadas por MercadoPago

## Configuración de Cloudinary

1. Crea una cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtén tus credenciales (Cloud Name, API Key, API Secret)
3. Configura las variables de entorno con tus credenciales

## Contribución

Si deseas contribuir a este proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commits (`git commit -m 'Agrega nueva funcionalidad'`)
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

[MIT](LICENSE)
