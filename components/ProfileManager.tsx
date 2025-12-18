
import React from 'react';
import { HandwritingProfile } from '../types';
import { HANDWRITING_FONTS, VIBE_DESCRIPTIONS } from '../constants';

interface ProfileManagerProps {
  profiles: HandwritingProfile[];
  onUpdate: (profiles: HandwritingProfile[]) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, onUpdate }) => {
  const setDefault = (id: string) => {
    onUpdate(profiles.map(p => ({ ...p, isDefault: p.id === id })));
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in">
      <div className="flex flex-col mb-12 space-y-2">
        <h2 className="text-4xl italic text-[#5e503f]">Gallery of Scripts</h2>
        <p className="text-[#8d7d6f] italic">Select your preferred handwriting for your next memory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profiles.map(p => (
          <div 
            key={p.id} 
            onClick={() => setDefault(p.id)}
            className={`cursor-pointer bg-white/40 p-8 rounded-3xl border transition-all duration-300 backdrop-blur-sm relative group
              ${p.isDefault ? 'border-[#9d8189] shadow-md ring-1 ring-[#9d8189]/20' : 'border-[#e8dfd8] hover:border-[#9d8189]/50 hover:shadow-sm'}
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#5e503f]">{p.name}</h3>
                <p className="text-[#8d7d6f] text-xs italic">{VIBE_DESCRIPTIONS[p.vibe]}</p>
              </div>
              {p.isDefault && (
                <div className="bg-[#9d8189] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  Primary
                </div>
              )}
            </div>
            
            <div className={`text-4xl my-6 min-h-[80px] text-[#5e503f] leading-snug ${HANDWRITING_FONTS[p.vibe]}`}>
              Every word carries a piece of the soul...
            </div>

            <div className={`absolute bottom-4 right-6 text-[#9d8189] text-xs italic opacity-0 group-hover:opacity-100 transition-opacity ${p.isDefault ? 'hidden' : ''}`}>
              Tap to select
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 p-8 border border-[#f0e4d7] rounded-3xl bg-white/20 text-center">
        <p className="text-[#8d7d6f] italic text-sm">More artistic styles coming soon as the muse whispers them...</p>
      </div>
    </div>
  );
};

export default ProfileManager;
