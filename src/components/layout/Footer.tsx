export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Fila 1: Contacto */}
        <div className="py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Atención comercial</h3>
          <div className="text-sm text-gray-600">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <a
                href="mailto:comercial@edicionesurano.com"
                className="hover:text-[#5B7C99] hover:underline transition-colors"
              >
                comercial@edicionesurano.com
              </a>
              <span className="hidden md:inline">|</span>
              <a
                href="tel:+541112345678"
                className="hover:text-[#5B7C99] hover:underline transition-colors"
              >
                Tel: +54 11 1234-5678
              </a>
              <span className="hidden md:inline">|</span>
              <span className="md:inline">Lunes a Viernes 9:00 a 18:00 hs</span>
            </div>
          </div>
        </div>

        {/* Fila 2: Legal + Copyright */}
        <div className="py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <a href="/ayuda" className="hover:text-gray-700 hover:underline transition-colors">
              Ayuda
            </a>
            <span>|</span>
            <a href="/terminos" className="hover:text-gray-700 hover:underline transition-colors">
              Términos y condiciones
            </a>
          </div>

          <div className="text-center md:text-right">
            © {currentYear} Ediciones Urano. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

