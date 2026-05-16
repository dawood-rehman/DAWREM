import Link from "next/link";

export interface InfoPageSection {
  title: string;
  body?: string[];
  items?: string[];
}

interface InfoPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoPageSection[];
  ctaLabel?: string;
  ctaHref?: string;
}

export default function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
  ctaLabel = "Shop Collection",
  ctaHref = "/shop",
}: InfoPageProps) {
  return (
    <div className="bg-ivory-50 text-velour-black">
      <section className="border-b border-gold-200/70 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="section-subtitle">{eyebrow}</p>
          <h1 className="section-title mb-4">{title}</h1>
          <div className="gold-divider" />
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-500">
            {intro}
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-100">
          {sections.map((section) => (
            <article key={section.title} className="py-8 first:pt-0 last:pb-0">
              <h2 className="font-cormorant text-2xl font-medium text-velour-black">
                {section.title}
              </h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm leading-7 text-gray-600">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <li key={item} className="border-l border-gold-400 pl-4 leading-6">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 px-4 py-12 text-center sm:px-6 lg:px-8">
        <Link href={ctaHref} className="btn-primary inline-flex items-center justify-center">
          {ctaLabel}
        </Link>
      </section>
    </div>
  );
}
