import { Reservation, ApartmentSettings, ApartmentId } from '../types';

// Mock data storage
let mockReservations: Reservation[] = [];
let mockSettings: Record<ApartmentId, ApartmentSettings> = {
  [ApartmentId.CARAGUA]: {
    id: ApartmentId.CARAGUA,
    name: 'Caraguatatuba',
    location: 'Caraguatatuba, SP - Brasil',
    photoUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    rules: [
      'Check-in: 14h | Check-out: 12h',
      'Máximo 6 pessoas',
      'Não permitido animais',
      'Silêncio após 22h'
    ]
  },
  [ApartmentId.PRAIA_GRANDE]: {
    id: ApartmentId.PRAIA_GRANDE,
    name: 'Praia Grande',
    location: 'Praia Grande, SP - Brasil',
    photoUrl: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800',
    rules: [
      'Check-in: 15h | Check-out: 11h',
      'Máximo 8 pessoas',
      'Pet friendly (consultar)',
      'Respeitar condomínio'
    ]
  }
};

export const getReservations = async (): Promise<Reservation[]> => {
  return [...mockReservations];
};

export const saveReservation = async (reservation: Reservation): Promise<boolean> => {
  mockReservations.push(reservation);
  return true;
};

export const deleteReservation = async (id: string): Promise<void> => {
  mockReservations = mockReservations.filter(r => r.id !== id);
};

export const getApartmentSettings = async (): Promise<Record<ApartmentId, ApartmentSettings>> => {
  return { ...mockSettings };
};

export const saveApartmentSettings = async (settings: Record<ApartmentId, ApartmentSettings>): Promise<void> => {
  mockSettings = { ...settings };
};

export const seedData = async (): Promise<void> => {
  // No-op for mock service
};
