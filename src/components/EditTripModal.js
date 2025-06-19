import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import BaseModal from './BaseModal';
import { db } from '../firebase/firebase';
import { COLORS } from '../constants/colors';

export default function EditTripModal({ isOpen, onClose, userId, trip, t }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (trip) {
      setName(trip.name || '');
      setLocation(trip.location || '');
      setDate(trip.date ? new Date(trip.date).toISOString().split('T')[0] : '');
      setColor(trip.color || COLORS[0]);
    }
  }, [trip, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !location || !date || !userId || !trip?.id) return;
    setTimeout(() => onClose(), 100);
    const tripDocRef = doc(db, `users/${userId}/trips/${trip.id}`);
    updateDoc(tripDocRef, { name, location, date, color }).catch((error) => {
      console.error('Error updating trip:', error);
    });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.editTrip}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder={t.tripNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
        <input type="text" placeholder={t.locationPlaceholder} value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
        <div>
          <label className="text-gray-600 dark:text-gray-300">{t.tripColor}</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className="w-8 h-8 rounded-full transition-transform transform hover:scale-110" style={{ backgroundColor: c, border: color === c ? '3px solid #6B7280' : '3px solid transparent' }}></button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
          <button type="submit" className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow">{t.save}</button>
        </div>
      </form>
    </BaseModal>
  );
}
