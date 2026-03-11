export type RawSearchParams = Record<string, string | string[] | undefined>;

export function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
