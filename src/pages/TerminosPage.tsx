export default function TerminosPage() {
  const lastUpdate = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Términos y condiciones</h1>
        <p className="text-sm text-gray-600 mb-8">Última actualización: {lastUpdate}</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Condiciones generales</h2>
            <p className="mb-3">
              El presente portal B2B es de uso exclusivo para librerías y distribuidores autorizados
              por Ediciones Urano. El acceso está restringido a usuarios con credenciales válidas.
            </p>
            <p>
              Al utilizar este portal, el usuario acepta cumplir con todos los términos y condiciones
              establecidos en este documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Precios y pagos</h2>
            <p className="mb-3">
              Todos los precios están expresados en pesos argentinos (ARS) e incluyen IVA. Los
              precios pueden variar sin previo aviso.
            </p>
            <p>
              Los pagos se realizan mediante cuenta corriente. El límite de crédito y las condiciones
              de pago se establecen según el acuerdo comercial vigente con cada cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Entregas</h2>
            <p className="mb-3">
              Los pedidos se procesan y envían según disponibilidad de stock. Los tiempos de entrega
              pueden variar según la ubicación y el volumen del pedido.
            </p>
            <p>
              Ediciones Urano se reserva el derecho de modificar los tiempos de entrega en caso de
              fuerza mayor o circunstancias excepcionales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Stock y disponibilidad</h2>
            <p className="mb-3">
              La disponibilidad de productos está sujeta a stock. Si un producto no está disponible,
              se notificará al cliente y se ofrecerá la opción de recibir una notificación cuando
              vuelva a estar en stock.
            </p>
            <p>
              Ediciones Urano no garantiza la disponibilidad permanente de todos los productos del
              catálogo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Devoluciones y cambios</h2>
            <p className="mb-3">
              Las devoluciones y cambios se rigen por las políticas comerciales acordadas con cada
              cliente. Para más información, contactar con atención comercial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Privacidad y datos</h2>
            <p className="mb-3">
              Los datos personales y comerciales proporcionados son tratados con confidencialidad y
              utilizados exclusivamente para la gestión de pedidos y cuenta corriente.
            </p>
            <p>
              Ediciones Urano cumple con la Ley de Protección de Datos Personales vigente en
              Argentina.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">7. Modificaciones</h2>
            <p>
              Ediciones Urano se reserva el derecho de modificar estos términos y condiciones en
              cualquier momento. Las modificaciones serán comunicadas a través del portal.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Contacto</h2>
            <p className="mb-2">
              Para consultas sobre estos términos y condiciones, contactar con:
            </p>
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
          </section>
        </div>
      </div>
    </div>
  );
}

