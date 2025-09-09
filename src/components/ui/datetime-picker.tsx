import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateTimePickerProps {
  value?: string;
  onChange?: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "选择日期和时间",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [hours, setHours] = React.useState<string>(
    value ? new Date(value).getHours().toString().padStart(2, '0') : '00'
  );
  const [minutes, setMinutes] = React.useState<string>(
    value ? new Date(value).getMinutes().toString().padStart(2, '0') : '00'
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      updateDateTime(selectedDate, hours, minutes);
    }
  };

  const handleTimeChange = () => {
    if (date) {
      updateDateTime(date, hours, minutes);
    }
  };

  const updateDateTime = (selectedDate: Date, hrs: string, mins: string) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(parseInt(hrs, 10));
    newDate.setMinutes(parseInt(mins, 10));
    
    const isoString = newDate.toISOString();
    onChange?.(isoString);
  };

  const formattedValue = date 
    ? `${format(date, 'yyyy-MM-dd')} ${hours}:${minutes}`
    : '';

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-1 items-center">
        <ClockIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={hours}
          onChange={(e) => {
            let value = e.target.value;
            if (value === '') {
              setHours('00');
              return;
            }
            
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
              // 限制在0-23之间
              const clamped = Math.min(23, Math.max(0, num));
              setHours(clamped.toString().padStart(2, '0'));
            }
          }}
          onBlur={handleTimeChange}
          className="w-12 text-center"
          maxLength={2}
        />
        <span>:</span>
        <Input
          type="text"
          value={minutes}
          onChange={(e) => {
            let value = e.target.value;
            if (value === '') {
              setMinutes('00');
              return;
            }
            
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
              // 限制在0-59之间
              const clamped = Math.min(59, Math.max(0, num));
              setMinutes(clamped.toString().padStart(2, '0'));
            }
          }}
          onBlur={handleTimeChange}
          className="w-12 text-center"
          maxLength={2}
        />
      </div>
    </div>
  );
}