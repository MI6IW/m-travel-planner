/* global __firebase_config, __initial_auth_token */
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, onSnapshot, query, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Firebase Configuration ---
const placeholderConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : placeholderConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// FIX #3: This ensures your login session is saved in the browser.
setPersistence(auth, browserLocalPersistence);

const db = getFirestore(app);
// FIX #3: Correct path for data storage.
const appId = firebaseConfig.appId || 'default-app-id';


// --- Константы с данными ---
const COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];
const COUNTRIES = {
    'United Kingdom': { currency: 'GBP', symbol: '£' },
    'United States': { currency: 'USD', symbol: '$' },
    'Ukraine': { currency: 'UAH', symbol: '₴' },
    'European Union': { currency: 'EUR', symbol: '€' },
    'Japan': { currency: 'JPY', symbol: '¥' },
    'Canada': { currency: 'CAD', symbol: '$' },
    'Australia': { currency: 'AUD', symbol: '$' },
    'Poland': { currency: 'PLN', symbol: 'zł' },
    'Latvia': { currency: 'EUR', symbol: '€' },
};
const LANGUAGES = ['English', 'Russian'];
const PREDEFINED_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash-preview-05-20'];
const translations = {
    English: {
        travelPlanner: "Travel Planner",
        newTrip: "New Trip",
        myTrips: "My Trips",
        adventuresAwait: "Your adventures await!",
        noTripsPlanned: "No trips planned yet.",
        clickNewTrip: "Click \"New Trip\" to start your next journey!",
        backToAllTrips: "Back to all trips",
        backToTripOverview: "Back to trip overview",
        loadingPlanner: "Loading Planner...",
        loadingTrip: "Loading trip...",
        loadingSection: "Loading section...",
        settings: "Settings",
        done: "Done",
        cancel: "Cancel",
        create: "Create",
        save: "Save",
        delete: "Delete",
        confirm: "Confirm",
        deleteTripTitle: "Delete Trip?",
        deleteTripMessage: "Are you sure you want to permanently delete this trip?",
        language: "Language",
        myLocation: "My Location",
        geminiApiKey: "Gemini API Key",
        apiKeyHint: "Get your key from Google AI Studio.",
        apiKeyPlaceholder: "Enter key for AI features",
        createANewTrip: "Create a New Trip",
        editTrip: "Edit Trip",
        tripNamePlaceholder: "Trip Name (e.g., Paris Getaway)",
        locationPlaceholder: "Location",
        tripColor: "Trip Color",
        thingsToTake: "Things to Take",
        placesToVisit: "Places to Visit",
        usefulLinks: "Useful Links",
        expenses: "Expenses",
        thingsToTakePlaceholder: "e.g., Passport",
        placesToVisitPlaceholder: "e.g., Eiffel Tower",
        usefulLinksPlaceholder: "e.g., Museum tickets",
        expensesPlaceholder: "e.g., Flights",
        aiSuggest: "AI Suggest",
        generating: "Generating...",
        descriptionOptional: "Description (optional)",
        ai: "AI",
        aiSettings: "AI Settings",
        model: "Model",
        modelOther: "Other...",
        modelCustomPlaceholder: "Enter custom model name",
        aiDescriptionError: "Failed to generate description. Error:",
        aiSuggestError: "Failed to get AI suggestions. Error:",
        enterApiKey: "Please enter your Gemini API key in Settings.",
        unexpectedFormat: "AI suggestions were in an unexpected format.",
        enterItemName: "Please enter an item name first.",
        nothingYet: "Nothing here yet...",
        addSection: "Add Section",
        newSectionName: "New Section Name",
        sectionNamePlaceholder: "e.g., Souvenir Ideas",
        sectionNameError: "Section name cannot be empty or a duplicate.",
        deleteSelected: "Delete Selected",
        deleteSelectedTripsTitle: "Delete Selected Trips?",
        deleteSelectedTripsMessage: "Are you sure you want to permanently delete the selected trips?",
    },
    Russian: {
        travelPlanner: "Планировщик поездок",
        newTrip: "Новая поездка",
        myTrips: "Мои поездки",
        adventuresAwait: "Ваши приключения ждут!",
        noTripsPlanned: "Пока нет запланированных поездок.",
        clickNewTrip: "Нажмите «Новая поездка», чтобы начать новое путешествие!",
        backToAllTrips: "Назад ко всем поездкам",
        backToTripOverview: "Назад к обзору поездки",
        loadingPlanner: "Загрузка планировщика...",
        loadingTrip: "Загрузка поездки...",
        loadingSection: "Загрузка раздела...",
        settings: "Настройки",
        done: "Готово",
        cancel: "Отмена",
        create: "Создать",
        save: "Сохранить",
        delete: "Удалить",
        confirm: "Подтвердить",
        deleteTripTitle: "Удалить поездку?",
        deleteTripMessage: "Вы уверены, что хотите навсегда удалить эту поездку?",
        language: "Язык",
        myLocation: "Мое местоположение",
        geminiApiKey: "API-ключ Gemini",
        apiKeyHint: "Получите ключ в Google AI Studio.",
        apiKeyPlaceholder: "Введите ключ для функций ИИ",
        createANewTrip: "Создать новую поездку",
        editTrip: "Редактировать поездку",
        tripNamePlaceholder: "Название поездки (например, Поездка в Париж)",
        locationPlaceholder: "Местоположение",
        tripColor: "Цвет поездки",
        thingsToTake: "Что взять с собой",
        placesToVisit: "Места для посещения",
        usefulLinks: "Полезные ссылки",
        expenses: "Расходы",
        thingsToTakePlaceholder: "например, Паспорт",
        placesToVisitPlaceholder: "например, Эйфелева башня",
        usefulLinksPlaceholder: "например, Билеты в музей",
        expensesPlaceholder: "например, Авиабилеты",
        aiSuggest: "ИИ-подсказка",
        generating: "Генерация...",
        descriptionOptional: "Описание (необязательно)",
        ai: "ИИ",
        aiSettings: "Настройки ИИ",
        model: "Модель",
        modelOther: "Другая...",
        modelCustomPlaceholder: "Введите свое название модели",
        aiDescriptionError: "Не удалось сгенерировать описание. Ошибка:",
        aiSuggestError: "Не удалось получить подсказки ИИ. Ошибка:",
        enterApiKey: "Пожалуйста, введите ваш API-ключ Gemini в настройках.",
        unexpectedFormat: "Подсказки ИИ были в неожиданном формате.",
        enterItemName: "Пожалуйста, сначала введите название элемента.",
        nothingYet: "Здесь пока ничего нет...",
        addSection: "Добавить раздел",
        newSectionName: "Название нового раздела",
        sectionNamePlaceholder: "например, Идеи для сувениров",
        sectionNameError: "Название раздела не может быть пустым или дублироваться.",
        deleteSelected: "Удалить выбранные",
        deleteSelectedTripsTitle: "Удалить выбранные поездки?",
        deleteSelectedTripsMessage: "Вы уверены, что хотите навсегда удалить выбранные поездки?",
    },
};

