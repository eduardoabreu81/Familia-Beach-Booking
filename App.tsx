import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { getReservations, saveReservation, deleteReservation, getApartmentSettings, saveApartmentSettings, subscribeToReservations } from './services/firestoreService';
import { sendConfirmationEmail } from './services/emailService';
import { Reservation, ApartmentId, ApartmentSettings } from './types';
import BookingCalendar from './components/BookingCalendar';
import ReservationForm from './components/ReservationForm';
import AdminPage from './components/AdminPage';
import ReservationSummary from './components/ReservationSummary';
import { Palmtree, MapPin, Info, List } from 'lucide-react';

const App: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<Record<ApartmentId, ApartmentSettings> | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ApartmentId>(ApartmentId.CARAGUA);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  useEffect(() => {
    // Initial load
    const loadData = async () => {
      const loadedSettings = await getApartmentSettings();
      setSettings(loadedSettings);
    };
    loadData();

    // Real-time subscription for reservations
    const unsubscribe = subscribeToReservations((updatedReservations) => {
      setReservations(updatedReservations);
    });

    return () => unsubscribe();
  }, []);

  const handleNewReservation = async (resData: Omit<Reservation, 'id'>) => {
    try {
      if (editingReservation) {
        await deleteReservation(editingReservation.id);
      }

      const success = await saveReservation(resData);
      
      if (success) {
        if (settings) {
          const apartmentName = settings[resData.apartmentId].name;
          sendConfirmationEmail(resData, apartmentName);
        }
        setEditingReservation(null);
      }
      return success;
    } catch (error) {
      console.error("Error saving reservation:", error);
      alert("Erro ao salvar reserva. Tente novamente.");
      return false;
    }
  };

  const handleUpdateSettings = async (newSettings: Record<ApartmentId, ApartmentSettings>) => {
    await saveApartmentSettings(newSettings);
    setSettings(newSettings);
  };

  const handleDeleteReservation = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      await deleteReservation(id);
    }
  };

  const handleEditReservation = (res: Reservation) => {
    setEditingReservation(res);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  if (!settings) return null;

  // Cores dinâmicas por apartamento
  const apartmentTheme = {
    [ApartmentId.CARAGUA]: {
      gradient: 'from-blue-900 via-blue-800 to-slate-900',
      accentColor: 'emerald-400',
      bgOverlay: 'bg-blue-900/10'
    },
    [ApartmentId.PRAIA_GRANDE]: {
      gradient: 'from-cyan-900 via-teal-800 to-slate-900',
      accentColor: 'amber-400',
      bgOverlay: 'bg-cyan-900/10'
    }
  };

  const currentTheme = apartmentTheme[activeTab];

  return (
    <Switch>
      <Route path="/admin">
        <AdminPage 
          settings={settings}
          reservations={reservations}
          onUpdateSettings={handleUpdateSettings}
          onDeleteReservation={handleDeleteReservation}
        />
      </Route>
      
      <Route path="/">
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative">
          {/* Background Image - Dynamic */}
          <div 
            key={activeTab}
            className="fixed inset-0 z-0 transition-opacity duration-700 animate-in fade-in"
            style={{
              backgroundImage: `url('${settings[activeTab].photoUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          >
            <div className={`absolute inset-0 ${currentTheme.bgOverlay} backdrop-blur-sm`}></div>
          </div>

          {/* Hero Header with Gradient and Mascot */}
          <header className={`bg-gradient-to-r ${currentTheme.gradient} text-white pb-24 pt-10 px-4 sm:px-8 relative overflow-hidden z-10 transition-all duration-500`}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Mascote */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden lg:block animate-in slide-in-from-left duration-700">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030041171/BDQTvbxHHUYTIbip.png" 
                  alt="Mascote Reserva Praia" 
                  className="w-32 h-32 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center justify-center md:justify-start gap-3 tracking-tight">
                  <Palmtree className={`w-10 h-10 text-${currentTheme.accentColor} animate-in slide-in-from-left duration-500`} />
                  Reserva Praia - Clã do Constantino
                </h1>
                <p className="mt-2 text-slate-300 text-lg">
                  Agendamento de estadias para {settings[ApartmentId.CARAGUA].name} e {settings[ApartmentId.PRAIA_GRANDE].name}.
                </p>
              </div>
              
              <button
                onClick={() => setIsSummaryOpen(true)}
                className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2 font-medium border border-white/20 shadow-lg hover:shadow-xl"
              >
                <List className="w-5 h-5" />
                Ver Lista de Reservas
              </button>
            </div>

            {/* Mascote Mobile - Abaixo do título */}
            <div className="lg:hidden flex justify-center mt-6 animate-in fade-in duration-500">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030041171/BDQTvbxHHUYTIbip.png" 
                alt="Mascote Reserva Praia" 
                className="w-24 h-24 object-contain drop-shadow-2xl"
              />
            </div>
          </header>

          <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-8 mt-8 mb-12 space-y-8 relative z-20 w-full">
            
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column: Calendar (Span 2) */}
              <div className="lg:col-span-2">
                <BookingCalendar 
                  reservations={reservations}
                  settings={settings}
                  currentDate={currentDate}
                  onNextMonth={nextMonth}
                  onPrevMonth={prevMonth}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onEditReservation={handleEditReservation}
                  onDeleteReservation={handleDeleteReservation}
                />
              </div>

              {/* Right Column: Booking Form & Info */}
              <div className="space-y-6">
                <ReservationForm 
                  settings={settings} 
                  onSubmit={handleNewReservation} 
                  initialData={editingReservation}
                  onCancelEdit={() => setEditingReservation(null)}
                />
                
                {/* Rules Card - Only Selected Apartment */}
                <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Info className="w-4 h-4 text-blue-500" /> Regras - {settings[activeTab].name}
                  </h3>
                  <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                    {settings[activeTab].rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Mini Location Card - Dynamic */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                  <div className="h-48 overflow-hidden relative">
                     <img 
                      key={activeTab}
                      src={settings[activeTab].photoUrl}
                      alt={settings[activeTab].name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 animate-in fade-in"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                      <h3 className="text-white font-bold text-lg shadow-sm">{settings[activeTab].name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-800">Localização</h4>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings[activeTab].location)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-slate-500 mt-1 mb-2 hover:text-blue-600 hover:underline block transition-colors"
                          title="Clique para abrir no mapa"
                        >
                          {settings[activeTab].location}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>

          {/* Footer */}
          <footer className="mt-auto py-8 text-center text-slate-600 text-sm border-t border-slate-300 bg-white/80 backdrop-blur-sm relative z-10">
            <p>&copy; {new Date().getFullYear()} Reserva Praia - Clã do Constantino. Aproveitem as férias!</p>
          </footer>

          <ReservationSummary 
            isOpen={isSummaryOpen} 
            onClose={() => setIsSummaryOpen(false)} 
            reservations={reservations}
            settings={settings}
          />
        </div>
      </Route>
    </Switch>
  );
};

export default App;
