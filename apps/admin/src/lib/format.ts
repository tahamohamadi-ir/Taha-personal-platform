const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const numberFormatter = new Intl.NumberFormat("fa-IR");

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDateTime(value: string | null): string {
  if (value === null || value === "") {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
}

export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${formatNumber(size)} B`;
  }
  if (size < 1024 * 1024) {
    return `${formatNumber(Math.round(size / 1024))} KB`;
  }
  const mb = (size / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
  return `${formatNumber(Number(mb))} MB`;
}
