
import React, { useState, useRef, useEffect } from 'react';
import { HandwritingProfile, TemplateType, ArchiveEntry, ReferenceImage } from '../types';
import { HANDWRITING_FONTS } from '../constants';
import { generateStationery, refineTranscriptPunctuation } from '../services/geminiService';

interface CreateFlowProps {
  profiles: HandwritingProfile[];
  onSave: (entry: ArchiveEntry) => void;
}

const CreateFlow: React.FC<CreateFlowProps> = ({ profiles, onSave }) => {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<TemplateType>('Letter');
  const [selectedProfileId, setSelectedProfileId] = useState(profiles.find(p => p.isDefault)?.id || profiles[0]?.id);
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isRefiningPunctuation, setIsRefiningPunctuation] = useState(false);
  const [moodPrompt, setMoodPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [errorState, setErrorState] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscription(prev => (prev + ' ' + finalTranscript).trim());
        }
      };
    }
  }, []);

  const handleRecordToggle = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      // Automatically refine punctuation once recording stops
      if (transcription.length > 5) {
        setIsRefiningPunctuation(true);
        const refined = await refineTranscriptPunctuation(transcription);
        setTranscription(refined);
        setIsRefiningPunctuation(false);
      }
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const data = loadEvent.target?.result as string;
        setReferenceImages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          data,
          mimeType: file.type
        }].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReference = (id: string) => {
    setReferenceImages(prev => prev.filter(img => img.id !== id));
  };

  const handleGenerate = async (overriddenText?: string, overriddenMood?: string) => {
    const textToUse = overriddenText || transcription;
    const moodToUse = overriddenMood || moodPrompt;
    
    setIsGenerating(true);
    setErrorState(false);
    setStep(6); 
    try {
      const images = await generateStationery(
        textToUse,
        moodToUse,
        template,
        selectedProfile.vibe,
        referenceImages
      );
      setResults(images);
    } catch (err) {
      setErrorState(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const tryExample = () => {
    const exampleText = "My dearest friend, just a small note to say I am thinking of you. The weather here is turning cool, and the leaves are beginning to dance in the wind.";
    const exampleMood = "Warm vintage paper, light coffee stains, delicate autumn leaf illustrations.";
    setTemplate('Letter');
    setTranscription(exampleText);
    setMoodPrompt(exampleMood);
    handleGenerate(exampleText, exampleMood);
  };

  const handleFinalSave = () => {
    if (!results[selectedIndex]) return;
    const newEntry: ArchiveEntry = {
      id: Date.now().toString(),
      transcription,
      profileId: selectedProfileId,
      template,
      moodPrompt,
      imageUrl: results[selectedIndex],
      thumbnailUrl: results[selectedIndex],
      timestamp: Date.now(),
    };
    onSave(newEntry);
  };

  const stepsList = [
    { label: 'Template' },
    { label: 'Style' },
    { label: 'Speak' },
    { label: 'Mood' },
    { label: 'Details' },
    { label: 'Creation' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      {/* Visual Progress Header */}
      <div className="w-full max-w-3xl mb-12 flex justify-between items-center px-4">
        {stepsList.map((s, i) => (
          <div key={i} className="flex flex-col items-center flex-1 relative">
            <div className={`w-3 h-3 rounded-full transition-all duration-700 ${step > i ? 'bg-[#9d8189]' : 'bg-[#e8dfd8]'}`}>
              {step === i + 1 && <div className="absolute inset-0 w-3 h-3 bg-[#9d8189] rounded-full animate-ping" />}
            </div>
            <span className={`mt-3 text-[9px] uppercase tracking-widest font-bold transition-colors duration-500 ${step === i + 1 ? 'text-[#9d8189]' : 'text-[#8d7d6f] opacity-40'}`}>
              {s.label}
            </span>
            {i < stepsList.length - 1 && (
              <div className="absolute top-[6px] left-[calc(50%+12px)] right-[calc(-50%+12px)] h-[1px] bg-[#e8dfd8]" />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-4xl px-4 relative">
        <div className="paper-sheet rounded-xl overflow-hidden flex flex-col min-h-[580px] animate-fade-in relative z-10">
          
          <div className="flex-1 p-10 md:p-16 flex flex-col items-center justify-center text-center">
            
            {step === 1 && (
              <div className="w-full max-w-md space-y-12 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-4xl italic text-[#5e503f]">Choose a vessel</h2>
                  <p className="text-[#8d7d6f] text-sm italic">Which form shall your thoughts inhabit?</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(['Diary', 'Letter', 'Greeting Card'] as TemplateType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTemplate(t); setStep(2); }}
                      className={`group p-5 rounded-2xl border transition-all flex items-center justify-between
                        ${template === t ? 'border-[#9d8189] bg-white' : 'border-[#e8dfd8] bg-white/40 hover:bg-white'}
                      `}
                    >
                      <span className="text-lg font-medium text-[#5e503f]">{t}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9d8189] opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="pt-6 border-t border-[#f0e4d7]">
                  <button onClick={tryExample} className="text-[#9d8189] hover:text-[#5e503f] transition-colors italic text-sm underline underline-offset-4">Generate a sample letter</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="w-full max-w-lg space-y-12 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-4xl italic text-[#5e503f]">The soul of the ink</h2>
                  <p className="text-[#8d7d6f] text-sm italic">Choose the script that mirrors your heart.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProfileId(p.id); setStep(3); }}
                      className={`p-6 rounded-2xl border transition-all text-left flex items-center justify-between
                        ${selectedProfileId === p.id ? 'border-[#9d8189] bg-white shadow-sm' : 'border-[#e8dfd8] bg-white/40 hover:bg-white'}
                      `}
                    >
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-widest text-[#8d7d6f] font-bold mb-1">{p.name}</div>
                        <div className={`text-3xl text-[#5e503f] ${HANDWRITING_FONTS[p.vibe]}`}>A quiet reflection...</div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${selectedProfileId === p.id ? 'bg-[#9d8189]' : 'bg-[#e8dfd8]'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-6">
                  <button onClick={() => setStep(1)} className="text-[#8d7d6f] italic text-sm hover:underline">Back</button>
                  <button onClick={() => setStep(3)} className="btn-warm px-8 py-2 rounded-full text-sm font-medium">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-4xl italic text-[#5e503f]">Speak your truth</h2>
                  <p className="text-[#8d7d6f] text-sm italic">Edit or speak. Your words appear instantly.</p>
                </div>
                
                <div className="w-full min-h-[160px] relative">
                  <textarea
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder={isRecording ? "Listening..." : "Speak now or type here..."}
                    className={`w-full min-h-[200px] p-8 rounded-3xl border ${isRecording ? 'border-red-300' : 'border-dashed border-[#f0e4d7]'} bg-white/20 text-3xl leading-relaxed text-[#5e503f] outline-none focus:border-[#9d8189] transition-all resize-none ${HANDWRITING_FONTS[selectedProfile.vibe]}`}
                  />
                  {isRefiningPunctuation && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center">
                       <span className="text-[#9d8189] italic text-lg animate-pulse">Polishing your grammar...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-8">
                  <button
                    onClick={handleRecordToggle}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl
                      ${isRecording ? 'bg-red-50 text-red-500 border border-red-200 ring-8 ring-red-500/5' : 'bg-[#9d8189] text-white'}
                    `}
                  >
                    {isRecording ? <div className="w-8 h-8 bg-red-500 rounded-sm" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                  </button>
                  
                  <div className="flex gap-6 items-center">
                    <button onClick={() => setStep(2)} className="text-[#8d7d6f] italic text-sm hover:underline">Back</button>
                    {transcription.length > 0 && !isRecording && (
                      <button onClick={() => setStep(4)} className="btn-warm px-10 py-3 rounded-full text-lg font-medium shadow-lg">Next: Atmosphere</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="w-full max-w-lg space-y-12 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-4xl italic text-[#5e503f]">The color of the mood</h2>
                  <p className="text-[#8d7d6f] text-sm italic">Describe the world surrounding your letter.</p>
                </div>
                <div className="space-y-8">
                  <textarea
                    value={moodPrompt}
                    onChange={(e) => setMoodPrompt(e.target.value)}
                    placeholder="e.g. vintage paper, pressed flowers, soft morning light..."
                    className="w-full h-40 p-8 rounded-3xl border border-[#e8dfd8] focus:border-[#9d8189] outline-none bg-white/50 text-xl italic text-[#5e503f] resize-none leading-relaxed"
                  />
                  <div className="flex flex-col gap-4">
                    <button onClick={() => setStep(5)} className="btn-warm px-12 py-4 rounded-full text-xl shadow-xl hover:scale-105 transition-transform">Next Step</button>
                    <button onClick={() => setStep(3)} className="text-[#8d7d6f] italic text-sm hover:underline">Refine your words</button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="w-full max-w-lg space-y-10 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-4xl italic text-[#5e503f]">Final embellishments</h2>
                  <p className="text-[#8d7d6f] text-sm italic">Optionally add images to guide the AI's eye.</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 py-4">
                  {referenceImages.map((img) => (
                    <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#e8dfd8] shadow-sm group">
                      <img src={img.data} className="w-full h-full object-cover" alt="Ref" />
                      <button onClick={() => removeReference(img.id)} className="absolute top-1 right-1 bg-white/80 text-[#9d8189] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))}
                  {referenceImages.length < 3 && (
                    <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-lg border-2 border-dashed border-[#e8dfd8] flex flex-col items-center justify-center text-[#8d7d6f] hover:border-[#9d8189] hover:text-[#9d8189] transition-all bg-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-[10px] uppercase tracking-tighter">Add sticker</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                </div>

                <div className="flex flex-col gap-4">
                  <button onClick={() => handleGenerate()} className="btn-warm px-12 py-4 rounded-full text-xl shadow-xl hover:scale-105 transition-transform">Invoke the Muse</button>
                  <button onClick={() => setStep(4)} className="text-[#8d7d6f] italic text-sm hover:underline">Adjust the mood</button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                {isGenerating ? (
                  <div className="space-y-8">
                    <div className="relative w-28 h-28 mx-auto">
                        <div className="absolute inset-0 border-[1px] border-[#9d8189]/10 rounded-full" />
                        <div className="absolute inset-0 border-t-2 border-[#9d8189] rounded-full animate-spin" />
                        <div className="absolute inset-4 border-b-2 border-[#9d8189]/40 rounded-full animate-[spin_3s_linear_infinite]" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl italic text-[#5e503f]">Brewing the ink...</h2>
                      <p className="text-[#8d7d6f] text-sm max-w-xs mx-auto">This takes a little longer to get the details perfect.</p>
                    </div>
                  </div>
                ) : errorState ? (
                  <div className="space-y-8 max-w-md">
                    <div className="text-4xl">🕊️</div>
                    <h2 className="text-2xl italic text-[#5e503f]">The vision was unclear.</h2>
                    <p className="text-[#8d7d6f] text-sm">We couldn't quite render the page this time. Try a simpler mood or retry.</p>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => handleGenerate()} className="btn-warm px-8 py-3 rounded-full font-medium shadow-md">Try again</button>
                      <button onClick={() => setStep(4)} className="text-[#9d8189] italic text-sm hover:underline">Go back to Mood</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-12">
                    <div className="space-y-2">
                      <h2 className="text-4xl italic text-[#5e503f]">Behold the work</h2>
                      <p className="text-[#8d7d6f] text-sm italic">The stationery is ready for your vault.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      {results.map((img, idx) => (
                        <div key={idx} onClick={() => setSelectedIndex(idx)} className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-700 relative group ${selectedIndex === idx ? 'ring-4 ring-[#9d8189] shadow-2xl scale-[1.05] z-10' : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0 scale-95'}`}>
                          <img src={img} alt={`Result ${idx + 1}`} className="w-full aspect-[3/4] object-cover" />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center gap-6 pt-4">
                      <button onClick={handleFinalSave} className="btn-warm px-16 py-4 rounded-full text-xl shadow-xl hover:scale-105 transition-transform">Keep this page</button>
                      <button onClick={() => setStep(4)} className="text-[#9d8189] italic text-sm hover:underline">Start over from mood</button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        
        <div className="absolute -bottom-2 -right-2 w-full h-full bg-[#e8dfd8] rounded-xl -z-10 rotate-1 shadow-sm opacity-60" />
        <div className="absolute -bottom-4 -right-4 w-full h-full bg-[#f2ebe3] rounded-xl -z-20 rotate-2 shadow-sm opacity-40" />
      </div>
    </div>
  );
};

export default CreateFlow;
