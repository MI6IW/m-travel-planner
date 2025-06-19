import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, CircleIcon, EditIcon, TrashIcon } from "./icons";
function ListItem({ item, onEdit, onDelete, onToggleComplete, isLink }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <li className={`p-3 rounded-lg group transition-colors ${item.completed ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden flex-1" >
                    <button onClick={(e) => { e.stopPropagation(); onToggleComplete(); }} className="shrink-0 focus:outline-none">
                        {item.completed ? 
                            <CheckCircleIcon className="w-6 h-6 text-green-500" /> : 
                            <CircleIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        }
                    </button>
                    <div className="flex-1 truncate cursor-pointer" onClick={() => item.description && setIsExpanded(!isExpanded)}>
                        {isLink ? <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()} className={`text-blue-600 dark:text-blue-400 hover:underline ${item.completed ? 'line-through' : ''}`}>{item.title}</a>
                        : <span className={`${item.completed ? 'text-green-600 dark:text-green-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{item.text}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <AnimatePresence>
                {isExpanded && item.description && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="pt-2 mt-2 ml-9 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {item.description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    );
}

function EditableItem({ item, setItem, onSave, onCancel, isLink, isExpense, apiKey, tripLocation, language, t, model, showNotification }) {
export default ListItem;
