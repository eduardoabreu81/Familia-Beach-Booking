import React, { useState, useEffect } from 'react';
import { getReservations, saveReservation, deleteReservation, seedData, getApartmentSettings, saveApartmentSettings } from './services/storageService';
import { Reservation, ApartmentId, ApartmentSettings } from './types';
import BookingCalendar from './components/BookingCalendar';
import ReservationForm from './components/ReservationForm';
import ConciergeAI from './components/ConciergeAI';
import AdminPanel from './components/AdminPanel';
import { Palmtree, MapPin, Info, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<Record<ApartmentId, ApartmentSettings> | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    seedData(); 
    setReservations(getReservations());
    setSettings(getApartmentSettings());
  }, []);

  const handleNewReservation = (resData: Omit<Reservation, 'id'>) => {
    const newRes: Reservation = {
      ...resData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const success = saveReservation(newRes);
    if (success) {
      setReservations(getReservations());
      return true;
    }
    return false;
  };

  const handleUpdateSettings = (newSettings: Record<ApartmentId, ApartmentSettings>) => {
    saveApartmentSettings(newSettings);
    setSettings(newSettings);
  };

  const handleDeleteReservation = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      deleteReservation(id);
      setReservations(getReservations());
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  if (!settings) return null; // Loading state

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Hero Header */}
      <header className="bg-slate-900 text-white pb-24 pt-10 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 tracking-tight">
              <Palmtree className="w-10 h-10 text-emerald-400" />
              Família Beach Booking
            </h1>
            <p className="mt-2 text-slate-400 text-lg">
              Agendamento de estadias para {settings[ApartmentId.CARAGUA].name} e {settings[ApartmentId.PRAIA_GRANDE].name}.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 -mt-16 space-y-8 relative z-20">
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Calendar (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <BookingCalendar 
              reservations={reservations}
              settings={settings}
              currentDate={currentDate}
              onNextMonth={nextMonth}
              onPrevMonth={prevMonth}
            />
            
            {/* Rules Cards (Side by Side) */}
            <div className="grid sm:grid-cols-2 gap-4">
               {[ApartmentId.CARAGUA, ApartmentId.PRAIA_GRANDE].map(aptId => (
                 <div key={aptId} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Info className="w-4 h-4 text-blue-500" /> {settings[aptId].name}
                    </h3>
                    <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                      {settings[aptId].rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                 </div>
               ))}
            </div>
          </div>

          {/* Right Column: Booking Form & Info */}
          <div className="space-y-6">
            <ReservationForm settings={settings} onSubmit={handleNewReservation} />
            
            {/* Mini Location Card - Dynamic */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group">
              <div className="h-32 overflow-hidden relative">
                 <img 
                  src={settings[ApartmentId.CARAGUA].photoUrl}
                  alt={settings[ApartmentId.CARAGUA].name}
                  className="w-1/2 h-full object-cover float-left transition-transform duration-700 group-hover:scale-110"
                />
                <img 
                  src={settings[ApartmentId.PRAIA_GRANDE].photoUrl}
                  alt={settings[ApartmentId.PRAIA_GRANDE].name}
                  className="w-1/2 h-full object-cover float-left transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Localizações</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {settings[ApartmentId.CARAGUA].location}<br/>
                      {settings[ApartmentId.PRAIA_GRANDE].location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer / Admin Toggle */}
      <footer className="mt-20 py-8 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>&copy; {new Date().getFullYear()} Família Beach Booking. Aproveitem as férias!</p>
        <button 
          onClick={() => setIsAdminOpen(true)}
          className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <SettingsIcon className="w-3 h-3" /> Área Admin
        </button>
      </footer>

      <ConciergeAI />
      
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        reservations={reservations}
        onUpdateSettings={handleUpdateSettings}
        onDeleteReservation={handleDeleteReservation}
      />
    </div>
  );
};

export default App;