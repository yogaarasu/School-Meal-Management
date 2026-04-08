export const formatFixed = (value: number, digits = 3): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const todayISO = (): string => new Date().toISOString().split("T")[0];

export const monthISO = (): string => new Date().toISOString().slice(0, 7);