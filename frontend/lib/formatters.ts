export function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMinutes(minutes?: number) {
  if (!minutes || Number.isNaN(minutes)) {
    return "Time varies";
  }

  return `${minutes} min`;
}

export function formatMacroValue(value: unknown, suffix: string) {
  if (typeof value !== "number") {
    return null;
  }

  return `${value}${suffix}`;
}