// --- Компоненты иконок (без изменений) ---
function PlusIcon({className}) { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>); }
function MapPinIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>); }
function CalendarIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>); }
function ArrowLeftIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>); }
function SparklesIcon({ className }) { return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" /><path d="M5 21L6.5 18" /><path d="M17.5 18L19 21" /><path d="M21 5L18 6.5" /><path d="M3 5L6 6.5" /></svg>); }
function SettingsIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>); }
function TrashIcon({className}) { return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>); }
function EditIcon({className}) { return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>); }
function SunIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>); }
function MoonIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>); }
function SuitcaseIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>); }
function CameraIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>); }
function LinkIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>); }
function WalletIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h2v-4h-2z"></path></svg>); }
function FolderPlusIcon() { return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10v6m3-3h-6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"></path></svg>); }
function CircleIcon({ className }) { return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>; }
function CheckCircleIcon({ className }) { return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>; }
function AlertTriangleIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
function InfoIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}

// --- Кастомные хуки ---
const useAutosizeTextArea = (textAreaRef, value) => {
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "0px";
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = scrollHeight + "px";
        }
    }, [textAreaRef, value]);
};

function usePersistentState(key, defaultValue) {
    const [state, setState] = useState(() => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
}

// --- Главный компонент приложения ---
export default function App() {
    const [userId, setUserId] = useState(null);
    const [view, setView] = useState('home');
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [apiKey, setApiKey] = usePersistentState('apiKey', '');
    const [theme, setTheme] = usePersistentState('theme', 'dark');
    const [homeLocation, setHomeLocation] = usePersistentState('homeLocation', 'United Kingdom');
    const [language, setLanguage] = usePersistentState('language', 'English');
    const [model, setModel] = usePersistentState('model', 'gemini-2.0-flash');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [notification, setNotification] = useState(null); // { message: string, type: 'info' | 'error' }

    const t = translations[language];

    const showNotification = (message, type = 'info', duration = 3000) => {
        setNotification({ message, type });
        if (duration) {
          setTimeout(() => setNotification(null), duration);
        }
    };

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));

    useEffect(() => {
        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    await (token ? signInWithCustomToken(auth, token) : signInAnonymously(auth));
                } catch (error) {
                    console.error("Authentication Error:", error);
                    showNotification("Failed to sign in.", "error");
                }
            }
        });
        return () => unsub();
    }, []);

    const navigateToTrip = (tripId) => { setSelectedTripId(tripId); setView('trip'); };
    const navigateToSection = (sectionId) => { setSelectedSectionId(sectionId); setView('section'); };
    const navigateFromTripToHome = () => { setSelectedTripId(null); setView('home'); };
    const navigateFromSectionToTrip = () => { setSelectedSectionId(null); setView('trip'); };

    if (!userId) return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-500">{t.loadingPlanner}</div>;
    
    let currentView;
    if (view === 'home') currentView = <HomeScreen key="home" onSelectTrip={navigateToTrip} userId={userId} t={t} />;
    else if (view === 'trip' && selectedTripId) currentView = <TripScreen key="trip" tripId={selectedTripId} userId={userId} onSelectSection={navigateToSection} onBack={navigateFromTripToHome} t={t} showNotification={showNotification} />;
    else if (view === 'section' && selectedTripId && selectedSectionId) currentView = <SectionScreen key="section" tripId={selectedTripId} sectionId={selectedSectionId} userId={userId} onBack={navigateFromSectionToTrip} apiKey={apiKey} language={language} t={t} model={model} showNotification={showNotification} />;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
            <Notification notification={notification} onClear={() => setNotification(null)} />
            <AppHeader onNewTrip={() => setIsTripModalOpen(true)} onSettings={() => setIsSettingsModalOpen(true)} toggleTheme={toggleTheme} theme={theme} t={t} />
            <main className="pt-20">
                <AnimatePresence mode="wait">
                    <motion.div key={view + selectedTripId + selectedSectionId} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2 }}>
                        {currentView}
                    </motion.div>
                </AnimatePresence>
            </main>
            <AddTripModal isOpen={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} userId={userId} t={t}/>
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} apiKey={apiKey} setApiKey={setApiKey} homeLocation={homeLocation} setHomeLocation={setHomeLocation} language={language} setLanguage={setLanguage} model={model} setModel={setModel} t={t} />
        </div>
    );
}

