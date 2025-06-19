import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import BaseModal from './BaseModal';
import { db } from '../firebase/firebase';
import { COLORS } from '../constants/colors';

export default function AddTripModal({ isOpen, onClose, userId, t }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !location || !date || !userId) return;
    setTimeout(() => onClose(), 100);
    addDoc(collection(db, `users/${userId}/trips`), {
      name,
      location,
      date,
      color,
      createdAt: serverTimestamp(),
      sections: { thingsToTake: [], placesToVisit: [], usefulLinks: [], expenses: [] },
    }).then(() => {
      setName('');
      setLocation('');
      setDate('');
      setColor(COLORS[0]);
    }).catch((error) => {
      console.error('Error adding trip:', error);
    });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.createANewTrip}</h2>
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
          <button type="submit" className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow">{t.create}</button>
        </div>
      </form>
    </BaseModal>
  );
}
