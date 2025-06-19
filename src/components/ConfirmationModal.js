import React from 'react';
import BaseModal from './BaseModal';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, t }) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end gap-4">
        <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
        <button onClick={onConfirm} className="py-2 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow">{t.delete}</button>
      </div>
    </BaseModal>
  );
}