// --- Глобальный заголовок (без изменений) ---
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
}

// --- Экраны ---
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
function TripCard({ trip, onNavigate, onEdit, onSelect, isSelected }) {
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
                <button onClick={(e) => {e.stopPropagation(); onEdit();}} className="p-2 bg-gray-200/50 dark:bg-gray-900/50 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon className="w-4 h-4" /></button>
                <button onClick={(e) => {e.stopPropagation(); onSelect();}} className="p-2 bg-gray-200/50 dark:bg-gray-900/50 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
                    {isSelected ? <CheckCircleIcon className="w-6 h-6 text-blue-500" /> : <CircleIcon className="w-6 h-6 text-gray-400" />}
                </button>
            </div>
        </div>
    );
}

function BaseModal({ isOpen, onClose, children }) {
     const modalRef = useRef();
     useEffect(() => {
         const handleClickOutside = (event) => { if (modalRef.current && !modalRef.current.contains(event.target)) onClose(); };
         document.addEventListener("mousedown", handleClickOutside);
         return () => document.removeEventListener("mousedown", handleClickOutside);
     }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                    <motion.div ref={modalRef} initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function AddTripModal({ isOpen, onClose, userId, t }) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !location || !date || !userId) return;

        // --- FIX #1: Optimistic UI update for modals ---
        setTimeout(() => onClose(), 100);

        addDoc(collection(db, `users/${userId}/trips`), { name, location, date, color, createdAt: serverTimestamp(), sections: { thingsToTake: [], placesToVisit: [], usefulLinks: [], expenses: [] }})
            .then(() => {
                setName(''); setLocation(''); setDate(''); setColor(COLORS[0]);
            })
            .catch((error) => { 
                console.error("Error adding trip:", error); 
            });
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.createANewTrip}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <input type="text" placeholder={t.tripNamePlaceholder} value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
                 <input type="text" placeholder={t.locationPlaceholder} value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
                 <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
                <div>
                    <label className="text-gray-600 dark:text-gray-300">{t.tripColor}</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {COLORS.map(c => <button key={c} type="button" onClick={() => setColor(c)} className="w-8 h-8 rounded-full transition-transform transform hover:scale-110" style={{ backgroundColor: c, border: color === c ? '3px solid #6B7280' : '3px solid transparent' }}></button>)}
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
                    <button type="submit" className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow">{t.create}</button>
                </div>
            </form>
        </BaseModal>
    );
}

