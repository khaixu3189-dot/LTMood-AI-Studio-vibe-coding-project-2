
import React from 'react';

interface NavigationProps {
  currentView: 'create' | 'profiles' | 'archive';
  onNavigate: (view: 'create' | 'profiles' | 'archive') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
      <div 
        className="text-2xl font-bold italic text-[#5e503f] cursor-pointer tracking-tight"
        onClick={() => onNavigate('create')}
      >
        LTMood
      </div>
      <div className="flex gap-10 text-lg">
        <button 
          onClick={() => onNavigate('create')}
          className={`relative transition-all duration-300 ${currentView === 'create' ? 'text-[#9d8189] font-medium scale-105' : 'text-[#8d7d6f] hover:text-[#5e503f]'}`}
        >
          Begin
          {currentView === 'create' && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#9d8189]" />}
        </button>
        <button 
          onClick={() => onNavigate('profiles')}
          className={`relative transition-all duration-300 ${currentView === 'profiles' ? 'text-[#9d8189] font-medium scale-105' : 'text-[#8d7d6f] hover:text-[#5e503f]'}`}
        >
          Styles
          {currentView === 'profiles' && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#9d8189]" />}
        </button>
        <button 
          onClick={() => onNavigate('archive')}
          className={`relative transition-all duration-300 ${currentView === 'archive' ? 'text-[#9d8189] font-medium scale-105' : 'text-[#8d7d6f] hover:text-[#5e503f]'}`}
        >
          Vault
          {currentView === 'archive' && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#9d8189]" />}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
