import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function BaseModal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <motion.div ref={modalRef} initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