function EditTripModal({ isOpen, onClose, userId, trip, t }) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [color, setColor] = useState('');

     useEffect(() => {
         if (trip) {
             setName(trip.name || '');
             setLocation(trip.location || '');
             setDate(trip.date ? new Date(trip.date).toISOString().split('T')[0] : '');
             setColor(trip.color || COLORS[0]);
         }
     }, [trip, isOpen]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !location || !date || !userId || !trip?.id) return;
        
        // --- FIX #1: Optimistic UI update for modals ---
        setTimeout(() => onClose(), 100);
        
        const tripDocRef = doc(db, `users/${userId}/trips/${trip.id}`);
        updateDoc(tripDocRef, { name, location, date, color })
            .catch((error) => { 
                console.error("Error updating trip:", error); 
            });
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.editTrip}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <input type="text" placeholder={t.tripNamePlaceholder} value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
                 <input type="text" placeholder={t.locationPlaceholder} value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
                 <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
                <div>
                    <label className="text-gray-600 dark:text-gray-300">{t.tripColor}</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {COLORS.map(c => <button key={c} type="button" onClick={() => setColor(c)} className="w-8 h-8 rounded-full transition-transform transform hover:scale-110" style={{ backgroundColor: c, border: color === c ? '3px solid #6B7280' : '3px solid transparent' }}></button>)}
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
                    <button type="submit" className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow">{t.save}</button>
                </div>
            </form>
        </BaseModal>
    );
}

function SettingsModal({ isOpen, onClose, apiKey, setApiKey, homeLocation, setHomeLocation, language, setLanguage, model, setModel, t }) {
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
                    <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white">
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="homeLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.myLocation}</label>
                    <select id="homeLocation" value={homeLocation} onChange={e => setHomeLocation(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white">
                        {Object.keys(COUNTRIES).map(country => <option key={country} value={country}>{country} ({COUNTRIES[country].currency})</option>)}
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
                            {PREDEFINED_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
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

function AddSectionModal({ isOpen, onClose, userId, tripId, existingSections, t, showNotification }) {
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sanitizedName = name.trim().replace(/\s+/g, '_').toLowerCase();
        if (!sanitizedName || existingSections.includes(sanitizedName)) {
            showNotification(t.sectionNameError, "error");
            return;
        }
        try {
            const tripDocRef = doc(db, `users/${userId}/trips/${tripId}`);
            await updateDoc(tripDocRef, {
                [`sections.${sanitizedName}`]: []
            });
            setName('');
        } catch (error) {
            console.error("Error adding section:", error);
            showNotification("Failed to add section.", "error");
        } finally {
            onClose();
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t.addSection}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder={t.sectionNamePlaceholder} value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none dark:text-white" required />
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
                    <button type="submit" className="py-2 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow">{t.create}</button>
                </div>
            </form>
        </BaseModal>
    );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, t }) {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">{title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <div className="flex justify-end gap-4">
                <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t.cancel}</button>
                <button onClick={onConfirm} className="py-2 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow">{t.delete}</button>
            </div>
        </BaseModal>
    );
}

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

// Новый компонент уведомлений для замены alert()
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
