import React from 'react';
import { DateTimePicker } from '@/components/DateTimePicker';

interface TaskDateTimePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  onRemove?: () => void;
  className?: string;
}

export function TaskDateTimePicker({ 
  value, 
  onChange, 
  onRemove, 
  className 
}: TaskDateTimePickerProps) {
  return (
    <DateTimePicker
      value={value}
      onChange={onChange}
      onRemove={onRemove}
      className={className}
    />
  );
}