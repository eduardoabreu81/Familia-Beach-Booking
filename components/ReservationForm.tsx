import React, { useState, useEffect } from 'react';
import { ApartmentId, Reservation, ApartmentSettings, User as UserType } from '../types';
import { getUsers, saveUser } from '../services/storageService';
import { Calendar as CalendarIcon, User, FileText, CheckCircle, AlertCircle, Palette, Mail, Plus } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface ReservationFormProps {
  settings: Record<ApartmentId, ApartmentSettings>;
  onSubmit: (res: Omit<Reservation, 'id'>) => Promise<boolean>;
  initialData?: Reservation | null;
  onCancelEdit?: () => void;
}

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#64748b'  // Slate
];

const ReservationForm: React.FC<ReservationFormProps> = ({ settings, onSubmit, initialData, onCancelEdit }) => {
  const [apartmentId, setApartmentId] = useState<ApartmentId>(ApartmentId.CARAGUA);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [color, setColor] = useState(COLORS[6]); // Default Blue
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    if (initialData) {
      setApartmentId(initialData.apartmentId);
      setGuestName(initialData.guestName);
      setEmail(initialData.email || '');
      setColor(initialData.color);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setNotes(initialData.notes || '');
      
      // Try to match with existing user
      const existingUser = users.find(u => u.name === initialData.guestName);
      if (existingUser) {
        setSelectedUserId(existingUser.id);
        setIsNewUser(false);
      } else {
        setSelectedUserId('new');
        setIsNewUser(true);
      }
    }
  }, [initialData, users]);

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    
    if (userId === 'new') {
      setIsNewUser(true);
      setGuestName('');
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    } else {
      setIsNewUser(false);
      const user = users.find(u => u.id === userId);
      if (user) {
        setGuestName(user.name);
        setColor(user.color);
        if (user.email) setEmail(user.email);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'Selecione as datas de entrada e saída.' });
      return;
    }

    if (startDate > endDate) {
      setMessage({ type: 'error', text: 'A data de saída deve ser posterior à entrada.' });
      return;
    }

    // Save new user if applicable
    if (isNewUser && guestName) {
      const newUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        name: guestName,
        email: email,
        color: color
      };
      saveUser(newUser);
      setUsers(getUsers()); // Refresh list
    }

    // If editing, we might want to update the user's email if it changed
    if (!isNewUser && selectedUserId && email) {
      const user = users.find(u => u.id === selectedUserId);
      if (user && user.email !== email) {
        saveUser({ ...user, email });
        setUsers(getUsers());
      }
    }

    const success = await onSubmit({
      apartmentId,
      guestName,
      email,
      color,
      startDate,
      endDate,
      notes
    });

    if (success) {
      // Send email notification if email is provided
      if (email) {
        // Note: These are placeholder IDs. You need to create an account at emailjs.com
        // and replace these with your actual Service ID, Template ID, and Public Key.
        const templateParams = {
          to_email: email,
          guest_name: guestName,
          apartment_name: settings[apartmentId].name,
          start_date: new Date(startDate).toLocaleDateString('pt-BR'),
          end_date: new Date(endDate).toLocaleDateString('pt-BR'),
          notes: notes
        };

        // Uncomment and configure to enable real emails
        // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY')
        //   .then((response) => {
        //      console.log('SUCCESS!', response.status, response.text);
        //   }, (err) => {
        //      console.log('FAILED...', err);
        //   });
      }

      setMessage({ type: 'success', text: 'Reserva realizada com sucesso!' });
      setGuestName('');
      setEmail('');
      setStartDate('');
      setEndDate('');
      setNotes('');
      // Keep apartment and color as is, or reset if preferred
    } else {
      setMessage({ type: 'error', text: 'Conflito de datas! Já existe uma reserva neste período para este apartamento.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-blue-600" />
        {initialData ? 'Editar Reserva' : 'Nova Reserva'}
      </h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Local</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setApartmentId(ApartmentId.CARAGUA)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all text-center
                ${apartmentId === ApartmentId.CARAGUA
                  ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {settings[ApartmentId.CARAGUA].name}
            </button>
            <button
              type="button"
              onClick={() => setApartmentId(ApartmentId.PRAIA_GRANDE)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all text-center
                ${apartmentId === ApartmentId.PRAIA_GRANDE
                  ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {settings[ApartmentId.PRAIA_GRANDE].name}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Familiar</label>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedUserId}
                onChange={handleUserSelect}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="" disabled>Selecione quem está reservando</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
                <option value="new">+ Novo Familiar</option>
              </select>
            </div>

            {isNewUser && (
              <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Novo Familiar</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ex: Primo André"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">E-mail (Opcional)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Para receber confirmação"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {isNewUser && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" />
              Escolha sua Cor (Será salva para próximas reservas)
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Selecionar cor ${c}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chegada</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Saída</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Algum aviso especial?"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="flex gap-2">
          {initialData && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-all"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
          >
            {initialData ? 'Salvar Alterações' : 'Agendar Estadia'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReservationForm;