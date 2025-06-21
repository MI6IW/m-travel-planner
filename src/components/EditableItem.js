import React, { useState, useRef } from "react";
import { SparklesIcon } from "./icons";
import { useAutosizeTextArea } from "../hooks/useAutosizeTextArea";
import PropTypes from "prop-types";
function EditableItem({ item, setItem, onSave, onCancel, isLink, isExpense, apiKey, tripLocation, language, t, model, showNotification }) {
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const textAreaRef = useRef(null);
    useAutosizeTextArea(textAreaRef, item.description);

    const handleGenerateDescription = async () => {
        if (!apiKey) { showNotification(t.enterApiKey, 'error'); return; }
        const itemName = item.text || item.title;
        if (!itemName) { showNotification(t.enterItemName, 'error'); return; }

        setIsGeneratingDesc(true);
        const prompt = `For a trip to ${tripLocation}, write a very short, 1-2 sentence description for the following item: "${itemName}". Reply in ${language}.`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { const err = await response.json(); throw new Error(`API Error: ${err.error.message}`); }
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const generatedDesc = result.candidates[0].content.parts[0].text;
                setItem({ ...item, description: generatedDesc });
            } else {
                throw new Error("AI response was empty.");
            }
        } catch (error) {
            console.error("AI Description Gen Error:", error);
            showNotification(`${t.aiDescriptionError} ${error.message}`, 'error');
        } finally {
            setIsGeneratingDesc(false);
        }
    };

    return (
        <li className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg space-y-3">
             <div className="flex flex-col sm:flex-row gap-2">
                {isLink && <>
                    <input type="text" value={item.title || ''} onChange={e => setItem({...item, title: e.target.value})} placeholder="Title" className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500" />
                    <input type="url" value={item.url || ''} onChange={e => setItem({...item, url: e.target.value})} placeholder="URL" className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500" />
                </>}
                {isExpense && 
                    <input type="text" value={item.text || ''} onChange={e => setItem({...item, text: e.target.value})} placeholder="Expense item" className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500" />
                }
                {!isLink && !isExpense &&
                    <input type="text" value={item.text || ''} onChange={e => setItem({...item, text: e.target.value})} placeholder="Item name" className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500" />
                }
             </div>
             {/* --- FIX #4: Description for Expenses --- */}
             <div>
                <textarea ref={textAreaRef} value={item.description || ''} onChange={e => setItem({...item, description: e.target.value})} placeholder={t.descriptionOptional} rows="1" className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm resize-none overflow-hidden"></textarea>
             </div>
             <div className="flex justify-end items-center gap-2">
                 <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc || !apiKey} className="flex items-center gap-1 text-sm py-1 px-3 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 disabled:opacity-50 mr-auto">
                    <SparklesIcon className={isGeneratingDesc ? 'animate-pulse w-4 h-4' : 'w-4 h-4'} /> {isGeneratingDesc ? '...' : t.ai}
                </button>
                <button onClick={onCancel} className="text-sm py-1 px-3 rounded-md bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500">{t.cancel}</button>
                <button onClick={() => onSave(item)} className="text-sm py-1 px-3 rounded-md bg-gray-700 text-white hover:bg-gray-600">{t.save}</button>
            </div>
        </li>
    );
}

EditableItem.propTypes = {
    item: PropTypes.object.isRequired,
    setItem: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLink: PropTypes.bool,
    isExpense: PropTypes.bool,
    apiKey: PropTypes.string,
    tripLocation: PropTypes.string,
    language: PropTypes.string,
    t: PropTypes.object.isRequired,
    model: PropTypes.string,
    showNotification: PropTypes.func.isRequired,
};

export default EditableItem;
