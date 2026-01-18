import React, { useMemo, useState } from 'react';
import { Reservation, ApartmentId, ApartmentSettings } from '../types';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface BookingCalendarProps {
  reservations: Reservation[];
  settings: Record<ApartmentId, ApartmentSettings>;
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  reservations, 
  settings,
  currentDate, 
  onPrevMonth, 
  onNextMonth 
}) => {
  const [activeTab, setActiveTab] = useState<ApartmentId>(ApartmentId.CARAGUA);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Helper to identify holidays
  const getHoliday = (date: Date): string | null => {
    const d = date.getDate();
    const m = date.getMonth() + 1; // 1-12
    const y = date.getFullYear();

    // Fixed Holidays
    if (d === 1 && m === 1) return 'Confraternização Universal';
    if (d === 21 && m === 4) return 'Tiradentes';
    if (d === 1 && m === 5) return 'Dia do Trabalho';
    if (d === 7 && m === 9) return 'Independência';
    if (d === 12 && m === 10) return 'N. Sra. Aparecida';
    if (d === 2 && m === 11) return 'Finados';
    if (d === 15 && m === 11) return 'Proc. da República';
    if (d === 20 && m === 11) return 'Consciência Negra';
    if (d === 25 && m === 12) return 'Natal';

    // Movable Holidays (Manual map for 2025/2026 for reliability)
    const dateStr = `${y}-${m}-${d}`;
    const movable: Record<string, string> = {
      // 2025
      '2025-3-3': 'Carnaval',
      '2025-3-4': 'Carnaval',
      '2025-4-18': 'Paixão de Cristo',
      '2025-4-20': 'Páscoa',
      '2025-6-19': 'Corpus Christi',
      // 2026
      '2026-2-16': 'Carnaval',
      '2026-2-17': 'Carnaval',
      '2026-4-3': 'Paixão de Cristo',
      '2026-4-5': 'Páscoa',
      '2026-6-4': 'Corpus Christi'
    };

    return movable[dateStr] || null;
  };

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  }, [currentDate]);

  const getDayReservations = (date: Date) => {
    return reservations.filter(res => {
      if (res.apartmentId !== activeTab) return false;
      const checkStr = date.toISOString().split('T')[0];
      return checkStr >= res.startDate && checkStr <= res.endDate;
    });
  };

  const activeSettings = settings[activeTab];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab(ApartmentId.CARAGUA)}
          className={`flex-1 py-4 text-sm sm:text-base font-medium transition-colors relative
            ${activeTab === ApartmentId.CARAGUA ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          {settings[ApartmentId.CARAGUA].name}
          {activeTab === ApartmentId.CARAGUA && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <div className="w-px bg-slate-200"></div>
        <button
          onClick={() => setActiveTab(ApartmentId.PRAIA_GRANDE)}
          className={`flex-1 py-4 text-sm sm:text-base font-medium transition-colors relative
            ${activeTab === ApartmentId.PRAIA_GRANDE ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          {settings[ApartmentId.PRAIA_GRANDE].name}
          {activeTab === ApartmentId.PRAIA_GRANDE && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={onPrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={onNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 text-center bg-slate-50/50 border-b border-slate-200">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr flex-grow">
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-slate-50/20 border-b border-r border-slate-100"></div>;
          }

          const todaysReservations = getDayReservations(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const holidayName = getHoliday(date);

          return (
            <div 
              key={date.toISOString()} 
              className={`h-24 sm:h-28 border-b border-r border-slate-100 p-1 flex flex-col items-start justify-start relative group transition-colors hover:bg-slate-50 ${isToday ? 'bg-blue-50/30' : ''}`}
            >
              <div className="w-full flex justify-between items-start">
                <span className={`text-xs font-medium p-1 rounded-full w-6 h-6 flex items-center justify-center mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
                  {date.getDate()}
                </span>
                {holidayName && (
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-tight text-right leading-3 max-w-[70%] mr-1">
                    {holidayName}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1 w-full overflow-y-auto no-scrollbar">
                {todaysReservations.map(res => (
                  <div 
                    key={res.id} 
                    className="text-[10px] sm:text-xs px-1.5 py-1 rounded text-white shadow-sm truncate w-full"
                    style={{ backgroundColor: res.color }}
                    title={`${res.guestName}`}
                  >
                    {res.guestName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend / Info Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>Mostrando: <strong>{activeSettings.name}</strong></span>
        <span>{activeSettings.location}</span>
      </div>
    </div>
  );
};

export default BookingCalendar;