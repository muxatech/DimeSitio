import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso Legal de DimeSitio, propiedad de Studio Muxa Tech, S.L.',
}

const sections = [
  {
    title: 'Datos del titular',
    content: [
      'Titular: Studio Muxa Tech, S.L.',
      'CIF: B16378309',
      'Domicilio: Duque de Calabria 3, 10, 46005 Valencia, Valencia',
      'Email: info@dimesitio.es',
    ],
  },
  {
    title: 'Propiedad intelectual',
    content: [
      'Todos los derechos de propiedad intelectual sobre los contenidos, diseño, logotipos, imágenes y código fuente de DimeSitio pertenecen a Studio Muxa Tech, S.L. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.',
    ],
  },
  {
    title: 'Condiciones de uso',
    content: [
      'El usuario se obliga a hacer un uso lícito y diligente de la plataforma, absteniéndose de realizar cualquier actuación que pueda dañar, sobrecargar o deteriorar los servicios. El incumplimiento de estas condiciones puede dar lugar a la suspensión del acceso sin previo aviso.',
    ],
  },
  {
    title: 'Exención de responsabilidad',
    content: [
      'Studio Muxa Tech, S.L. no se responsabiliza de los daños o perjuicios derivados de la utilización de la plataforma, ni de la veracidad de la información proporcionada por terceros. El usuario asume toda responsabilidad por el uso que haga del servicio.',
    ],
  },
  {
    title: 'Legislación y jurisdicción',
    content: [
      'Las presentes condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Valencia.',
    ],
  },
]

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mb-10 sm:mb-14">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-700">
          Legal
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          Aviso Legal
        </h1>
        <p className="mt-3 text-sm text-stone-400 sm:text-base">
          En cumplimiento con la Ley de Servicios de la Sociedad de la Información (LSSI)
        </p>
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-stone-600 sm:text-base sm:leading-relaxed">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-3 text-lg font-bold text-stone-900 sm:text-xl">
              {s.title}
            </h2>
            {s.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
