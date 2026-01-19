import React, { useState, useEffect } from 'react';
import { Reservation, ApartmentId, ApartmentSettings } from '../types';
import { DateBlock, subscribeToDateBlocks } from '../services/firestoreService';
import { X, Calendar, MapPin, Shield } from 'lucide-react';

interface ReservationSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  settings: Record<ApartmentId, ApartmentSettings>;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({ isOpen, onClose, reservations, settings }) => {
  const [blocks, setBlocks] = useState<DateBlock[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToDateBlocks((updatedBlocks) => {
      setBlocks(updatedBlocks);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  // Sort reservations by date
  const sortedReservations = [...reservations].sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  // Filter only future or current reservations
  const today = new Date().toISOString().split('T')[0];
  const futureReservations = sortedReservations.filter(r => r.endDate >= today);
  const futureBlocks = blocks.filter(b => b.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  // Combine and sort all items
  const allItems = [
    ...futureReservations.map(r => ({ type: 'reservation' as const, data: r, date: r.startDate })),
    ...futureBlocks.map(b => ({ type: 'block' as const, data: b, date: b.startDate }))
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximas Reservas
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Lista de todas as estadias agendadas
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-6 space-y-4">
          {allItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma reserva ou bloqueio futuro encontrado.</p>
            </div>
          ) : (
            allItems.map((item) => {
              if (item.type === 'block') {
                const block = item.data as DateBlock;
                return (
                  <div key={block.id} className="relative flex flex-col sm:flex-row gap-4 p-4 rounded-lg border-2 border-amber-500 overflow-hidden">
                    {/* Faixa diagonal de fundo */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fbbf24 10px, #fbbf24 20px)'
                      }}
                    />
                    
                    {/* Date Box */}
                    <div className="relative z-10 flex-shrink-0 flex sm:flex-col items-center justify-center bg-amber-100 rounded-lg p-3 min-w-[80px] text-center gap-2 sm:gap-0 border-2 border-amber-400">
                      <Shield className="w-5 h-5 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700 uppercase">
                        {new Date(block.startDate).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-2xl font-bold text-amber-800">
                        {new Date(block.startDate).getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="relative z-10 flex-grow space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <Shield className="w-5 h-5 text-amber-600" />
                          BLOQUEADO
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                          block.apartmentId === ApartmentId.CARAGUA 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {settings[block.apartmentId].name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          {new Date(block.startDate).toLocaleDateString('pt-BR')} até {new Date(block.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-amber-800 mt-2 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        Motivo: {block.reason}
                      </p>
                    </div>
                  </div>
                );
              } else {
                const res = item.data as Reservation;
                return (
                <div key={res.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                
                {/* Date Box */}
                <div className="flex-shrink-0 flex sm:flex-col items-center justify-center bg-slate-100 rounded-lg p-3 min-w-[80px] text-center gap-2 sm:gap-0">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {new Date(res.startDate).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                  </span>
                  <span className="text-2xl font-bold text-slate-800">
                    {new Date(res.startDate).getDate()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(res.startDate).getFullYear()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-lg">{res.guestName}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                      res.apartmentId === ApartmentId.CARAGUA 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {settings[res.apartmentId].name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(res.startDate).toLocaleDateString('pt-BR')} até {new Date(res.endDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {res.notes && (
                    <p className="text-xs text-slate-500 italic mt-2 bg-white p-2 rounded border border-slate-100">
                      "{res.notes}"
                    </p>
                  )}
                </div>
              </div>
                );
              }
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl text-center">
          <button 
            onClick={onClose}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Fechar Lista
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReservationSummary;
