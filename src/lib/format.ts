const currencyFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

export function formatCOP(value: number) {
  return `$${currencyFormatter.format(value)}`;
}

export function padNumber(value: number, gridSize: number) {
  const digits = String(gridSize - 1).length;
  return String(value).padStart(digits, "0");
}

export function waLink(phone: string, message?: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
