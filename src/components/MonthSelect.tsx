import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthSelectProps {
  /** Month number, 1-12. */
  value: number;
  onChange: (month: number) => void;
  className?: string;
  placeholder?: string;
}

export function MonthSelect({ value, onChange, className, placeholder }: MonthSelectProps) {
  return (
    <Select value={value.toString()} onValueChange={(next) => onChange(parseInt(next))}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {MONTHS.map((month, index) => (
          <SelectItem key={month} value={(index + 1).toString()}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
