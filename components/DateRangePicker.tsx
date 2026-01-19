import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onRangeChange: (start: string, end: string) => void;
  minDate?: string;  // Optional minimum date
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  startDate, 
  endDate, 
  onRangeChange,
  minDate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with current date or selected start date
  useEffect(() => {
    if (startDate) {
      setCurrentMonth(new Date(startDate));
    } else {
      setCurrentMonth(new Date());
    }
  }, [startDate]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateISO(date);

    if (selectingStart) {
      setTempStart(dateStr);
      setTempEnd(''); // Reset end when selecting new start
      setSelectingStart(false);
    } else {
      // If clicking before start, swap them
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
      
      // Apply the selection
      onRangeChange(tempStart, dateStr < tempStart ? tempStart : dateStr);
      setIsOpen(false);
      setSelectingStart(true);
    }
  };

  const handleClear = () => {
    setTempStart('');
    setTempEnd('');
    onRangeChange('', '');
    setSelectingStart(true);
  };

  const isDateInRange = (date: Date) => {
    if (!tempStart || !tempEnd) return false;
    const dateStr = formatDateISO(date);
    return dateStr >= tempStart && dateStr <= tempEnd;
  };

  const isDateStart = (date: Date) => {
    if (!tempStart) return false;
    return formatDateISO(date) === tempStart;
  };

  const isDateEnd = (date: Date) => {
    if (!tempEnd) return false;
    return formatDateISO(date) === tempEnd;
  };

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    return formatDateISO(date) < minDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="relative" ref={containerRef}>
      {/* Input Field */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
      >
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          readOnly
          value={startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : ''}
          placeholder="Selecione as datas de chegada e saída"
          className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white"
        />
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 w-full min-w-[320px] animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="font-semibold text-slate-800 capitalize">{monthName}</h3>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Status Text */}
          <div className="mb-3 text-center text-sm text-slate-500">
            {selectingStart ? (
              <span>📅 Selecione a data de <strong>chegada</strong></span>
            ) : (
              <span>📅 Selecione a data de <strong>saída</strong></span>
            )}
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const disabled = isDateDisabled(date);
              const inRange = isDateInRange(date);
              const isStart = isDateStart(date);
              const isEnd = isDateEnd(date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !disabled && handleDateClick(date)}
                  disabled={disabled}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                    ${disabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                    ${inRange && !isStart && !isEnd ? 'bg-blue-50 text-blue-700' : ''}
                    ${isStart || isEnd ? 'bg-blue-600 text-white font-bold shadow-sm' : ''}
                    ${today && !inRange && !isStart && !isEnd ? 'border-2 border-blue-400 font-semibold' : ''}
                    ${!disabled && !inRange && !isStart && !isEnd && !today ? 'text-slate-700' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {tempStart && tempEnd && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                <strong>{formatDate(tempStart)}</strong> até <strong>{formatDate(tempEnd)}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {Math.ceil((new Date(tempEnd).getTime() - new Date(tempStart).getTime()) / (1000 * 60 * 60 * 24))} noite(s)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
