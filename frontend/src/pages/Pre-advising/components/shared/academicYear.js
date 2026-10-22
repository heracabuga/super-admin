const DEFAULT_ACADEMIC_YEAR = "2025-2026";

export const formatAcademicYearShort = (value) => {
  const match = String(value || "").match(/(\d{4})\D+(\d{4})/);

  if (!match || match[1] === match[2]) {
    return "25-26";
  }

  return `${match[1].slice(-2)}-${match[2].slice(-2)}`;
};

export const getAcademicYearShort = (value) => {
  return formatAcademicYearShort(value || DEFAULT_ACADEMIC_YEAR);
};