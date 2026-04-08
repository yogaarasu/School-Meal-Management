import type { TranslationKey } from "@/modules/shared/data/translations";

type TranslateFn = (key: TranslationKey) => string;

const errorMap: Array<{ pattern: RegExp; key: TranslationKey }> = [
  { pattern: /invalid email or password/i, key: "loginFail" },
  { pattern: /organizer with same email or id already exists/i, key: "organizerDuplicate" },
  { pattern: /organizer not found/i, key: "organizerNotFound" },
  { pattern: /password must be at least 8/i, key: "strictPasswordHint" },
  { pattern: /a report for this date and section already exists/i, key: "reportDuplicate" },
  { pattern: /report not found/i, key: "reportNotFound" },
  { pattern: /unable to load pricing/i, key: "loadPricingFailed" },
  { pattern: /unable to save pricing/i, key: "savePricingFailed" },
  { pattern: /unable to save organizer/i, key: "saveOrganizerFailed" },
  { pattern: /unable to delete organizer/i, key: "deleteOrganizerFailed" },
  { pattern: /unable to load report data/i, key: "loadReportDataFailed" },
  { pattern: /unable to save report/i, key: "saveReportFailed" },
  { pattern: /unable to delete report/i, key: "deleteReportFailed" },
  { pattern: /unable to add stock/i, key: "addStockFailed" },
  { pattern: /unable to delete stock entry/i, key: "deleteStockFailed" },
  { pattern: /request failed/i, key: "unknownError" }
];

export const resolveToastErrorMessage = (
  error: unknown,
  t: TranslateFn,
  fallbackKey: TranslationKey
): string => {
  const message = error instanceof Error ? error.message.trim() : "";

  if (!message) {
    return t(fallbackKey);
  }

  const match = errorMap.find((item) => item.pattern.test(message));
  return match ? t(match.key) : t(fallbackKey);
};
