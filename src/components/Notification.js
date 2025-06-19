import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangleIcon, InfoIcon, CheckCircleIcon, PlusIcon } from "./icons";
function Notification({ notification, onClear }) {
    const { message, type } = notification || {};
    
    const colors = {
      info: 'bg-blue-500',
      error: 'bg-red-500',
      success: 'bg-green-500',
    };

    return (
        <div className="fixed top-20 right-4 z-50 w-full max-w-sm">
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`relative flex items-center gap-4 p-4 rounded-lg text-white shadow-lg ${colors[type] || 'bg-gray-800'}`}
                >
                    <div className="shrink-0">
                      {type === 'error' && <AlertTriangleIcon/>}
                      {type === 'info' && <InfoIcon/>}
                      {type === 'success' && <CheckCircleIcon className="text-white"/>}
                    </div>
                    <div className="flex-1">{message}</div>
                    <button onClick={onClear} className="p-1 rounded-full hover:bg-black/20">
                      <PlusIcon className="w-5 h-5 rotate-45"/>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
        </div>
    );
}
export default Notification;
