import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y Condiciones de uso de DimeSitio, el servicio para descubrir restaurantes en Valencia.',
}

const sections = [
  {
    title: '1. Aceptación de los términos',
    content: 'Al acceder y utilizar DimeSitio (en adelante, "la Plataforma"), usted acepta quedar vinculado por los presentes Términos y Condiciones. Si no está de acuerdo con alguno de ellos, no debe utilizar la Plataforma. Estos términos se aplican a todos los usuarios, tanto a los que navegan de forma anónima como a los propietarios de restaurantes registrados.',
  },
  {
    title: '2. Descripción del servicio',
    content: 'DimeSitio es una plataforma que permite a los usuarios descubrir restaurantes en Valencia mediante un sistema de preguntas rápidas, y a los propietarios de restaurantes promocionar sus establecimientos y recibir consultas de potenciales clientes. El servicio se presta "tal cual" y "según disponibilidad", sin garantías de disponibilidad continua o libre de errores.',
  },
  {
    title: '3. Registro de restaurantes',
    content: 'Para crear y gestionar un establecimiento en DimeSitio, el usuario debe registrarse y proporcionar información veraz y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. DimeSitio se reserva el derecho de rechazar o cancelar cualquier registro sin necesidad de justificación.',
  },
  {
    title: '4. Suscripciones y pagos',
    content: 'El alta y mantenimiento de un establecimiento en la Plataforma requiere una suscripción de pago. El precio aplicable será el publicado en la web en el momento de la contratación, pudiendo existir distintas tarifas según el tipo de suscripción o promociones vigentes. El pago se procesa a través de Stripe, y al contratar aceptas sus términos de servicio. Las suscripciones se renuevan automáticamente y pueden cancelarse en cualquier momento desde el panel de gestión. DimeSitio se reserva el derecho a modificar los precios con comunicación previa a los usuarios suscritos con al menos 30 días de antelación.',
  },
  {
    title: '5. Cancelaciones',
    content: 'El usuario puede cancelar su suscripción en cualquier momento desde el panel de control. La cancelación será efectiva al final del período de facturación en curso. No se realizarán reembolsos parciales por períodos no consumidos. DimeSitio se reserva el derecho de suspender o cancelar el acceso a la Plataforma si se incumplen estos términos.',
  },
  {
    title: '6. Propiedad intelectual',
    content: 'Todos los contenidos de la Plataforma (logos, textos, imágenes, diseño) son propiedad de Studio Muxa Tech, S.L. o se utilizan con licencia. Los contenidos aportados por los propietarios de restaurantes son de su responsabilidad y garantizan que tienen derecho a publicarlos.',
  },
  {
    title: '7. Limitación de responsabilidad',
    content: 'DimeSitio actúa únicamente como intermediario entre usuarios y restaurantes. No nos hacemos responsables de la calidad del servicio, precisión de la información publicada por los restaurantes, ni de las relaciones que se establezcan entre usuarios y establecimientos. La Plataforma se proporciona sin garantías de ningún tipo, expresas o implícitas.',
  },
  {
    title: '8. Legislación aplicable',
    content: 'Estos Términos y Condiciones se rigen por la legislación española. Para cualquier controversia que pudiera derivarse del uso de la Plataforma, las partes se someten a los juzgados y tribunales de Valencia, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.',
  },
  {
    title: '9. Contacto',
    content: 'Para cualquier consulta sobre estos términos, puede escribirnos a info@muxatech.com o dirigirse a nuestro domicilio social: Duque de Calabria 3, 10, 46005 Valencia, Valencia.',
  },
]

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mb-10 sm:mb-14">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-700">
          Legal
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          Términos y Condiciones
        </h1>
        <p className="mt-3 text-sm text-stone-400 sm:text-base">
          Última actualización: junio de 2026
        </p>
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-stone-600 sm:text-base sm:leading-relaxed">
        <p>
          Bienvenido a DimeSitio. Los siguientes términos regulan el uso de la plataforma y la relación entre
          DimeSitio y sus usuarios. Le recomendamos que los lea detenidamente antes de utilizar nuestros servicios.
        </p>

        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-3 text-lg font-bold text-stone-900 sm:text-xl">
              {s.title}
            </h2>
            <p>{s.content}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
