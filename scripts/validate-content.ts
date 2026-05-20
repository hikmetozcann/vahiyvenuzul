import { loadCorpus } from "../src/lib/content";

try {
  const corpus = loadCorpus();
  console.log("✓ Content validation passed");
  console.log(
    `  sources: ${corpus.sources.length} · people: ${corpus.people.length} · places: ${corpus.places.length} · surahs: ${corpus.surahs.length} · ayahs: ${corpus.ayahs.length} · events: ${corpus.events.length}`,
  );
} catch (err) {
  console.error("✗ Content validation FAILED");
  if (err instanceof Error) console.error(err.message);
  process.exit(1);
}
