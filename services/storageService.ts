import { Reservation, ApartmentId, ApartmentSettings, User } from '../types';

const STORAGE_KEY = 'family_beach_bookings_v3';
const SETTINGS_KEY = 'family_beach_settings_v3';
const USERS_KEY = 'family_beach_users_v3';

export const getReservations = (): Reservation[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse bookings", e);
    return [];
  }
};

export const saveReservation = (reservation: Reservation): boolean => {
  const current = getReservations();
  
  // Check for overlap
  const hasOverlap = current.some(r => {
    if (r.apartmentId !== reservation.apartmentId) return false;
    
    // Allow updating/saving the same reservation if editing (future feature), 
    // but for now we treat all saves as new entries or we rely on ID check if we implemented edit.
    // Assuming simple add mode:
    
    const newStart = new Date(reservation.startDate).getTime();
    const newEnd = new Date(reservation.endDate).getTime();
    const existingStart = new Date(r.startDate).getTime();
    const existingEnd = new Date(r.endDate).getTime();

    // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
    return (newStart <= existingEnd && newEnd >= existingStart);
  });

  if (hasOverlap) {
    return false;
  }

  const updated = [...current, reservation];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return true;
};

export const deleteReservation = (id: string) => {
  const current = getReservations();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getApartmentSettings = (): Record<ApartmentId, ApartmentSettings> => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Defaults
  return {
    [ApartmentId.CARAGUA]: {
      id: ApartmentId.CARAGUA,
      name: 'Apto Caraguatatuba',
      location: 'Caraguatatuba, SP',
      mapLink: 'https://maps.google.com/?q=Caraguatatuba,SP',
      photoUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
      rules: ['Check-in após as 14h', 'Levar roupa de cama', 'Proibido som alto após 22h']
    },
    [ApartmentId.PRAIA_GRANDE]: {
      id: ApartmentId.PRAIA_GRANDE,
      name: 'Apto Praia Grande',
      location: 'Praia Grande, SP',
      mapLink: 'https://maps.google.com/?q=Praia+Grande,SP',
      photoUrl: 'https://images.unsplash.com/photo-1520483601560-389dff434fdf?auto=format&fit=crop&q=80&w=800',
      rules: ['Check-out até as 12h', 'Não aceita pets', 'Recolher o lixo na saída']
    }
  };
};

export const saveApartmentSettings = (settings: Record<ApartmentId, ApartmentSettings>) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse users", e);
    return [];
  }
};

export const saveUser = (user: User) => {
  const current = getUsers();
  const exists = current.find(u => u.name.toLowerCase() === user.name.toLowerCase());
  
  if (!exists) {
    const updated = [...current, user];
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return user;
  }
  return exists;
};

// Seed some data if empty
export const seedData = () => {
  if (localStorage.getItem(STORAGE_KEY)) return;
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const seed: Reservation[] = [
    {
      id: 'seed-1',
      apartmentId: ApartmentId.CARAGUA,
      guestName: 'Tio João',
      color: '#ef4444', // Red
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      notes: 'Limpem a churrasqueira!'
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
};