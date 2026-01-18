import React, { useState, useEffect } from 'react';
import { ApartmentId, ApartmentSettings, Reservation } from '../types';
import { Settings as SettingsIcon, Trash2, Plus, Save, X, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminPageProps {
  settings: Record<ApartmentId, ApartmentSettings>;
  reservations: Reservation[];
  onUpdateSettings: (settings: Record<ApartmentId, ApartmentSettings>) => void;
  onDeleteReservation: (id: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ 
  settings, 
  reservations, 
  onUpdateSettings, 
  onDeleteReservation 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [localSettings, setLocalSettings] = useState<Record<ApartmentId, ApartmentSettings>>(settings);
  const [activeTab, setActiveTab] = useState<ApartmentId>(ApartmentId.CARAGUA);
  const [, setLocation] = useLocation();

  // Sync local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password for demonstration
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setLocation('/');
  };

  const handleSettingChange = (aptId: ApartmentId, field: keyof ApartmentSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [aptId]: {
        ...prev[aptId],
        [field]: value
      }
    }));
  };

  const handleAddRule = (aptId: ApartmentId) => {
    const newRule = prompt('Nova regra:');
    if (newRule) {
      setLocalSettings(prev => ({
        ...prev,
        [aptId]: {
          ...prev[aptId],
          rules: [...prev[aptId].rules, newRule]
        }
      }));
    }
  };

  const handleRemoveRule = (aptId: ApartmentId, index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [aptId]: {
        ...prev[aptId],
        rules: prev[aptId].rules.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    alert('Configurações salvas com sucesso!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Área Administrativa</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Digite a senha"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setLocation('/')}
              className="w-full text-slate-500 hover:text-slate-700 text-sm mt-2"
            >
              Voltar para o site
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            Administração
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/')}
              className="text-slate-600 hover:text-blue-600 text-sm font-medium"
            >
              Ver Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab(ApartmentId.CARAGUA)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === ApartmentId.CARAGUA 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {localSettings[ApartmentId.CARAGUA].name}
          </button>
          <button
            onClick={() => setActiveTab(ApartmentId.PRAIA_GRANDE)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === ApartmentId.PRAIA_GRANDE 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {localSettings[ApartmentId.PRAIA_GRANDE].name}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">
              Dados do Imóvel
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  value={localSettings[activeTab].name}
                  onChange={(e) => handleSettingChange(activeTab, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL da Foto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localSettings[activeTab].photoUrl}
                    onChange={(e) => handleSettingChange(activeTab, 'photoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                  />
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img src={localSettings[activeTab].photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Regras e Alertas</label>
                <div className="space-y-2">
                  {localSettings[activeTab].rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => {
                          const newRules = [...localSettings[activeTab].rules];
                          newRules[idx] = e.target.value;
                          handleSettingChange(activeTab, 'rules', newRules);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        onClick={() => handleRemoveRule(activeTab, idx)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddRule(activeTab)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Regra
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setLocalSettings(settings)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-blue-200"
              >
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </div>

          {/* Reservations Management */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">
              Gerenciar Reservas ({reservations.filter(r => r.apartmentId === activeTab).length})
            </h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {reservations
                .filter(r => r.apartmentId === activeTab)
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: res.color }}></div>
                      <div>
                        <div className="font-medium text-slate-800">{res.guestName}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(res.startDate).toLocaleDateString('pt-BR')} até {new Date(res.endDate).toLocaleDateString('pt-BR')}
                        </div>
                        {res.email && (
                          <div className="text-xs text-slate-400 mt-0.5">{res.email}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteReservation(res.id)}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  </div>
                ))}
                
                {reservations.filter(r => r.apartmentId === activeTab).length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    Nenhuma reserva encontrada para este local.
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
