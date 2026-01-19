import React, { useState, useEffect } from 'react';
import { ApartmentId, ApartmentSettings } from '../types';
import { DateBlock, subscribeToDateBlocks, saveDateBlock, deleteDateBlock } from '../services/firestoreService';
import { Shield, Trash2, Plus, Calendar, AlertTriangle } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

interface DateBlockManagerProps {
  settings: Record<ApartmentId, ApartmentSettings>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const DateBlockManager: React.FC<DateBlockManagerProps> = ({ settings, onSuccess, onError }) => {
  const [blocks, setBlocks] = useState<DateBlock[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [apartmentId, setApartmentId] = useState<ApartmentId>(ApartmentId.CARAGUA);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToDateBlocks((updatedBlocks) => {
      // Sort by start date
      const sorted = updatedBlocks.sort((a, b) => a.startDate.localeCompare(b.startDate));
      setBlocks(sorted);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      onError('Selecione as datas de início e fim do bloqueio');
      return;
    }

    if (!reason.trim()) {
      onError('Informe o motivo do bloqueio');
      return;
    }

    const success = await saveDateBlock({
      apartmentId,
      startDate,
      endDate,
      reason: reason.trim(),
      createdAt: new Date().toISOString()
    });

    if (success) {
      onSuccess('Bloqueio criado com sucesso!');
      setStartDate('');
      setEndDate('');
      setReason('');
      setIsAdding(false);
    } else {
      onError('Erro ao criar bloqueio');
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Tem certeza que deseja remover este bloqueio?');
    if (confirm) {
      await deleteDateBlock(id);
      onSuccess('Bloqueio removido com sucesso!');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDuration = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} dia${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          Bloqueios de Datas
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isAdding
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'
          }`}
        >
          {isAdding ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Novo Bloqueio
            </>
          )}
        </button>
      </div>

      {/* Form to Add Block */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            Criar Novo Bloqueio
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Apartamento</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setApartmentId(ApartmentId.CARAGUA)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    apartmentId === ApartmentId.CARAGUA
                      ? 'bg-amber-100 border-amber-500 text-amber-800'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {settings[ApartmentId.CARAGUA].name}
                </button>
                <button
                  type="button"
                  onClick={() => setApartmentId(ApartmentId.PRAIA_GRANDE)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    apartmentId === ApartmentId.PRAIA_GRANDE
                      ? 'bg-amber-100 border-amber-500 text-amber-800'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {settings[ApartmentId.PRAIA_GRANDE].name}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Período do Bloqueio</label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onRangeChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                minDate={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo do Bloqueio</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Manutenção, Reforma, Reservado para família"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-lg transition-all"
            >
              Criar Bloqueio
            </button>
          </div>
        </form>
      )}

      {/* List of Blocks */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum bloqueio ativo</p>
          </div>
        ) : (
          blocks.map((block) => (
            <div
              key={block.id}
              className="p-4 border-2 border-amber-300 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Diagonal Stripes Background */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fbbf24 10px, #fbbf24 20px)'
                }}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded uppercase">
                      Bloqueado
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {settings[block.apartmentId].name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">
                      {formatDate(block.startDate)} até {formatDate(block.endDate)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({getDuration(block.startDate, block.endDate)})
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 font-medium mt-2">
                    <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-600" />
                    {block.reason}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(block.id)}
                  className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover bloqueio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DateBlockManager;
