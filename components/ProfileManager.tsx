
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
        <h2 className="text-4xl italic text-[#5e503f]">Scripts of the Soul</h2>
        <p className="text-[#8d7d6f] italic">Select the ink and stroke that best reflects your current mood.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {profiles.map(p => (
          <div 
            key={p.id} 
            onClick={() => setDefault(p.id)}
            className={`cursor-pointer bg-white/40 p-10 rounded-[2.5rem] border transition-all duration-500 backdrop-blur-sm relative group
              ${p.isDefault ? 'border-[#9d8189] shadow-lg ring-2 ring-[#9d8189]/5' : 'border-[#e8dfd8] hover:border-[#9d8189]/50 hover:shadow-md'}
            `}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#5e503f]">{p.name}</h3>
                <p className="text-[#8d7d6f] text-sm italic">{VIBE_DESCRIPTIONS[p.vibe]}</p>
              </div>
              {p.isDefault && (
                <div className="bg-[#9d8189] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                  Current
                </div>
              )}
            </div>
            
            <div className={`text-5xl my-8 min-h-[120px] text-[#5e503f] leading-snug flex items-center ${HANDWRITING_FONTS[p.vibe]}`}>
              "A whisper in the wind, caught in ink..."
            </div>

            <div className={`absolute bottom-6 right-8 text-[#9d8189] text-sm italic opacity-0 group-hover:opacity-100 transition-opacity ${p.isDefault ? 'hidden' : ''}`}>
              Tap to choose style
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 p-10 border-t border-[#f0e4d7] text-center">
        <p className="text-[#8d7d6f] italic text-sm">Each style is crafted to carry a different weight of emotion.</p>
      </div>
    </div>
  );
};

export default ProfileManager;
