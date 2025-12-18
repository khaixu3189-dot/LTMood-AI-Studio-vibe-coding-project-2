
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import CreateFlow from './components/CreateFlow';
import ProfileManager from './components/ProfileManager';
import Archive from './components/Archive';
import { HandwritingProfile, ArchiveEntry } from './types';
import { INITIAL_PROFILES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'create' | 'profiles' | 'archive'>('create');
  const [profiles, setProfiles] = useState<HandwritingProfile[]>(() => {
    const saved = localStorage.getItem('ltmood_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });
  const [archive, setArchive] = useState<ArchiveEntry[]>(() => {
    const saved = localStorage.getItem('ltmood_archive');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ltmood_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('ltmood_archive', JSON.stringify(archive));
  }, [archive]);

  const handleSaveToArchive = (entry: ArchiveEntry) => {
    setArchive(prev => [entry, ...prev]);
    setView('archive');
  };

  return (
    <div className="min-h-screen relative selection:bg-[#9d8189]/20 selection:text-[#5e503f]">
      <Navigation currentView={view} onNavigate={setView} />
      
      <main className="pt-24 pb-12">
        {view === 'create' && (
          <CreateFlow 
            profiles={profiles} 
            onSave={handleSaveToArchive} 
          />
        )}
        
        {view === 'profiles' && (
          <ProfileManager 
            profiles={profiles} 
            onUpdate={setProfiles} 
          />
        )}
        
        {view === 'archive' && (
          <Archive 
            entries={archive} 
            profiles={profiles} 
          />
        )}
      </main>

      {/* Atmospheric touches */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9d8189]/30 to-transparent"></div>
      <div className="fixed bottom-10 right-10 text-[10px] text-[#8d7d6f] italic opacity-40 pointer-events-none uppercase tracking-[0.2em]">
        Every page a memory, every word a heart
      </div>
    </div>
  );
};

export default App;
