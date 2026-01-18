import React, { useState, useEffect } from 'react';
import { ApartmentId, ApartmentSettings, Reservation, User } from '../types';
import { login, logout, subscribeToAuth } from '../services/authService';
import { getUsers, saveUser } from '../services/storageService'; // We will need to migrate users too later, but for now let's fix auth first
import { Settings as SettingsIcon, Trash2, Plus, Save, X, LogOut, Users, Palette } from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminPageProps {
  settings: Record<ApartmentId, ApartmentSettings>;
  reservations: Reservation[];
  onUpdateSettings: (settings: Record<ApartmentId, ApartmentSettings>) => void;
  onDeleteReservation: (id: string) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'
];

const AdminPage: React.FC<AdminPageProps> = ({ 
  settings, 
  reservations, 
  onUpdateSettings, 
  onDeleteReservation 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localSettings, setLocalSettings] = useState<Record<ApartmentId, ApartmentSettings>>(settings);
  const [activeTab, setActiveTab] = useState<ApartmentId | 'users'>(ApartmentId.CARAGUA);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', color: COLORS[0] });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  // Sync local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
    setUsers(getUsers());
    
    const unsubscribe = subscribeToAuth((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, [settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // Auth state listener will handle the rest
    } catch (err) {
      setError('Login falhou. Verifique e-mail e senha.');
    }
  };

  const handleLogout = async () => {
    await logout();
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

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name) return;
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      email: newUser.email,
      color: newUser.color
    };
    
    saveUser(user);
    setUsers(getUsers());
    setNewUser({ name: '', email: '', color: COLORS[0] });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name) return;

    saveUser(editingUser); // saveUser handles update if ID exists
    setUsers(getUsers());
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem certeza? Isso não apagará as reservas passadas.')) {
      const updated = users.filter(u => u.id !== id);
      localStorage.setItem('family_beach_users_v2', JSON.stringify(updated));
      setUsers(updated);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Área Administrativa</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="admin@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Sua senha"
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
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab(ApartmentId.CARAGUA)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === ApartmentId.CARAGUA 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {localSettings[ApartmentId.CARAGUA].name}
          </button>
          <button
            onClick={() => setActiveTab(ApartmentId.PRAIA_GRANDE)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === ApartmentId.PRAIA_GRANDE 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {localSettings[ApartmentId.PRAIA_GRANDE].name}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" /> Familiares
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add User Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 h-fit">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">
                {editingUser ? 'Editar Familiar' : 'Adicionar Familiar'}
              </h2>
              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={editingUser ? editingUser.name : newUser.name}
                    onChange={(e) => editingUser ? setEditingUser({...editingUser, name: e.target.value}) : setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Tia Maria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail (Opcional)</label>
                  <input
                    type="email"
                    value={editingUser ? (editingUser.email || '') : newUser.email}
                    onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cor de Identificação</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => editingUser ? setEditingUser({...editingUser, color: c}) : setNewUser({...newUser, color: c})}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${(editingUser ? editingUser.color : newUser.color) === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingUser && (
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {editingUser ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingUser ? 'Salvar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">
                Familiares Cadastrados ({users.length})
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setEditingUser(user)}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: user.color }}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{user.name}</span>
                        {user.email && <span className="text-xs text-slate-400">{user.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Nenhum familiar cadastrado ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
};

export default AdminPage;
