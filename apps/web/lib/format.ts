export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "No informado";
  }

  return `$${value.toLocaleString("es-AR")}`;
}

export function formatRating(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Sin rating";
  }

  return value.toFixed(1);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateTimeUtc(value: string | Date | null | undefined) {
  if (!value) {
    return "No informado";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No informado";
  }

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(
    date.getUTCHours()
  )}:${pad(date.getUTCMinutes())} UTC`;
}
