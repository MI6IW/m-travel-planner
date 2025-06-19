import React, { useState, useEffect } from "react";
import { onSnapshot, updateDoc, doc } from "firebase/firestore";
import SectionDetail from "../components/SectionDetail";
import { db } from "../firebase/firebase";
import { ArrowLeftIcon } from "../components/icons";
function SectionScreen({ userId, tripId, sectionId, onBack, apiKey, language, t, model, showNotification }) {
    const [trip, setTrip] = useState(null);
    useEffect(() => {
        if (!userId || !tripId) return;
        const unsub = onSnapshot(doc(db, `users/${userId}/trips/${tripId}`), (doc) => {
            doc.exists() ? setTrip({ id: doc.id, ...doc.data() }) : onBack();
        });
        return () => unsub();
    }, [userId, tripId, onBack]);

    const updateTripSection = async (updatedItems) => {
        if (!trip) return;
        try { await updateDoc(doc(db, `users/${userId}/trips/${tripId}`), { [`sections.${sectionId}`]: updatedItems }); }
        catch (error) { console.error("Error updating section:", error); }
    };

    if (!trip) return <div className="flex items-center justify-center h-screen">{t.loadingSection}</div>;
    
    const getTitleFromId = (id) => id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const sectionTitle = {
        thingsToTake: t.thingsToTake,
        placesToVisit: t.placesToVisit,
        usefulLinks: t.usefulLinks,
        expenses: t.expenses
    }[sectionId] || getTitleFromId(sectionId);

    const isLink = sectionId === 'usefulLinks';
    const isExpense = sectionId === 'expenses';

    const aiPrompt = `Generate a JSON array of 3 objects for the topic "${sectionTitle}" for a trip to ${trip.location}. Reply in ${language}.
    - If the topic is about links, each object must have "title" (short name) and "url".
    - If it's about expenses, each object must have one key: "text" (a single, concise word, 1-2 words MAXIMUM, e.g., "Flights", "Food", "Hotels").
    - For all other topics, each object must have only one key: "text" (a short name, 2-3 words max).`;

    const aiSchema = isLink ? 
        { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" }, url: { type: "STRING" } }}} :
        { type: "ARRAY", items: { type: "OBJECT", properties: { text: { type: "STRING" }}}}

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
             <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:underline mb-8">
                <ArrowLeftIcon /> {t.backToTripOverview}
            </button>
            <SectionDetail key={sectionId} title={sectionTitle} items={trip.sections?.[sectionId] || []} placeholder={t.thingsToTakePlaceholder}
                updateSectionItems={updateTripSection} isLink={isLink} isExpense={isExpense} sectionId={sectionId}
                apiKey={apiKey} aiPrompt={aiPrompt} aiSchema={aiSchema} tripLocation={trip.location} language={language} t={t} model={model} showNotification={showNotification}/>
        </div>
    );
}

// --- Компоненты ---
export default SectionScreen;
