// components/LegalDocuments.js
import { useState } from "react";
import LegalModal from "./LegalModal";

// Contenido completo de los documentos legales
const legalDocuments = {
  terms: {
    title: "Términos y Condiciones de Uso",
    content: `
      <h1 class="text-2xl font-bold mb-6">TÉRMINOS Y CONDICIONES DE USO</h1>
      
      <h2 class="text-xl font-bold mb-4">1. INTRODUCCIÓN</h2>
      <p class="mb-4">Bienvenido a Indumentaria Soffy. Los siguientes términos y condiciones rigen el uso de nuestro sitio web y la compra de productos a través de nuestra plataforma. Al acceder a nuestro sitio web y utilizar nuestros servicios, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice nuestro sitio web.</p>
      
      <h2 class="text-xl font-bold mb-4">2. DEFINICIONES</h2>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-2">"Nosotros", "nuestro", "Soffy", "IndumentariaSoffy" se refiere a nuestra empresa.</li>
        <li class="mb-2">"Sitio web" se refiere a la plataforma en línea de Indumentaria Soffy.</li>
        <li class="mb-2">"Usuario", "usted", "cliente" se refiere a cualquier persona que acceda o utilice nuestro sitio web.</li>
        <li class="mb-2">"Productos" se refiere a los artículos ofrecidos a la venta en nuestro sitio web.</li>
        <li class="mb-2">"Términos" se refiere a estos términos y condiciones.</li>
      </ul>
      
      <h2 class="text-xl font-bold mb-4">3. USO DEL SITIO WEB</h2>
      <h3 class="text-lg font-bold mb-2">3.1. Elegibilidad</h3>
      <p class="mb-4">Para utilizar nuestro sitio web y realizar compras, usted debe tener al menos 18 años de edad o contar con la supervisión de un padre o tutor legal.</p>
      
      <h3 class="text-lg font-bold mb-2">3.2. Cuenta de Usuario</h3>
      <p class="mb-4">Algunos servicios pueden requerir que se registre y cree una cuenta. Usted es responsable de mantener la confidencialidad de su información de cuenta y contraseña, así como de restringir el acceso a su computadora. Usted acepta la responsabilidad de todas las actividades que ocurran bajo su cuenta.</p>
      
      <h3 class="text-lg font-bold mb-2">3.3. Restricción de Venta</h3>
      <p class="mb-4">Indumentaria Soffy es una plataforma exclusivamente para la compra de productos. Los usuarios no están autorizados a vender, revender, distribuir, o comercializar productos a través de nuestro sitio web. Cualquier intento de utilizar nuestra plataforma para tales fines está estrictamente prohibido.</p>
      
      <h3 class="text-lg font-bold mb-2">3.4. Conducta del Usuario</h3>
      <p class="mb-2">Al utilizar nuestro sitio web, usted acepta no:</p>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-2">Utilizar el sitio web de manera fraudulenta o en relación con un delito penal.</li>
        <li class="mb-2">Violar estos términos o cualquier ley o regulación aplicable.</li>
        <li class="mb-2">Enviar contenido abusivo, amenazante, difamatorio, obsceno o de acoso.</li>
        <li class="mb-2">Interferir con el funcionamiento normal del sitio web.</li>
        <li class="mb-2">Intentar vender o comercializar productos a través de nuestra plataforma.</li>
      </ul>
      
      <h2 class="text-xl font-bold mb-4">4. PRODUCTOS Y SERVICIOS</h2>
      <h3 class="text-lg font-bold mb-2">4.1. Disponibilidad de Productos</h3>
      <p class="mb-4">Nos esforzamos por mantener actualizada la información sobre la disponibilidad de productos, pero no garantizamos que todos los productos mostrados estén disponibles en todo momento.</p>
      
      <h3 class="text-lg font-bold mb-2">4.2. Descripción de Productos</h3>
      <p class="mb-4">Hacemos todo lo posible para mostrar con precisión los colores, dimensiones y detalles de nuestros productos. Sin embargo, no podemos garantizar que la visualización de los colores en su dispositivo sea exacta.</p>
      
      <h2 class="text-xl font-bold mb-4">5. PRECIOS Y PAGOS</h2>
      <h3 class="text-lg font-bold mb-2">5.1. Precios</h3>
      <p class="mb-4">Todos los precios se muestran en pesos argentinos (ARS) e incluyen el IVA correspondiente. Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso.</p>
      
      <h3 class="text-lg font-bold mb-2">5.2. Métodos de Pago</h3>
      <p class="mb-4">Aceptamos pagos a través de MercadoPago y en efectivo únicamente en nuestra tienda física. No aceptamos pagos directos con tarjeta de crédito a través de nuestro sitio web.</p>
      
      <h3 class="text-lg font-bold mb-2">5.3. Seguridad en los Pagos</h3>
      <p class="mb-4">Los pagos realizados a través de MercadoPago están sujetos a sus propios términos y condiciones. MercadoPago proporciona protección al comprador según sus políticas vigentes.</p>
      
      <h2 class="text-xl font-bold mb-4">6. ENVÍOS Y ENTREGAS</h2>
      <h3 class="text-lg font-bold mb-2">6.1. Política de Envíos</h3>
      <p class="mb-4">No gestionamos envíos directamente. Los envíos se acuerdan directamente con el vendedor a través de WhatsApp. Los envíos solo se realizan dentro del territorio nacional argentino.</p>
      
      <h3 class="text-lg font-bold mb-2">6.2. Costos de Envío</h3>
      <p class="mb-4">Los costos de envío se determinarán durante la comunicación directa con el vendedor vía WhatsApp y dependerán de la ubicación de entrega.</p>
      
      <h3 class="text-lg font-bold mb-2">6.3. Plazos de Entrega</h3>
      <p class="mb-4">Los plazos de entrega serán acordados directamente con el vendedor. No nos responsabilizamos por retrasos causados por terceros encargados del transporte.</p>
      
      <h2 class="text-xl font-bold mb-4">7. POLÍTICA DE DEVOLUCIONES Y GARANTÍA</h2>
      <h3 class="text-lg font-bold mb-2">7.1. Garantía</h3>
      <p class="mb-4">Todos nuestros productos cuentan con una garantía de 7 días contra defectos de fabricación o desperfectos técnicos.</p>
      
      <h3 class="text-lg font-bold mb-2">7.2. Devoluciones</h3>
      <p class="mb-4">Las devoluciones solo se aceptarán en caso de desperfectos técnicos y dentro del período de garantía de 7 días desde la recepción del producto. Para iniciar un proceso de devolución, debe contactarnos a través de WhatsApp o mediante nuestra sección de contacto.</p>
      
      <h3 class="text-lg font-bold mb-2">7.3. Condiciones para la Devolución</h3>
      <p class="mb-4">El producto debe ser devuelto en su embalaje original, junto con todos los accesorios y documentación. El cliente es responsable de los costos de envío para la devolución del producto.</p>
      
      <h2 class="text-xl font-bold mb-4">8. PROPIEDAD INTELECTUAL</h2>
      <p class="mb-4">Todo el contenido del sitio web, incluyendo, pero no limitado a, textos, gráficos, logotipos, iconos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de Indumentaria Soffy o de sus proveedores de contenido y está protegido por las leyes argentinas e internacionales de propiedad intelectual.</p>
      
      <h2 class="text-xl font-bold mb-4">9. LIMITACIÓN DE RESPONSABILIDAD</h2>
      <p class="mb-4">En la medida permitida por la ley, Indumentaria Soffy no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por cualquier pérdida de beneficios o ingresos, ya sea directa o indirectamente, ni por cualquier pérdida de datos, uso, fondo de comercio u otras pérdidas intangibles.</p>
      
      <h2 class="text-xl font-bold mb-4">10. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h2>
      <p class="mb-4">Estos términos se regirán e interpretarán de acuerdo con las leyes de la República Argentina. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales competentes de la ciudad donde se encuentra nuestra sede principal.</p>
      
      <h2 class="text-xl font-bold mb-4">11. MODIFICACIONES A LOS TÉRMINOS</h2>
      <p class="mb-4">Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web. Es su responsabilidad revisar periódicamente estos términos para estar al tanto de las actualizaciones.</p>
      
      <h2 class="text-xl font-bold mb-4">12. CONTACTO</h2>
      <p class="mb-4">Si tiene alguna pregunta sobre estos términos, puede contactarnos a través de nuestra sección de contacto o directamente por WhatsApp.</p>
      
      <p class="mt-6 text-sm text-gray-500">Última actualización: 12 de mayo de 2025</p>
    `,
  },
  privacy: {
    title: "Política de Privacidad",
    content: `
      <h1 class="text-2xl font-bold mb-6">POLÍTICA DE PRIVACIDAD</h1>
      
      <h2 class="text-xl font-bold mb-4">1. INTRODUCCIÓN</h2>
      <p class="mb-4">En Indumentaria Soffy, nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos su información personal cuando utiliza nuestro sitio web. Al acceder o utilizar nuestro sitio web, usted acepta las prácticas descritas en esta política.</p>
      
      <h2 class="text-xl font-bold mb-4">2. INFORMACIÓN QUE RECOPILAMOS</h2>
      <h3 class="text-lg font-bold mb-2">2.1. Información Personal</h3>
      <p class="mb-2">Podemos recopilar la siguiente información personal:</p>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-1">Nombre y apellido</li>
        <li class="mb-1">Dirección de correo electrónico</li>
        <li class="mb-1">Número de teléfono</li>
        <li class="mb-1">Dirección postal</li>
        <li class="mb-1">Información de pago (procesada a través de MercadoPago)</li>
        <li class="mb-1">Cualquier otra información que usted nos proporcione voluntariamente</li>
      </ul>
      
      <h3 class="text-lg font-bold mb-2">2.2. Información de Uso</h3>
      <p class="mb-4">También recopilamos información sobre cómo interactúa con nuestro sitio web, incluyendo:</p>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-1">Dirección IP</li>
        <li class="mb-1">Tipo de navegador</li>
        <li class="mb-1">Páginas visitadas</li>
        <li class="mb-1">Tiempo de permanencia en el sitio</li>
        <li class="mb-1">Referencias y enlaces de salida</li>
      </ul>
      
      <h3 class="text-lg font-bold mb-2">2.3. Cookies y Tecnologías Similares</h3>
      <p class="mb-4">Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Para más información sobre cómo utilizamos las cookies, consulte nuestra "Configuración de Cookies".</p>
      
      <h2 class="text-xl font-bold mb-4">3. CÓMO UTILIZAMOS SU INFORMACIÓN</h2>
      <p class="mb-2">Utilizamos la información recopilada para:</p>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-1">Procesar y completar sus pedidos</li>
        <li class="mb-1">Comunicarnos con usted sobre su pedido o consulta</li>
        <li class="mb-1">Facilitar la coordinación de envíos a través de WhatsApp</li>
        <li class="mb-1">Mejorar nuestro sitio web y servicios</li>
        <li class="mb-1">Enviar boletines informativos y materiales promocionales (si ha dado su consentimiento)</li>
        <li class="mb-1">Prevenir fraudes y actividades ilegales</li>
        <li class="mb-1">Cumplir con nuestras obligaciones legales</li>
      </ul>
      
      <h2 class="text-xl font-bold mb-4">4. COMPARTICIÓN DE INFORMACIÓN</h2>
      <h3 class="text-lg font-bold mb-2">4.1. Proveedores de Servicios</h3>
      <p class="mb-4">Podemos compartir su información con proveedores de servicios de terceros que nos ayudan a operar nuestro sitio web o a llevar a cabo nuestras actividades comerciales, como:</p>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-1">MercadoPago (para el procesamiento de pagos)</li>
        <li class="mb-1">Servicios de mensajería (para la coordinación de entregas)</li>
        <li class="mb-1">Proveedores de servicios de análisis web</li>
      </ul>
      
      <h3 class="text-lg font-bold mb-2">4.2. Requisitos Legales</h3>
      <p class="mb-4">Podemos divulgar su información personal si estamos obligados a hacerlo por ley o en respuesta a solicitudes válidas de autoridades públicas.</p>
      
      <h3 class="text-lg font-bold mb-2">4.3. Transferencias Comerciales</h3>
      <p class="mb-4">Si Indumentaria Soffy participa en una fusión, adquisición o venta de activos, su información personal puede ser transferida como parte de esa transacción.</p>
      
      <h2 class="text-xl font-bold mb-4">5. SEGURIDAD DE LA INFORMACIÓN</h2>
      <h3 class="text-lg font-bold mb-2">5.1. Medidas de Seguridad</h3>
      <p class="mb-4">Implementamos medidas de seguridad diseñadas para proteger su información personal contra el acceso, la alteración, la divulgación o la destrucción no autorizados. Sin embargo, ninguna transmisión de datos por Internet o sistema de almacenamiento electrónico puede garantizarse como 100% seguro.</p>
      
      <h3 class="text-lg font-bold mb-2">5.2. Almacenamiento de Datos</h3>
      <p class="mb-4">Todos los datos personales recopilados a través de nuestro sitio web son almacenados en MongoDB, una base de datos no relacional que implementa medidas de seguridad robustas. El acceso a esta base de datos está estrictamente controlado y limitado a personal autorizado. Realizamos copias de seguridad regulares para garantizar la integridad de sus datos.</p>
      
      <h2 class="text-xl font-bold mb-4">6. SUS DERECHOS</h2>
      <p class="mb-4">De acuerdo con la Ley de Protección de Datos Personales de Argentina (Ley 25.326), usted tiene derecho a:</p>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-1">Acceder a su información personal</li>
        <li class="mb-1">Rectificar información inexacta</li>
        <li class="mb-1">Solicitar la eliminación de su información</li>
        <li class="mb-1">Oponerse al tratamiento de sus datos</li>
        <li class="mb-1">Presentar una reclamación ante la autoridad de control</li>
      </ul>
      
      <p class="mb-4">Para ejercer estos derechos, contáctenos a través de nuestra sección de contacto.</p>
      
      <h2 class="text-xl font-bold mb-4">7. RETENCIÓN DE DATOS</h2>
      <p class="mb-4">Conservaremos su información personal solo durante el tiempo necesario para cumplir con los fines para los que la recopilamos, incluyendo el cumplimiento de requisitos legales, contables o de informes.</p>
      
      <h2 class="text-xl font-bold mb-4">8. MENORES DE EDAD</h2>
      <p class="mb-4">Nuestro sitio web no está dirigido a personas menores de 18 años. No recopilamos a sabiendas información personal de menores de 18 años. Si usted es padre o tutor y cree que su hijo nos ha proporcionado información personal, contáctenos y tomaremos medidas para eliminar esa información.</p>
      
      <h2 class="text-xl font-bold mb-4">9. ENLACES A SITIOS DE TERCEROS</h2>
      <p class="mb-4">Nuestro sitio web puede contener enlaces a sitios web de terceros. No tenemos control sobre el contenido y las prácticas de privacidad de esos sitios y no nos hacemos responsables de ellos. Le recomendamos revisar las políticas de privacidad de cualquier sitio que visite.</p>
      
      <h2 class="text-xl font-bold mb-4">10. CAMBIOS A ESTA POLÍTICA</h2>
      <p class="mb-4">Nos reservamos el derecho de modificar esta política en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web. Le recomendamos revisar periódicamente esta política para estar al tanto de cualquier cambio.</p>
      
      <h2 class="text-xl font-bold mb-4">11. CONTACTO</h2>
      <p class="mb-4">Si tiene preguntas o inquietudes sobre esta Política de Privacidad, puede contactarnos a través de nuestra sección de contacto.</p>
      
      <p class="mt-6 text-sm text-gray-500">Última actualización: 12 de mayo de 2025</p>
    `,
  },
  cookies: {
    title: "Configuración de Cookies",
    content: `
      <h1 class="text-2xl font-bold mb-6">CONFIGURACIÓN DE COOKIES</h1>
      
      <h2 class="text-xl font-bold mb-4">1. ¿QUÉ SON LAS COOKIES?</h2>
      <p class="mb-4">Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (computadora, teléfono móvil o tablet) cuando visita un sitio web. Las cookies ayudan a los sitios web a recordar sus preferencias y a entender cómo los usuarios navegan e interactúan con los sitios.</p>
      
      <h2 class="text-xl font-bold mb-4">2. TIPOS DE COOKIES QUE UTILIZAMOS</h2>
      <h3 class="text-lg font-bold mb-2">2.1. Cookies Esenciales</h3>
      <p class="mb-4">Estas cookies son necesarias para el funcionamiento básico de nuestro sitio web. Le permiten navegar por el sitio y utilizar sus funciones, como acceder a áreas seguras. Sin estas cookies, no podríamos proporcionar los servicios que usted solicita.</p>
      
      <h3 class="text-lg font-bold mb-2">2.2. Cookies de Preferencias</h3>
      <p class="mb-4">Estas cookies permiten que nuestro sitio web recuerde información que cambia la forma en que el sitio se comporta o se ve, como su idioma preferido o la región en la que se encuentra.</p>
      
      <h3 class="text-lg font-bold mb-2">2.3. Cookies Analíticas</h3>
      <p class="mb-4">Utilizamos cookies analíticas para recopilar información sobre cómo los visitantes utilizan nuestro sitio web. Estas cookies nos ayudan a mejorar nuestro sitio, por ejemplo, asegurando que los usuarios encuentren fácilmente lo que buscan.</p>
      
      <h3 class="text-lg font-bold mb-2">2.4. Cookies de Marketing</h3>
      <p class="mb-4">Estas cookies se utilizan para rastrear a los visitantes en los sitios web. La intención es mostrar anuncios relevantes y atractivos para el usuario individual, y por tanto, más valiosos para los editores y anunciantes terceros.</p>
      
      <h3 class="text-lg font-bold mb-2">2.5. Cookies de Redes Sociales</h3>
      <p class="mb-4">Estas cookies están establecidas por una serie de servicios de redes sociales que hemos añadido al sitio para permitirle compartir nuestro contenido con sus amigos y redes. Son capaces de rastrear su navegador a través de otros sitios y crear un perfil de sus intereses.</p>
      
      <h2 class="text-xl font-bold mb-4">3. COOKIES DE TERCEROS</h2>
      <p class="mb-4">Algunos de nuestros socios, como MercadoPago, pueden establecer cookies en su dispositivo cuando visita nuestro sitio web. Estas cookies permiten que estos terceros recopilen información para sus propios propósitos, como rastrear el rendimiento de sus servicios o personalizar sus ofertas.</p>
      
      <h2 class="text-xl font-bold mb-4">4. GESTIÓN DE COOKIES</h2>
      <p class="mb-4">La mayoría de los navegadores web permiten cierto control de la mayoría de las cookies a través de la configuración del navegador. Para saber más sobre las cookies y cómo gestionarlas o eliminarlas, visite <a href="http://www.allaboutcookies.org" class="text-indigo-500 hover:text-indigo-600" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.</p>
      
      <h3 class="text-lg font-bold mb-2">4.1. Cómo Deshabilitar las Cookies</h3>
      <p class="mb-4">Puede rechazar, aceptar o eliminar cookies de nuestro sitio web en cualquier momento modificando la configuración de su navegador. Para hacerlo, siga las instrucciones proporcionadas por su navegador (generalmente ubicadas en las opciones de "ayuda", "herramientas" o "editar").</p>
      
      <p class="mb-4">Tenga en cuenta que si elige deshabilitar las cookies, es posible que no pueda acceder a ciertas áreas de nuestro sitio web o que algunas de sus funciones no estén disponibles o no funcionen correctamente.</p>
      
      <h3 class="text-lg font-bold mb-2">4.2. Opciones Específicas del Navegador</h3>
      <p class="mb-4">A continuación, se muestra cómo puede gestionar las cookies en los navegadores más populares:</p>
      <ul class="mb-4 list-disc pl-5">
        <li class="mb-1"><strong>Google Chrome</strong>: Configuración > Privacidad y seguridad > Cookies y otros datos del sitio</li>
        <li class="mb-1"><strong>Firefox</strong>: Opciones > Privacidad & Seguridad > Cookies y datos del sitio</li>
        <li class="mb-1"><strong>Safari</strong>: Preferencias > Privacidad</li>
        <li class="mb-1"><strong>Internet Explorer / Microsoft Edge</strong>: Configuración > Privacidad, búsqueda y servicios > Cookies</li>
      </ul>
      
      <div class="mt-8 mb-8">
        <h3 class="text-lg font-bold mb-3">Sus preferencias de cookies</h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between border p-4 rounded">
            <div>
              <h4 class="font-bold">Cookies Esenciales</h4>
              <p class="text-sm text-gray-600">Necesarias para el funcionamiento del sitio web</p>
            </div>
            <div class="text-gray-400">Siempre activas</div>
          </div>
          
          <div class="flex items-center justify-between border p-4 rounded">
            <div>
              <h4 class="font-bold">Cookies Analíticas</h4>
              <p class="text-sm text-gray-600">Nos ayudan a mejorar nuestro sitio web</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" class="sr-only peer" checked>
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between border p-4 rounded">
            <div>
              <h4 class="font-bold">Cookies de Marketing</h4>
              <p class="text-sm text-gray-600">Utilizadas para mostrar anuncios relevantes</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-4">
          <button class="px-4 py-2 border border-indigo-500 text-indigo-500 rounded hover:bg-gray-100">Rechazar todo</button>
          <button class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Guardar preferencias</button>
        </div>
      </div>
      
      <h2 class="text-xl font-bold mb-4">5. COOKIES UTILIZADAS EN NUESTRO SITIO WEB</h2>
      <p class="mb-4">A continuación se presenta una lista de las principales cookies que utilizamos en nuestro sitio web:</p>
      
      <table class="min-w-full border-collapse mb-6">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">Nombre de la Cookie</th>
            <th class="border p-2 text-left">Tipo</th>
            <th class="border p-2 text-left">Propósito</th>
            <th class="border p-2 text-left">Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2">sessionId</td>
            <td class="border p-2">Esencial</td>
            <td class="border p-2">Mantiene su sesión activa durante la navegación</td>
            <td class="border p-2">Sesión</td>
          </tr>
          <tr>
            <td class="border p-2">language</td>
            <td class="border p-2">Preferencia</td>
            <td class="border p-2">Almacena su preferencia de idioma</td>
            <td class="border p-2">1 año</td>
          </tr>
          <tr>
            <td class="border p-2">_ga</td>
            <td class="border p-2">Analítica</td>
            <td class="border p-2">Utilizada por Google Analytics para distinguir usuarios</td>
            <td class="border p-2">2 años</td>
          </tr>
          <tr>
            <td class="border p-2">_gid</td>
            <td class="border p-2">Analítica</td>
            <td class="border p-2">Utilizada por Google Analytics para distinguir usuarios</td>
            <td class="border p-2">24 horas</td>
          </tr>
          <tr>
            <td class="border p-2">mp_*</td>
            <td class="border p-2">Terceros</td>
            <td class="border p-2">Cookies de MercadoPago para procesar pagos</td>
            <td class="border p-2">Varía</td>
          </tr>
        </tbody>
      </table>
      
      <h2 class="text-xl font-bold mb-4">6. CAMBIOS EN NUESTRA POLÍTICA DE COOKIES</h2>
      <p class="mb-4">Nos reservamos el derecho de modificar esta política de cookies en cualquier momento. Cualquier cambio en nuestra política de cookies se publicará en esta página y, si los cambios son significativos, se le proporcionará un aviso más destacado.</p>
      
      <h2 class="text-xl font-bold mb-4">7. CONTACTO</h2>
      <p class="mb-4">Si tiene alguna pregunta sobre nuestra política de cookies, puede contactarnos a través de nuestra sección de contacto.</p>
      
      <p class="mt-6 text-sm text-gray-500">Última actualización: 12 de mayo de 2025</p>
    `,
  },
};

// Componente principal para gestionar documentos legales
const LegalDocuments = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({
    title: "",
    content: "",
  });

  // Función para abrir modal con el documento seleccionado
  const openDocument = (docType) => {
    if (legalDocuments[docType]) {
      setCurrentDocument({
        title: legalDocuments[docType].title,
        content: legalDocuments[docType].content,
      });
      setModalOpen(true);
    }
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {/* Modal para mostrar documentos legales */}
      <LegalModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={currentDocument.title}
        content={currentDocument.content}
      />
    </>
  );
};

// Exportar funciones para abrir documentos desde otros componentes
export const openLegalDocument = (
  setModalOpen,
  setCurrentDocument,
  docType
) => {
  if (legalDocuments[docType]) {
    setCurrentDocument({
      title: legalDocuments[docType].title,
      content: legalDocuments[docType].content,
    });
    setModalOpen(true);
  }
};

export { legalDocuments };
export default LegalDocuments;
