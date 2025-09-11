import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ClockIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: string;
  onChange?: (date: string | undefined) => void;
  onRemove?: () => void;
  className?: string;
}

export function DateTimePicker({ 
  value, 
  onChange, 
  onRemove, 
  className 
}: DateTimePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [hours, setHours] = useState<string>(
    value ? new Date(value).getHours().toString().padStart(2, '0') : '14'
  );
  const [minutes, setMinutes] = useState<string>(
    value ? new Date(value).getMinutes().toString().padStart(2, '0') : '00'
  );
  const [showStartDate, setShowStartDate] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [reminder, setReminder] = useState('1d');

  useEffect(() => {
    if (value) {
      setDate(new Date(value));
      const dateObj = new Date(value);
      setHours(dateObj.getHours().toString().padStart(2, '0'));
      setMinutes(dateObj.getMinutes().toString().padStart(2, '0'));
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleTimeChange = () => {
    handleSave();
  };

  const handleSave = () => {
    if (!date) return;
    
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    
    const isoString = newDate.toISOString();
    onChange?.(isoString);
    setOpen(false);
  };

  const handleRemove = () => {
    setDate(undefined);
    setHours('14');
    setMinutes('00');
    setShowStartDate(false);
    setStartDate(undefined);
    onChange?.(undefined);
    if (onRemove) {
      onRemove();
    }
    setOpen(false);
  };

  const formattedValue = date 
    ? `${format(date, 'yyyy-MM-dd')} ${hours}:${minutes}`
    : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn(className, 'cursor-pointer')}>
          {formattedValue || t('taskDetail.noEstimatedEndDate')}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
        <div className="bg-white rounded-md shadow-lg">
          {/* 日历标题和导航 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium text-lg">{t('taskDetail.date')}</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  const prevMonth = new Date(date || new Date());
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setDate(prevMonth);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  const nextMonth = new Date(date || new Date());
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setDate(nextMonth);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full ml-auto"
                onClick={() => setOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          </div>

          {/* 日历主体 */}
          <div className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              className="mb-4"
            />

            {/* 时间选择 */}
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <input
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
                className="w-10 text-center p-1 border rounded"
                maxLength={2}
              />
              <span>:</span>
              <input
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
                className="w-10 text-center p-1 border rounded"
                maxLength={2}
              />
            </div>

            {/* 开始日期选项 */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="showStartDate"
                checked={showStartDate}
                onChange={(e) => setShowStartDate(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="showStartDate" className="text-sm cursor-pointer">
                {t('taskDetail.startDate')}
              </label>
            </div>

            {/* 提醒设置 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t('taskDetail.setReminder')}
              </label>
              <Select value={reminder} onValueChange={setReminder}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('taskDetail.selectReminder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('taskDetail.noReminder')}</SelectItem>
                  <SelectItem value="15m">{t('taskDetail.reminder15min')}</SelectItem>
                  <SelectItem value="1h">{t('taskDetail.reminder1h')}</SelectItem>
                  <SelectItem value="2h">{t('taskDetail.reminder2h')}</SelectItem>
                  <SelectItem value="1d">{t('taskDetail.reminder1d')}</SelectItem>
                  <SelectItem value="2d">{t('taskDetail.reminder2d')}</SelectItem>
                  <SelectItem value="1w">{t('taskDetail.reminder1w')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {t('taskDetail.reminderDescription')}
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
              >
                <Check className="h-4 w-4 mr-2" />
                {t('common.save')}
              </Button>
              {value && (
                <Button 
                  variant="outline" 
                  onClick={handleRemove}
                >
                  {t('taskDetail.remove')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}