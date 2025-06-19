import React from "react";
import { PlusIcon, SettingsIcon, MoonIcon, SunIcon } from "../components/icons";
function AppHeader({ onNewTrip, onSettings, toggleTheme, theme, t }) {
    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm z-40">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.travelPlanner}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                    <button onClick={onSettings} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <SettingsIcon />
                    </button>
                    <button onClick={onNewTrip} className="flex items-center gap-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-600 transition-all transform hover:scale-105">
                        <PlusIcon className="w-5 h-5" /> <span className="hidden md:inline">{t.newTrip}</span>
                    </button>
                </div>
            </div>
        </header>
    );
export default AppHeader;
