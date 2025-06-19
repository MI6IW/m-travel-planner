import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, SparklesIcon } from "./icons";
import ListItem from "./ListItem";
import EditableItem from "./EditableItem";
function SectionDetail({ title, items, placeholder, updateSectionItems, isLink = false, isExpense = false, apiKey, aiPrompt, aiSchema, tripLocation, language, t, model, showNotification }) {
    const [inputValue, setInputValue] = useState('');
    const [inputValue2, setInputValue2] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!inputValue) return;
        let newItem = { id: crypto.randomUUID(), description: inputDescription, completed: false };
        if (isLink) { newItem.title = inputValue; newItem.url = inputValue2 || '#'; }
        else { newItem.text = inputValue; }
        updateSectionItems([...items, newItem]);
        setInputValue(''); setInputValue2(''); setInputDescription('');
    };

    const handleUpdateItem = (updatedItem) => {
        updateSectionItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
        setEditingItem(null);
    };

    const handleDeleteItem = (itemId) => updateSectionItems(items.filter(item => item.id !== itemId));
    
    const handleAiSuggest = async () => {
        if (!apiKey) { showNotification(t.enterApiKey, 'error'); return; }
        setIsGenerating(true);
        const existingItemsString = items.map(i => i.text || i.title || i.item).join(', ');
        const fullAiPrompt = `${aiPrompt} ${existingItemsString ? `Do not suggest any of the following items: ${existingItemsString}.` : ''}`;

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: fullAiPrompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: aiSchema } };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { const err = await response.json(); throw new Error(`API Error: ${err.error.message}`); }
            const result = await response.json();
            if (!result.candidates?.[0]?.content?.parts?.[0]?.text) { throw new Error("AI response is empty."); }
            
            let jsonText = result.candidates[0].content.parts[0].text;
            let generatedItems;
            try {
                const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    jsonText = jsonMatch[1];
                }
                generatedItems = JSON.parse(jsonText);
            } catch (parseError) {
                console.error("AI Gen Error - JSON Parse Failed:", parseError, "Original text:", jsonText);
                throw new Error(t.unexpectedFormat);
            }

            if (!Array.isArray(generatedItems)) throw new Error("AI response not an array.");
            
            const newItems = generatedItems.map(item => {
                let newItemData = { description: '' };
                if (isLink) { newItemData.title = item.title; newItemData.url = item.url; }
                else { newItemData.text = item.text || item.item; }
                return { ...newItemData, id: crypto.randomUUID(), completed: false };
            });

            const validNewItems = newItems.filter(item => isLink ? item.title && item.url : item.text);
            if(validNewItems.length > 0) updateSectionItems([...items, ...validNewItems]);
            else showNotification(t.unexpectedFormat, 'error');
        } catch (error) { 
            console.error("AI Gen Error:", error); 
            showNotification(`${t.aiSuggestError} ${error.message}`, 'error'); 
        } finally { 
            setIsGenerating(false); 
        }
    };
    
    const toggleItemComplete = (item) => handleUpdateItem({ ...item, completed: !item.completed });

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{title}</h2>
                <button onClick={handleAiSuggest} disabled={isGenerating || !apiKey} className="flex items-center gap-2 text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold py-1 px-3 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
                    <SparklesIcon className={isGenerating ? 'animate-pulse' : ''}/> {isGenerating ? t.generating : t.aiSuggest}
                </button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-2 mb-4">
                 <div className="flex gap-2">
                    <div className="flex-grow flex gap-2">
                       <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder={placeholder} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" />
                       {isLink && <input type="url" value={inputValue2} onChange={e => setInputValue2(e.target.value)} placeholder="URL" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" />}
                    </div>
                    <button type="submit" className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 shrink-0"><PlusIcon className="w-6 h-6"/></button>
                </div>
                {/* --- FIX #4: Description for Expenses --- */}
                <textarea value={inputDescription} onChange={e => setInputDescription(e.target.value)} placeholder={t.descriptionOptional} rows="2" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white text-sm"></textarea>
            </form>
            
            <ul className="space-y-2">
                {items.length === 0 && <li className="text-gray-400 dark:text-gray-500 italic text-sm">{t.nothingYet}</li>}
                {items.map(item => (
                    editingItem?.id === item.id 
                        ? <EditableItem key={item.id} item={editingItem} setItem={setEditingItem} onSave={handleUpdateItem} onCancel={() => setEditingItem(null)} isLink={isLink} isExpense={isExpense} apiKey={apiKey} tripLocation={tripLocation} language={language} t={t} model={model} showNotification={showNotification}/>
                        : <ListItem key={item.id} item={item} onEdit={() => setEditingItem({...item})} onDelete={() => handleDeleteItem(item.id)} onToggleComplete={() => toggleItemComplete(item)} isLink={isLink} />
                ))}
            </ul>
        </div>
    );
}

export default SectionDetail;
