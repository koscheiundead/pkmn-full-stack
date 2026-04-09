// "flash-fire" -> "Flash Fire" e.g.
export function cap(str: string | null): string {
  if (!str) return '';
  let words = str.split('-');
  let result = []
  for (let word of words) {
    result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
  return result.join(' ');
}

// "generation-i" -> "Gen I" e.g.
export function formatGeneration(raw: string): string {
  const roman = raw.replace('generation-', '').toUpperCase();
  return `Gen ${roman}`;
}
