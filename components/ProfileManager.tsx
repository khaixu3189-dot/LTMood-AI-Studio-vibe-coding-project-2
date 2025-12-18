
import React, { useState } from 'react';
import { HandwritingProfile, HandwritingVibe } from '../types';
import { HANDWRITING_FONTS, VIBE_DESCRIPTIONS } from '../constants';

interface ProfileManagerProps {
  profiles: HandwritingProfile[];
  onUpdate: (profiles: HandwritingProfile[]) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVibe, setNewVibe] = useState<HandwritingVibe>('neat');

  const addProfile = () => {
    if (!newName) return;
    const newP: HandwritingProfile = {
      id: Date.now().toString(),
      name: newName,
      vibe: newVibe,
      isDefault: profiles.length === 0,
    };
    onUpdate([...profiles, newP]);
    setNewName('');
    setIsAdding(false);
  };

  const setDefault = (id: string) => {
    onUpdate(profiles.map(p => ({ ...p, isDefault: p.id === id })));
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    onUpdate(profiles.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl italic text-[#5e503f]">Curation of Styles</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-2 border border-[#9d8189] text-[#9d8189] rounded-full hover:bg-[#9d8189] hover:text-white transition-all italic"
        >
          New Expression
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {profiles.map(p => (
          <div key={p.id} className="bg-white/40 p-10 rounded-3xl border border-[#e8dfd8] backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-[#5e503f]">{p.name}</h3>
                <p className="text-[#8d7d6f] text-sm italic tracking-wide">{VIBE_DESCRIPTIONS[p.vibe]}</p>
              </div>
              {p.isDefault ? (
                <span className="text-[10px] text-[#9d8189] font-bold uppercase tracking-widest border border-[#9d8189] px-2 py-0.5 rounded-full">Primary</span>
              ) : (
                <button onClick={() => setDefault(p.id)} className="text-xs text-[#8d7d6f] hover:text-[#9d8189] underline underline-offset-4">Set Primary</button>
              )}
            </div>
            
            <div className={`text-5xl my-8 min-h-[100px] text-[#5e503f] leading-snug ${HANDWRITING_FONTS[p.vibe]}`}>
              The soul speaks in its own rhythm...
            </div>
            
            <div className="flex justify-end pt-4">
              {profiles.length > 1 && !p.isDefault && (
                <button onClick={() => deleteProfile(p.id)} className="text-xs text-[#8d7d6f] hover:text-red-400 transition-colors uppercase tracking-tighter">
                  Discard Style
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-[#4a3f35]/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="paper-sheet w-full max-w-md p-10 rounded-2xl shadow-2xl border border-[#e8dfd8]">
            <h3 className="text-3xl italic text-[#5e503f] mb-8">Craft a New Style</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#8d7d6f] mb-2 font-bold">Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-4 rounded-xl border border-[#e8dfd8] outline-none focus:border-[#9d8189] bg-white/50"
                  placeholder="e.g. My Secret Heart"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#8d7d6f] mb-2 font-bold">Essence</label>
                <select 
                  value={newVibe}
                  onChange={e => setNewVibe(e.target.value as HandwritingVibe)}
                  className="w-full p-4 rounded-xl border border-[#e8dfd8] outline-none focus:border-[#9d8189] bg-white/50"
                >
                  <option value="neat">Neat & Elegant</option>
                  <option value="casual">Casual & Relaxed</option>
                  <option value="messy">Raw & Energetic</option>
                  <option value="cute">Playful & Sweet</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setIsAdding(false)} 
                className="flex-1 py-4 border border-[#e8dfd8] rounded-full text-[#8d7d6f] hover:bg-white transition-colors italic"
              >
                Close
              </button>
              <button 
                onClick={addProfile}
                className="flex-1 py-4 btn-warm rounded-full font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
