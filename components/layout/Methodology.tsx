import { interpolate } from "@/app/[locale]/dictionaries";
import { militarySpending } from "@/data/military-spending.schema";

// Update this once the GitHub repo is pushed.
const REPO_URL = "https://github.com/michaelbrowk/war-cost-landing";

type Props = {
  strings: {
    title: string;
    counter: string;
    categories: string;
    data: string;
    updated: string;
    repoLabel: string;
  };
};

export function Methodology({ strings }: Props) {
  const updatedText = interpolate(strings.updated, {
    date: militarySpending.lastUpdated,
  });

  return (
    <section className="py-16 md:py-24 border-t border-[var(--border-color)]">
      <h2 className="font-serif text-3xl md:text-5xl text-[var(--text-primary)] mb-8 md:mb-12">
        {strings.title}
      </h2>
      <div className="space-y-6 max-w-3xl text-[var(--text-primary)]">
        <p className="font-sans text-base md:text-lg leading-relaxed">{strings.counter}</p>
        <p className="font-sans text-base md:text-lg leading-relaxed">{strings.categories}</p>
        <p className="font-sans text-base md:text-lg leading-relaxed">{strings.data}</p>
      </div>
      <div className="mt-10 flex flex-col gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        <span>{updatedText}</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition-colors w-fit"
        >
          {strings.repoLabel} →
        </a>
      </div>
    </section>
  );
}
