import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Reservation, ApartmentId, ApartmentSettings, User } from '../types';

const RESERVATIONS_COLLECTION = 'reservations';
const SETTINGS_COLLECTION = 'settings';
const USERS_COLLECTION = 'users';

// Helper to convert Firestore dates to strings if needed, or keep as is
const convertReservation = (doc: any): Reservation => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as Reservation;
};

const convertUser = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as User;
};

// ============================================
// RESERVATIONS
// ============================================

export const subscribeToReservations = (callback: (reservations: Reservation[]) => void) => {
  const q = query(collection(db, RESERVATIONS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const reservations = snapshot.docs.map(convertReservation);
    callback(reservations);
  });
};

export const getReservations = async (): Promise<Reservation[]> => {
  const querySnapshot = await getDocs(collection(db, RESERVATIONS_COLLECTION));
  return querySnapshot.docs.map(convertReservation);
};

export const saveReservation = async (reservation: Omit<Reservation, 'id'>): Promise<boolean> => {
  const q = query(
    collection(db, RESERVATIONS_COLLECTION), 
    where('apartmentId', '==', reservation.apartmentId)
  );
  const snapshot = await getDocs(q);
  const existing = snapshot.docs.map(convertReservation);

  const newStart = new Date(reservation.startDate).getTime();
  const newEnd = new Date(reservation.endDate).getTime();

  const hasOverlap = existing.some(r => {
    const existingStart = new Date(r.startDate).getTime();
    const existingEnd = new Date(r.endDate).getTime();
    return (newStart <= existingEnd && newEnd >= existingStart);
  });

  if (hasOverlap) {
    return false;
  }

  await addDoc(collection(db, RESERVATIONS_COLLECTION), reservation);
  return true;
};

export const deleteReservation = async (id: string) => {
  await deleteDoc(doc(db, RESERVATIONS_COLLECTION, id));
};

// ============================================
// SETTINGS
// ============================================

export const getApartmentSettings = async (): Promise<Record<ApartmentId, ApartmentSettings>> => {
  const querySnapshot = await getDocs(collection(db, SETTINGS_COLLECTION));
  const settings: Record<string, ApartmentSettings> = {};
  
  querySnapshot.forEach((doc) => {
    settings[doc.id] = doc.data() as ApartmentSettings;
  });

  // If empty, return defaults
  if (Object.keys(settings).length === 0) {
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
  }

  return settings as Record<ApartmentId, ApartmentSettings>;
};

export const saveApartmentSettings = async (settings: Record<ApartmentId, ApartmentSettings>) => {
  for (const [key, value] of Object.entries(settings)) {
    await setDoc(doc(db, SETTINGS_COLLECTION, key), value);
  }
};

// ============================================
// USERS (FAMILIARES)
// ============================================

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, USERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(convertUser);
    callback(users);
  });
};

export const getUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
  return querySnapshot.docs.map(convertUser);
};

export const saveUser = async (user: Omit<User, 'id'>): Promise<User> => {
  // Check if user with same name already exists
  const q = query(
    collection(db, USERS_COLLECTION),
    where('name', '==', user.name)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // User exists, return existing
    return convertUser(snapshot.docs[0]);
  }

  // Create new user
  const docRef = await addDoc(collection(db, USERS_COLLECTION), user);
  return {
    id: docRef.id,
    ...user
  };
};

export const updateUser = async (id: string, user: Partial<User>) => {
  await setDoc(doc(db, USERS_COLLECTION, id), user, { merge: true });
};

export const deleteUser = async (id: string) => {
  await deleteDoc(doc(db, USERS_COLLECTION, id));
};


// ============================================
// DATE BLOCKS (Bloqueios de Datas)
// ============================================

const BLOCKS_COLLECTION = 'date_blocks';

export interface DateBlock {
  id: string;
  apartmentId: ApartmentId;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
}

const convertDateBlock = (doc: any): DateBlock => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as DateBlock;
};

export const subscribeToDateBlocks = (callback: (blocks: DateBlock[]) => void) => {
  const q = query(collection(db, BLOCKS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const blocks = snapshot.docs.map(convertDateBlock);
    callback(blocks);
  });
};

export const getDateBlocks = async (): Promise<DateBlock[]> => {
  const querySnapshot = await getDocs(collection(db, BLOCKS_COLLECTION));
  return querySnapshot.docs.map(convertDateBlock);
};

export const saveDateBlock = async (block: Omit<DateBlock, 'id'>): Promise<boolean> => {
  try {
    await addDoc(collection(db, BLOCKS_COLLECTION), block);
    return true;
  } catch (error) {
    console.error('Error saving date block:', error);
    return false;
  }
};

export const deleteDateBlock = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, BLOCKS_COLLECTION, id));
};
