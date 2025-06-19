import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { LANGUAGES, PREDEFINED_MODELS } from '../constants/languages';
import { COUNTRIES } from '../constants/countries';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, homeLocation, setHomeLocation, language, setLanguage, model, setModel, t }) {
  const isCustomModel = !PREDEFINED_MODELS.includes(model);
  const [customModel, setCustomModel] = useState(isCustomModel ? model : '');

  const handleModelChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'other') {
      setModel(customModel || '');
    } else {
      setModel(selectedValue);
      setCustomModel('');
    }
  };

  const handleCustomModelChange = (e) => {
    setCustomModel(e.target.value);
    setModel(e.target.value);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.settings}</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.language}</label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white">
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="homeLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.myLocation}</label>
          <select id="homeLocation" value={homeLocation} onChange={(e) => setHomeLocation(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white">
            {Object.keys(COUNTRIES).map((country) => (
              <option key={country} value={country}>{country} ({COUNTRIES[country].currency})</option>
            ))}
          </select>
        </div>
        <div className="space-y-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t.aiSettings}</h3>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.geminiApiKey}</label>
            <input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={t.apiKeyPlaceholder} className="w-full p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.apiKeyHint}</p>
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.model}</label>
            <select id="model" value={isCustomModel ? 'other' : model} onChange={handleModelChange} className="w-full p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white">
              {PREDEFINED_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="other">{t.modelOther}</option>
            </select>
            {isCustomModel && (
              <input type="text" value={customModel} onChange={handleCustomModelChange} placeholder={t.modelCustomPlaceholder} className="mt-2 w-full p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" />
            )}
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow">{t.done}</button>
        </div>
      </div>
    </BaseModal>
  );
}
