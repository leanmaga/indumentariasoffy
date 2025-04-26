const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">IndumentariaSoffy</h3>
            <p className="text-gray-400">
              Tu tienda de confianza para compras en línea. Calidad y servicio
              garantizados.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-white transition"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-gray-400 hover:text-white transition"
                >
                  Productos
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contacto
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white transition"
                >
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products?category=ropa"
                  className="text-gray-400 hover:text-white transition"
                >
                  Ropa
                </a>
              </li>
              <li>
                <a
                  href="/products?category=electronica"
                  className="text-gray-400 hover:text-white transition"
                >
                  Electrónica
                </a>
              </li>
              <li>
                <a
                  href="/products?category=hogar"
                  className="text-gray-400 hover:text-white transition"
                >
                  Hogar
                </a>
              </li>
              <li>
                <a
                  href="/products?featured=true"
                  className="text-gray-400 hover:text-white transition"
                >
                  Ofertas
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Suscríbete</h4>
            <p className="text-gray-400 mb-4">
              Recibe nuestras últimas ofertas y novedades.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Tu correo"
                className="px-4 py-2 rounded-l-lg focus:outline-none text-gray-800 w-full"
              />
              <button
                type="submit"
                className="bg-indigo-600 px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>
            &copy; {currentYear} PatagoniaScript. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
