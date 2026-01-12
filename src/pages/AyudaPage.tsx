export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Ayuda</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Preguntas frecuentes</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  ¿Cómo hago un pedido?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Podés agregar productos al carrito desde el catálogo o desde las secciones del
                  inicio. Una vez que tengas todos los productos que necesitás, hacé click en "Mi
                  Carrito" en el header y luego en "Enviar pedido". Tu pedido será procesado y
                  recibirás una confirmación.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  ¿Cómo consulto mi cuenta corriente?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  En el header, hacé click en "Cuenta Corriente" para ver tu saldo actual y las
                  últimas facturas. También podés acceder desde el menú principal.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  ¿Cuál es el mínimo de compra?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  No hay mínimo de compra. Podés hacer pedidos de cualquier cantidad de productos.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  ¿Cómo repito un pedido anterior?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  En la sección "Tus Pedidos" del inicio, encontrás tus pedidos recientes. Hacé
                  click en "Repetir pedido" para agregar todos los productos de ese pedido al
                  carrito.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  ¿Qué hago si un producto está agotado?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Si un producto está sin stock, podés hacer click en "🔔 Avisarme" para que te
                  notifiquemos cuando vuelva a estar disponible.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contacto</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:comercial@edicionesurano.com"
                  className="text-[#5B7C99] hover:underline"
                >
                  comercial@edicionesurano.com
                </a>
              </p>
              <p>
                <strong>Teléfono:</strong>{' '}
                <a href="tel:+541112345678" className="text-[#5B7C99] hover:underline">
                  +54 11 1234-5678
                </a>
              </p>
              <p>
                <strong>Horario de atención:</strong> Lunes a Viernes 9:00 a 18:00 hs
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

