import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, writeBatch, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import TripCard from "../components/TripCard";
import EditTripModal from "../components/EditTripModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { db } from "../firebase/firebase";
import { TrashIcon } from "../components/icons";
function HomeScreen({ userId, onSelectTrip, t }) {
    const [trips, setTrips] = useState([]);
    const [editingTrip, setEditingTrip] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const q = query(collection(db, `users/${userId}/trips`));
        const unsub = onSnapshot(q, (snap) => {
            const tripsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            tripsData.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setTrips(tripsData);
        }, (error) => {
            console.error("Error fetching trips:", error);
        });
        return () => unsub();
    }, [userId]);

    const handleToggleSelect = (tripId) => {
        setSelectedIds(prev => 
            prev.includes(tripId) 
                ? prev.filter(id => id !== tripId)
                : [...prev, tripId]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0 || !userId) return;
        
        setIsConfirmingDelete(false);
        const batch = writeBatch(db);
        selectedIds.forEach(id => {
            const docRef = doc(db, `users/${userId}/trips/${id}`);
            batch.delete(docRef);
        });

        try {
            await batch.commit();
            setSelectedIds([]);
        } catch (error) {
            console.error("Error deleting selected trips: ", error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{t.myTrips}</h2>
                 {selectedIds.length > 0 && (
                     <motion.button 
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        onClick={() => setIsConfirmingDelete(true)}
                        className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-105">
                         <TrashIcon className="w-5 h-5"/>
                         <span>{t.deleteSelected} ({selectedIds.length})</span>
                     </motion.button>
                 )}
            </div>
            
            {trips.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400">{t.adventuresAwait}</p>
                    <p className="text-gray-400 dark:text-gray-500">{t.noTripsPlanned} {t.clickNewTrip}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(trip => 
                        <TripCard 
                            key={trip.id} 
                            trip={trip} 
                            onNavigate={() => onSelectTrip(trip.id)} 
                            onEdit={() => setEditingTrip(trip)} 
                            onSelect={() => handleToggleSelect(trip.id)}
                            isSelected={selectedIds.includes(trip.id)}
                        />
                    )}
                </div>
            )}

            <EditTripModal isOpen={!!editingTrip} onClose={() => setEditingTrip(null)} userId={userId} trip={editingTrip} t={t} />
            
            <ConfirmationModal 
                isOpen={isConfirmingDelete} 
                onClose={() => setIsConfirmingDelete(false)} 
                onConfirm={handleDeleteSelected}
                title={t.deleteSelectedTripsTitle}
                message={t.deleteSelectedTripsMessage}
                t={t}
            />
        </div>
    );
}

export default HomeScreen;
