export enum ApartmentId {
  CARAGUA = 'caraguatatuba',
  PRAIA_GRANDE = 'praia_grande'
}

export interface ApartmentSettings {
  id: ApartmentId;
  name: string;
  location: string;
  photoUrl: string;
  rules: string[];
}

export interface Reservation {
  id: string;
  apartmentId: ApartmentId;
  guestName: string;
  email?: string; // Optional email for confirmation
  color: string; // Hex color for the family member
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate: string;   // ISO Date string YYYY-MM-DD
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  color: string;
}



export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}