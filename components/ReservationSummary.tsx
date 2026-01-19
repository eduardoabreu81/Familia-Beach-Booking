import React from 'react';
import { Reservation, ApartmentId, ApartmentSettings } from '../types';
import { X, Calendar, MapPin, Moon } from 'lucide-react';

interface ReservationSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  settings: Record<ApartmentId, ApartmentSettings>;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({ isOpen, onClose, reservations, settings }) => {
  if (!isOpen) return null;

  // Sort reservations by date
  const sortedReservations = [...reservations].sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  // Filter only future or current reservations
  const today = new Date().toISOString().split('T')[0];
  const futureReservations = sortedReservations.filter(r => r.endDate >= today);

  // Calculate number of nights
  const calculateNights = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header with Gradient */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Próximas Reservas
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Lista de todas as estadias agendadas • {futureReservations.length} {futureReservations.length === 1 ? 'reserva' : 'reservas'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-full transition-all duration-200 text-slate-500 hover:text-slate-700 hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List with Enhanced Cards */}
        <div className="overflow-y-auto p-6 space-y-4">
          {futureReservations.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma reserva futura encontrada.</p>
              <p className="text-sm mt-2">Faça uma nova reserva para começar!</p>
            </div>
          ) : (
            futureReservations.map((res) => {
              const nights = calculateNights(res.startDate, res.endDate);
              const apartmentTheme = res.apartmentId === ApartmentId.CARAGUA
                ? { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' }
                : { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700' };

              return (
                <div 
                  key={res.id} 
                  className={`flex flex-col sm:flex-row gap-4 p-5 rounded-xl border-2 ${apartmentTheme.border} ${apartmentTheme.bg} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                >
                  
                  {/* Date Box - Enhanced */}
                  <div className={`flex-shrink-0 flex sm:flex-col items-center justify-center bg-white rounded-xl p-4 min-w-[90px] text-center gap-2 sm:gap-1 shadow-sm border ${apartmentTheme.border}`}>
                    <span className={`text-xs font-bold ${apartmentTheme.text} uppercase tracking-wide`}>
                      {new Date(res.startDate).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                    </span>
                    <span className="text-3xl font-bold text-slate-800">
                      {new Date(res.startDate).getDate()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(res.startDate).getFullYear()}
                    </span>
                  </div>

                  {/* Info - Enhanced */}
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800 text-xl">{res.guestName}</h3>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${apartmentTheme.badge} shadow-sm`}>
                        {settings[res.apartmentId].name}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(res.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até {new Date(res.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 bg-white px-2 py-1 rounded-md text-xs font-semibold">
                        <Moon className="w-3 h-3" />
                        {nights} {nights === 1 ? 'noite' : 'noites'}
                      </span>
                    </div>

                    {res.notes && (
                      <div className="bg-white/80 p-3 rounded-lg border border-slate-200 mt-2">
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          💬 "{res.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer - Enhanced */}
        <div className="p-5 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-2xl flex justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Fechar Lista
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReservationSummary;
