import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="text-2xl font-bold font-drop">
              SOFFY
            </Link>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider mb-4 font-drop">
              Compañía
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-300 hover:text-white transition font-drop"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/students"
                  className="text-sm text-gray-300 hover:text-white transition font-drop"
                >
                  Descuento Estudiantes
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-300 hover:text-white transition font-drop"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-300 hover:text-white transition font-drop"
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-300 hover:text-white transition font-drop"
                >
                  Configuración de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider mb-4 font-drop">
              Newsletter
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-300 font-drop">
                  Únete y recibe ofertas exclusivas
                </span>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-300 hover:text-white transition font-drop underline"
                >
                  Suscribirse
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider mb-4 font-drop">
              Soporte
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-300 hover:text-white transition font-drop"
                >
                  Contacto
                </Link>
              </li>

              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-300 hover:text-white transition font-drop"
                >
                  Centro de Ayuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider mb-4 font-drop">
              Síguenos
            </h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <svg
                  fill="currentColor"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>

              <a href="#" className="text-gray-300 hover:text-white transition">
                <svg
                  fill="currentColor"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>

              <a href="#" className="text-gray-300 hover:text-white transition">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-right">
          <p className="text-xs text-gray-400 font-drop">
            © {currentYear} IndumentariaSoffy
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
