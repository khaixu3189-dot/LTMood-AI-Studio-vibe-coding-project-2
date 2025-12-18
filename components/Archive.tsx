
import React, { useState } from 'react';
import { ArchiveEntry, HandwritingProfile } from '../types';

interface ArchiveProps {
  entries: ArchiveEntry[];
  profiles: HandwritingProfile[];
}

const Archive: React.FC<ArchiveProps> = ({ entries, profiles }) => {
  const [selectedEntry, setSelectedEntry] = useState<ArchiveEntry | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<string>('All');

  const filtered = entries.filter(e => filterTemplate === 'All' || e.template === filterTemplate);

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `LTMood-${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h2 className="text-4xl italic text-[#5e503f]">Your Memory Vault</h2>
        <div className="flex gap-2 bg-[#f0e4d7] p-1 rounded-full text-sm">
          {['All', 'Diary', 'Letter', 'Greeting Card'].map(t => (
            <button
              key={t}
              onClick={() => setFilterTemplate(t)}
              className={`px-4 py-1.5 rounded-full transition-all ${filterTemplate === t ? 'bg-[#9d8189] text-white shadow-sm' : 'text-[#8d7d6f] hover:text-[#5e503f]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-40 border-2 border-dashed border-[#e8dfd8] rounded-3xl">
          <p className="text-2xl text-[#8d7d6f] italic">The vault is currently empty...</p>
          <p className="text-[#9d8189] mt-2">Go create your first memory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.sort((a, b) => b.timestamp - a.timestamp).map(entry => (
            <div 
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="aspect-[3/4] overflow-hidden bg-[#f7f3f0]">
                <img src={entry.imageUrl} alt={entry.moodPrompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#9d8189] font-bold uppercase tracking-wider">{entry.template}</span>
                  <span className="text-[10px] text-[#8d7d6f]">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm line-clamp-2 text-[#5e503f] italic">"{entry.transcription}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 bg-[#4a3f35]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="relative bg-[#fdfaf6] w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <button 
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 z-[110] bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="w-full md:w-1/2 h-[40vh] md:h-auto overflow-y-auto bg-[#f7f3f0] flex items-center justify-center">
              <img src={selectedEntry.imageUrl} alt="Final Masterpiece" className="max-w-full max-h-full object-contain shadow-xl" />
            </div>

            <div className="w-full md:w-1/2 p-10 flex flex-col overflow-y-auto">
              <div className="mb-8">
                <h3 className="text-sm text-[#9d8189] font-bold uppercase tracking-widest mb-2">{selectedEntry.template}</h3>
                <h2 className="text-2xl font-bold text-[#5e503f] mb-4">Memory from {new Date(selectedEntry.timestamp).toLocaleDateString()}</h2>
                <div className="p-6 bg-white rounded-2xl border border-[#e8dfd8] italic text-lg leading-relaxed text-[#5e503f]">
                  "{selectedEntry.transcription}"
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs text-[#8d7d6f] uppercase block mb-1">Atmosphere</label>
                  <p className="text-[#5e503f]">{selectedEntry.moodPrompt}</p>
                </div>
                <div>
                  <label className="text-xs text-[#8d7d6f] uppercase block mb-1">Handwriting Profile</label>
                  <p className="text-[#5e503f]">{profiles.find(p => p.id === selectedEntry.profileId)?.name || 'Custom'}</p>
                </div>
              </div>

              <div className="mt-auto flex gap-4">
                <button 
                  onClick={() => downloadImage(selectedEntry.imageUrl, selectedEntry.id)}
                  className="flex-1 bg-[#9d8189] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#8b6f77] transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PNG
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-4 border border-[#e8dfd8] text-[#8d7d6f] rounded-xl hover:bg-white transition-colors"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
