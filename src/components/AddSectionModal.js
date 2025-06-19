import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import BaseModal from './BaseModal';
import { db } from '../firebase/firebase';

export default function AddSectionModal({ isOpen, onClose, userId, tripId, existingSections, t, showNotification }) {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedName = name.trim().replace(/\s+/g, '_').toLowerCase();
    if (!sanitizedName || existingSections.includes(sanitizedName)) {
      showNotification(t.sectionNameError, 'error');
      return;
    }
    try {
      const tripDocRef = doc(db, `users/${userId}/trips/${tripId}`);
      await updateDoc(tripDocRef, { [`sections.${sanitizedName}`]: [] });
      setName('');
    } catch (error) {
      console.error('Error adding section:', error);
      showNotification('Failed to add section.', 'error');
    } finally {
      onClose();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.addSection}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder={t.sectionNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
          <button type="submit" className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow">{t.create}</button>
        </div>
      </form>
    </BaseModal>
  );
}
