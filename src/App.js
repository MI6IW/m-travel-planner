import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase/firebase';
import { translations } from './constants/translations';
import { usePersistentState } from './hooks/usePersistentState';
import AppHeader from './screens/AppHeader';
import HomeScreen from './screens/HomeScreen';
import TripScreen from './screens/TripScreen';
import SectionScreen from './screens/SectionScreen';
import AddTripModal from './components/AddTripModal';
import SettingsModal from './components/SettingsModal';
import Notification from './components/Notification';

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
  const [notification, setNotification] = useState(null);

  const t = translations[language];

  const showNotification = (message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    if (duration) {
      setTimeout(() => setNotification(null), duration);
    }
  };

  useEffect(() => { document.documentElement.className = theme; }, [theme]);

  useEffect(() => {
    const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          await (token ? signInWithCustomToken(auth, token) : signInAnonymously(auth));
        } catch (error) {
          console.error('Authentication Error:', error);
          showNotification('Failed to sign in.', 'error');
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
      <AppHeader onNewTrip={() => setIsTripModalOpen(true)} onSettings={() => setIsSettingsModalOpen(true)} toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} theme={theme} t={t} />
      <main className="pt-20">
        {currentView}
      </main>
      <AddTripModal isOpen={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} userId={userId} t={t} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} apiKey={apiKey} setApiKey={setApiKey} homeLocation={homeLocation} setHomeLocation={setHomeLocation} language={language} setLanguage={setLanguage} model={model} setModel={setModel} t={t} />
    </div>
  );
}
