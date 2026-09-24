import { cn } from "@/lib/utils";

export const STATUS_LABEL: Record<"available" | "reserved" | "paid", string> = {
  available: "Disponible",
  reserved: "Reservado",
  paid: "Pagado",
};

export const STATUS_CELL_CLASS: Record<
  "available" | "reserved" | "paid",
  string
> = {
  available: "bg-status-available text-status-available-foreground",
  reserved: "bg-status-reserved text-status-reserved-foreground",
  paid: "bg-status-paid text-status-paid-foreground",
};

export function StatusPills({
  value,
  onChange,
}: {
  value: "available" | "reserved" | "paid";
  onChange: (status: "available" | "reserved" | "paid") => void;
}) {
  const options: Array<"available" | "reserved" | "paid"> = [
    "available",
    "reserved",
    "paid",
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "h-12 rounded-lg text-sm font-semibold transition-colors border-2",
            value === option
              ? `${STATUS_CELL_CLASS[option]} border-current`
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {STATUS_LABEL[option]}
        </button>
      ))}
    </div>
  );
}
