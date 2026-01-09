import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Reservation, ApartmentSettings, ApartmentId } from '../types';

const RESERVATIONS_COLLECTION = 'reservations';
const SETTINGS_COLLECTION = 'settings';

export const getReservations = async (): Promise<Reservation[]> => {
  try {
    const snapshot = await getDocs(collection(db, RESERVATIONS_COLLECTION));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Reservation));
  } catch (error) {
    console.error('Error getting reservations:', error);
    return [];
  }
};

export const saveReservation = async (reservation: Reservation): Promise<boolean> => {
  try {
    await addDoc(collection(db, RESERVATIONS_COLLECTION), reservation);
    return true;
  } catch (error) {
    console.error('Error saving reservation:', error);
    return false;
  }
};

export const deleteReservation = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, RESERVATIONS_COLLECTION, id));
};

export const getApartmentSettings = async (): Promise<Record<ApartmentId, ApartmentSettings>> => {
  try {
    const snapshot = await getDocs(collection(db, SETTINGS_COLLECTION));
    const settings: any = {};
    snapshot.docs.forEach(docSnap => {
      settings[docSnap.id] = { ...docSnap.data(), id: docSnap.id };
    });
    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {} as Record<ApartmentId, ApartmentSettings>;
  }
};

export const saveApartmentSettings = async (settings: Record<ApartmentId, ApartmentSettings>): Promise<void> => {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await setDoc(doc(db, SETTINGS_COLLECTION, key), value);
    }
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const seedData = async (): Promise<void> => {
  try {
    const existingSettings = await getApartmentSettings();
    if (Object.keys(existingSettings).length === 0) {
      const defaultSettings: Record<ApartmentId, ApartmentSettings> = {
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
      await saveApartmentSettings(defaultSettings);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
