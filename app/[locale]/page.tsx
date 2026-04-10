import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="font-serif text-6xl">{dict.hello}</h1>
    </main>
  );
}
