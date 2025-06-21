import React, { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import EditTripModal from "../components/EditTripModal";
import AddSectionModal from "../components/AddSectionModal";
import { db } from "../firebase/firebase";
import { ArrowLeftIcon, SuitcaseIcon, CameraIcon, LinkIcon, WalletIcon, PlusIcon, FolderPlusIcon, EditIcon, MapPinIcon, CalendarIcon } from "../components/icons";
import PropTypes from "prop-types";
function TripScreen({ userId, tripId, onSelectSection, onBack, t, showNotification }) {
    const [trip, setTrip] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

    useEffect(() => {
        if (!userId || !tripId) return;
        const unsub = onSnapshot(doc(db, `users/${userId}/trips/${tripId}`), (doc) => {
            doc.exists() ? setTrip({ id: doc.id, ...doc.data() }) : onBack();
        }, (error) => {
            console.error("Error fetching trip:", error);
            onBack();
        });
        return () => unsub();
    }, [userId, tripId, onBack]);

    if (!trip) return <div className="flex items-center justify-center h-screen">{t.loadingTrip}</div>;

    const defaultSections = {
        thingsToTake: { title: t.thingsToTake, icon: <SuitcaseIcon /> },
        placesToVisit: { title: t.placesToVisit, icon: <CameraIcon /> },
        usefulLinks: { title: t.usefulLinks, icon: <LinkIcon /> },
        expenses: { title: t.expenses, icon: <WalletIcon /> },
    };

    const tripSections = trip.sections ? Object.keys(trip.sections) : [];

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <header style={{ borderLeft: `8px solid ${trip.color}` }} className="pl-4 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:underline mb-4">
                            <ArrowLeftIcon /> {t.backToAllTrips}
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{trip.name}</h1>
                        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 mt-2">
                            <span className="flex items-center gap-2"><MapPinIcon /> {trip.location}</span>
                            {trip.date && <span className="flex items-center gap-2"><CalendarIcon /> {new Date(trip.date).toLocaleDateString()}</span>}
                        </div>
                    </div>
                    <button onClick={() => setIsEditModalOpen(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tripSections.map(sectionId => {
                    const sectionConfig = defaultSections[sectionId] || { title: sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), icon: <FolderPlusIcon /> };
                    const items = trip.sections[sectionId] || [];
                    const count = items.filter(item => !item.completed).length;
                    return (
                       <motion.button key={sectionId} onClick={() => onSelectSection(sectionId)} whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }}
                            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md text-left flex items-center gap-4">
                            <div className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">{sectionConfig.icon}</div>
                            <div className="flex-1"><h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">{sectionConfig.title}</h2></div>
                            {count > 0 && (
                                <span className="font-bold text-gray-500 dark:text-gray-400 text-lg">
                                    {count}
                                </span>
                            )}
                        </motion.button>
                    )})}
                   <motion.button onClick={() => setIsAddSectionModalOpen(true)} whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }}
                        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md text-left flex items-center gap-4 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400">
                        <div className="text-gray-400 dark:text-gray-500 p-3 rounded-lg"> <PlusIcon className="w-6 h-6"/> </div>
                        <div><h2 className="text-xl font-bold text-gray-400 dark:text-gray-500">{t.addSection}</h2></div>
                    </motion.button>
            </div>
            <EditTripModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} userId={userId} trip={trip} t={t} />
            <AddSectionModal isOpen={isAddSectionModalOpen} onClose={() => setIsAddSectionModalOpen(false)} userId={userId} tripId={tripId} existingSections={tripSections} t={t} showNotification={showNotification}/>
        </div>
    );
}

export default TripScreen;

TripScreen.propTypes = {
    userId: PropTypes.string.isRequired,
    tripId: PropTypes.string.isRequired,
    onSelectSection: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    t: PropTypes.object.isRequired,
    showNotification: PropTypes.func.isRequired,
};
