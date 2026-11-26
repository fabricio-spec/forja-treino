// Demonstrações em 2 quadros (início/fim do movimento) do Free Exercise DB, domínio público (Unlicense).
// https://github.com/yuhonas/free-exercise-db  ·  mapeamento em assets/demo/source-ids.json
const files = import.meta.glob('../assets/demo/*.webp', { eager: true, import: 'default' });
const map = {};
for (const [path, url] of Object.entries(files)) {
  const m = path.match(/\/([^/]+)-(\d)\.webp$/);
  if (m) (map[m[1]] ??= [])[Number(m[2])] = url;
}
export const demoFrames = (exerciseId) => map[exerciseId] ?? null;
