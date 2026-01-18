import React, { useState } from 'react';
import { ApartmentId, ApartmentSettings, Reservation } from '../types';
import { Settings, Save, X, Trash2, Home, Camera, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  settings: Record<ApartmentId, ApartmentSettings>;
  reservations: Reservation[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (s: Record<ApartmentId, ApartmentSettings>) => void;
  onDeleteReservation: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  settings, 
  reservations, 
  isOpen, 
  onClose,
  onUpdateSettings,
  onDeleteReservation
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<ApartmentId>(ApartmentId.CARAGUA);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const updateSetting = (aptId: ApartmentId, field: keyof ApartmentSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [aptId]: {
        ...prev[aptId],
        [field]: value
      }
    }));
  };

  const handleRuleChange = (aptId: ApartmentId, index: number, value: string) => {
    const newRules = [...localSettings[aptId].rules];
    newRules[index] = value;
    updateSetting(aptId, 'rules', newRules);
  };

  const addRule = (aptId: ApartmentId) => {
    updateSetting(aptId, 'rules', [...localSettings[aptId].rules, '']);
  };

  const removeRule = (aptId: ApartmentId, index: number) => {
    const newRules = localSettings[aptId].rules.filter((_, i) => i !== index);
    updateSetting(aptId, 'rules', newRules);
  };

  const currentReservations = reservations.filter(r => r.apartmentId === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-600" />
            Administração
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab(ApartmentId.CARAGUA)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === ApartmentId.CARAGUA ? 'bg-white shadow-sm text-blue-600 ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Caraguatatuba
            </button>
            <button 
              onClick={() => setActiveTab(ApartmentId.PRAIA_GRANDE)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === ApartmentId.PRAIA_GRANDE ? 'bg-white shadow-sm text-blue-600 ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Praia Grande
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* General Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Dados do Imóvel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nome de Exibição</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={localSettings[activeTab].name}
                      onChange={(e) => updateSetting(activeTab, 'name', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">URL da Foto</label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={localSettings[activeTab].photoUrl}
                      onChange={(e) => updateSetting(activeTab, 'photoUrl', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Rules / Alerts */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Regras e Alertas
              </h3>
              <div className="space-y-2">
                {localSettings[activeTab].rules.map((rule, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={rule}
                      onChange={(e) => handleRuleChange(activeTab, idx, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <button 
                      onClick={() => removeRule(activeTab, idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => addRule(activeTab)}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  + Adicionar Regra
                </button>
              </div>
            </section>

            {/* Reservations Management */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Gerenciar Reservas ({currentReservations.length})</h3>
              <div className="space-y-2">
                {currentReservations.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Nenhuma reserva futura.</p>
                ) : (
                  currentReservations.map(res => (
                    <div key={res.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: res.color }}></div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">{res.guestName}</p>
                          <p className="text-xs text-slate-500">{new Date(res.startDate).toLocaleDateString()} até {new Date(res.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onDeleteReservation(res.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                        title="Excluir Reserva"
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;