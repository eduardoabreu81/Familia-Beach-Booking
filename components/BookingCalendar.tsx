import React, { useMemo, useState } from 'react';
import { Reservation, ApartmentId, ApartmentSettings } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Edit2, Trash2, X } from 'lucide-react';

interface BookingCalendarProps {
  reservations: Reservation[];
  settings: Record<ApartmentId, ApartmentSettings>;
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  activeTab: ApartmentId;
  onTabChange: (id: ApartmentId) => void;
  onEditReservation?: (reservation: Reservation) => void;
  onDeleteReservation?: (id: string) => void;
}

// Temas de cores por apartamento
const apartmentThemes = {
  [ApartmentId.CARAGUA]: {
    primary: 'blue-600',
    secondary: 'blue-50',
    hover: 'blue-100',
    border: 'blue-600',
    gradient: 'from-blue-500 to-blue-600',
    tabBg: 'bg-gradient-to-r from-blue-50 to-blue-100'
  },
  [ApartmentId.PRAIA_GRANDE]: {
    primary: 'cyan-600',
    secondary: 'cyan-50',
    hover: 'cyan-100',
    border: 'cyan-600',
    gradient: 'from-cyan-500 to-teal-600',
    tabBg: 'bg-gradient-to-r from-cyan-50 to-teal-100'
  }
};

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  reservations, 
  settings,
  currentDate, 
  onPrevMonth, 
  onNextMonth,
  activeTab,
  onTabChange,
  onEditReservation,
  onDeleteReservation
}) => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [popupPosition, setPopupPosition] = useState<{x: number, y: number} | null>(null);

  const theme = apartmentThemes[activeTab];

  const handleReservationClick = (e: React.MouseEvent, res: Reservation) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({ x: rect.left, y: rect.bottom + window.scrollY });
    setSelectedReservation(res);
  };

  const closePopup = () => {
    setSelectedReservation(null);
    setPopupPosition(null);
  };

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
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-500">
      {/* Tabs with Dynamic Colors */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => onTabChange(ApartmentId.CARAGUA)}
          className={`flex-1 py-4 text-sm sm:text-base font-medium transition-all duration-300 relative
            ${activeTab === ApartmentId.CARAGUA 
              ? `text-blue-700 ${apartmentThemes[ApartmentId.CARAGUA].tabBg} shadow-inner` 
              : 'text-slate-500 hover:bg-slate-50'}`}
        >
          {settings[ApartmentId.CARAGUA].name}
          {activeTab === ApartmentId.CARAGUA && (
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${apartmentThemes[ApartmentId.CARAGUA].gradient} animate-in slide-in-from-left duration-300`}></div>
          )}
        </button>
        <div className="w-px bg-slate-200"></div>
        <button
          onClick={() => onTabChange(ApartmentId.PRAIA_GRANDE)}
          className={`flex-1 py-4 text-sm sm:text-base font-medium transition-all duration-300 relative
            ${activeTab === ApartmentId.PRAIA_GRANDE 
              ? `text-cyan-700 ${apartmentThemes[ApartmentId.PRAIA_GRANDE].tabBg} shadow-inner` 
              : 'text-slate-500 hover:bg-slate-50'}`}
        >
          {settings[ApartmentId.PRAIA_GRANDE].name}
          {activeTab === ApartmentId.PRAIA_GRANDE && (
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${apartmentThemes[ApartmentId.PRAIA_GRANDE].gradient} animate-in slide-in-from-right duration-300`}></div>
          )}
        </button>
      </div>

      {/* Calendar Header with Theme Color */}
      <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${theme.gradient} text-white border-b border-white/20`}>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onPrevMonth} 
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 border border-white/30 hover:scale-110"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={onNextMonth} 
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 border border-white/30 hover:scale-110"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className={`grid grid-cols-7 text-center ${theme.secondary} border-b border-slate-200`}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr flex-grow">
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-slate-50/50 border-b border-r border-slate-100"></div>;
          }

          const todaysReservations = getDayReservations(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const holidayName = getHoliday(date);

          return (
            <div 
              key={date.toISOString()} 
              className={`h-24 sm:h-28 border-b border-r border-slate-100 p-1 flex flex-col items-start justify-start relative group transition-all duration-200 hover:bg-${theme.secondary} hover:shadow-inner ${isToday ? `bg-${theme.secondary} ring-2 ring-${theme.primary} ring-inset` : ''}`}
            >
              <div className="w-full flex justify-between items-start">
                <span className={`text-xs font-medium p-1 rounded-full w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${isToday ? `bg-gradient-to-br ${theme.gradient} text-white shadow-md` : 'text-slate-500 group-hover:bg-slate-100'}`}>
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
                    onClick={(e) => handleReservationClick(e, res)}
                    className="text-[10px] sm:text-xs px-1.5 py-1 rounded text-white shadow-sm truncate w-full cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200"
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
      
      {/* Legend / Info Footer with Theme */}
      <div className={`p-3 bg-${theme.secondary} border-t border-slate-200 text-xs text-slate-600 flex justify-between items-center`}>
        <span>Mostrando: <strong className={`text-${theme.primary}`}>{activeSettings.name}</strong></span>
        <span>{activeSettings.location}</span>
      </div>

      {/* Reservation Popup - Enhanced */}
      {selectedReservation && popupPosition && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={closePopup}></div>
          <div 
            className="absolute z-50 bg-white rounded-xl shadow-2xl border-2 border-slate-200 p-5 w-80 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
            style={{ 
              top: Math.min(popupPosition.y, window.innerHeight + window.scrollY - 280),
              left: Math.min(popupPosition.x, window.innerWidth - 340)
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-xl">{selectedReservation.guestName}</h3>
                <span className="text-xs text-slate-500 font-medium">{settings[selectedReservation.apartmentId].name}</span>
              </div>
              <button 
                onClick={closePopup} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-slate-700 mb-5">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                <span className="font-semibold text-slate-800">Entrada:</span>
                <span>{new Date(selectedReservation.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                <span className="font-semibold text-slate-800">Saída:</span>
                <span>{new Date(selectedReservation.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              {selectedReservation.notes && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <p className="text-amber-900 italic text-xs leading-relaxed">
                    "{selectedReservation.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-200">
              {onEditReservation && (
                <button 
                  onClick={() => {
                    onEditReservation(selectedReservation);
                    closePopup();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 bg-${theme.secondary} text-${theme.primary} hover:bg-${theme.hover} py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md`}
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
              )}
              {onDeleteReservation && (
                <button 
                  onClick={() => {
                    onDeleteReservation(selectedReservation.id);
                    closePopup();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingCalendar;
