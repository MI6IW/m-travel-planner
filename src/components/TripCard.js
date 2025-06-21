import React from 'react';
import PropTypes from 'prop-types';
import { MapPinIcon, CalendarIcon, EditIcon, CheckCircleIcon, CircleIcon } from './icons';

export default function TripCard({ trip, onNavigate, onEdit, onSelect, isSelected }) {
  return (
    <div className="relative group">
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? 'ring-4 ring-blue-500' : 'ring-0'}`}
        style={{ borderTop: `8px solid ${trip.color}` }}
      >
        <div onClick={onNavigate} className="p-6 w-full">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 truncate">{trip.name}</h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1"><MapPinIcon /> <span className="ml-2 truncate">{trip.location}</span></div>
          {trip.date && <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm"><CalendarIcon /> <span className="ml-2">{new Date(trip.date).toLocaleDateString()}</span></div>}
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 bg-gray-200/50 dark:bg-gray-900/50 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon className="w-4 h-4" /></button>
        <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="p-2 bg-gray-200/50 dark:bg-gray-900/50 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
          {isSelected ? <CheckCircleIcon className="w-6 h-6 text-blue-500" /> : <CircleIcon className="w-6 h-6 text-gray-400" />}
        </button>
      </div>
    </div>
  );
}

TripCard.propTypes = {
  trip: PropTypes.object.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};
