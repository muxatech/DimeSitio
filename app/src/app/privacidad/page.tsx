import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de Privacidad de DimeSitio. Conoce cómo tratamos tus datos personales.',
}

const sections = [
  {
    title: '1. Responsable del tratamiento',
    content: 'El responsable del tratamiento de sus datos personales es Studio Muxa Tech, S.L. (CIF B16378309), con domicilio en Duque de Calabria 3, 10, 46005 Valencia, Valencia. Puede contactarnos en info@muxatech.com.',
  },
  {
    title: '2. Datos que recogemos',
    content: 'Recogemos los siguientes datos en función del tipo de usuario:\n\n• Usuarios anónimos: identificador de sesión único generado aleatoriamente (no permite identificar a la persona). No se recoge nombre, email ni ningún dato personal.\n• Propietarios de restaurantes: nombre, email, teléfono, dirección del establecimiento, y datos de facturación gestionados a través de Stripe (no almacenamos directamente datos de tarjetas bancarias).\n• Datos de navegación: páginas visitadas, interacciones con la plataforma, tipo de dispositivo y navegador.',
  },
  {
    title: '3. Finalidad del tratamiento',
    content: 'Sus datos se tratan con las siguientes finalidades:\n\n• Prestar el servicio de descubrimiento y promoción de restaurantes.\n• Gestionar suscripciones, facturación y cobros a través de Stripe.\n• Enviar comunicaciones relacionadas con el servicio (alertas de llamadas, notificaciones de actividad).\n• Mejorar la plataforma mediante análisis de uso agregado.\n• Cumplir con obligaciones legales.',
  },
  {
    title: '4. Base legal',
    content: 'El tratamiento de sus datos se basa en:\n\n• La ejecución del contrato de servicios (RGPD art. 6.1.b) para la gestión de la cuenta y suscripción.\n• El consentimiento del usuario (RGPD art. 6.1.a) para comunicaciones de marketing y análisis de navegación.\n• El interés legítimo (RGPD art. 6.1.f) para la mejora del servicio y prevención de fraude.\n• Obligaciones legales (RGPD art. 6.1.c) para el cumplimiento normativo.',
  },
  {
    title: '5. Cesión a terceros',
    content: 'Sus datos pueden ser cedidos a:\n\n• Stripe (Stripe Payments Europe, Ltd.) — para el procesamiento de pagos. Stripe opera bajo estrictas medidas de seguridad y cumple con PCI DSS. Más información en stripe.com/es/privacy.\n• Resend (Resend Inc.) — para el envío de emails transaccionales. Más información en resend.com/legal/privacy-policy.\n• Supabase (Supabase Inc.) — como proveedor de infraestructura de base de datos y autenticación. Más información en supabase.com/privacy.\n\nNo cedemos datos a terceros para fines publicitarios ni vendemos datos personales bajo ninguna circunstancia.',
  },
  {
    title: '6. Derechos del usuario',
    content: 'De acuerdo con el RGPD y la LOPDGDD, usted tiene derecho a:\n\n• Acceder a sus datos personales.\n• Rectificar datos inexactos.\n• Solicitar la supresión de sus datos cuando ya no sean necesarios.\n• Limitar el tratamiento en determinadas circunstancias.\n• Portar sus datos a otro responsable.\n• Oponerse al tratamiento basado en interés legítimo.\n\nPara ejercer sus derechos, envíe un email a info@muxatech.com indicando el derecho que desea ejercer. Le responderemos en un plazo máximo de 30 días.',
  },
  {
    title: '7. Conservación de datos',
    content: 'Conservamos sus datos personales mientras mantenga una cuenta activa en la plataforma. Tras la cancelación de la cuenta, los datos se conservarán durante el período legalmente exigible para el cumplimiento de obligaciones fiscales y contables (generalmente 5 años), y posteriormente serán eliminados de forma segura.',
  },
  {
    title: '8. Cookies',
    content: 'DimeSitio utiliza cookies técnicas necesarias para el funcionamiento de la plataforma (almacenamiento de sesión). No utilizamos cookies de publicidad comportamental ni de terceros para rastreo. Puede configurar su navegador para rechazar las cookies, aunque algunas funcionalidades de la plataforma podrían verse afectadas.',
  },
  {
    title: '9. Modificaciones',
    content: 'Nos reservamos el derecho de modificar la presente Política de Privacidad. Los cambios serán notificados a través de la plataforma o por email a los usuarios registrados. Le recomendamos revisar periódicamente esta página.',
  },
  {
    title: '10. Contacto',
    content: 'Para cualquier consulta sobre privacidad o el ejercicio de sus derechos, puede escribirnos a info@muxatech.com o dirigirse a nuestro domicilio social: Duque de Calabria 3, 10, 46005 Valencia, Valencia.',
  },
]

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mb-10 sm:mb-14">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-700">
          Legal
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          Política de Privacidad
        </h1>
        <p className="mt-3 text-sm text-stone-400 sm:text-base">
          Última actualización: junio de 2026
        </p>
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-stone-600 sm:text-base sm:leading-relaxed">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-3 text-lg font-bold text-stone-900 sm:text-xl">
              {s.title}
            </h2>
            {s.content.split('\n\n').map((p, i) => (
              <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
