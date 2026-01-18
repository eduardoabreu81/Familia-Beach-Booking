import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { getReservations, saveReservation, deleteReservation, getApartmentSettings, saveApartmentSettings, subscribeToReservations } from './services/firestoreService';
import { sendConfirmationEmail } from './services/emailService';
import { Reservation, ApartmentId, ApartmentSettings } from './types';
import BookingCalendar from './components/BookingCalendar';
import ReservationForm from './components/ReservationForm';
import AdminPage from './components/AdminPage';
import { Palmtree, MapPin, Info } from 'lucide-react';

const App: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<Record<ApartmentId, ApartmentSettings> | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ApartmentId>(ApartmentId.CARAGUA);

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
      const success = await saveReservation(resData);
      if (success && settings) {
        // Send confirmation email
        const apartmentName = settings[resData.apartmentId].name;
        // We don't await this because we don't want to block the UI
        sendConfirmationEmail(resData, apartmentName);
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
      // No need to manually update state, subscription handles it
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
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
          {/* Hero Header */}
          <header className="bg-slate-900 text-white pb-24 pt-10 px-4 sm:px-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 tracking-tight">
                  <Palmtree className="w-10 h-10 text-emerald-400" />
                  Reserva Praia - Clã do Constantino
                </h1>
                <p className="mt-2 text-slate-400 text-lg">
                  Agendamento de estadias para {settings[ApartmentId.CARAGUA].name} e {settings[ApartmentId.PRAIA_GRANDE].name}.
                </p>
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-8 mt-8 space-y-8 relative z-20 w-full">
            
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
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
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
                  <div className="h-48 overflow-hidden relative">
                     <img 
                      key={activeTab}
                      src={settings[activeTab].photoUrl}
                      alt={settings[activeTab].name}
                      className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
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
          <footer className="mt-auto py-8 text-center text-slate-400 text-sm border-t border-slate-200 bg-slate-50">
            <p>&copy; {new Date().getFullYear()} Reserva Praia - Clã do Constantino. Aproveitem as férias!</p>
          </footer>
        </div>
      </Route>
    </Switch>
  );
};

export default App;