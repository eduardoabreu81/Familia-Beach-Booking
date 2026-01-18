import emailjs from '@emailjs/browser';
import { Reservation, ApartmentSettings } from '../types';

// These should be in .env, but for EmailJS client-side it's often public key.
// We will ask user to provide these in the .env file.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendConfirmationEmail = async (
  reservation: Omit<Reservation, 'id'>, 
  apartmentName: string
) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS keys missing. Skipping email.");
    return;
  }

  const templateParams = {
    to_name: reservation.guestName,
    apartment_name: apartmentName,
    start_date: new Date(reservation.startDate).toLocaleDateString('pt-BR'),
    end_date: new Date(reservation.endDate).toLocaleDateString('pt-BR'),
    notes: reservation.notes || 'Nenhuma observação.',
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
