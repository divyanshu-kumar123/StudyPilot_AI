import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Clock, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { studyService } from '../../services/study.service';
import Loader from '../common/Loader';

const FlashcardsTab = ({ documentId }) => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [activeSet, setActiveSet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [cardCount, setCardCount] = useState(10);
    const [error, setError] = useState('');

    // Active Deck State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const data = await studyService.getSavedFlashcards(documentId);
                
                // Group individual cards into distinct "Sets" based on their creation time
                const grouped = data.reduce((acc, card) => {
                    // Grouping by minute to keep cards generated in the same batch together
                    const timeKey = new Date(card.createdAt).setSeconds(0,0); 
                    if (!acc[timeKey]) acc[timeKey] = [];
                    acc[timeKey].push(card);
                    return acc;
                }, {});

                // Convert object to array of sets and sort descending
                const setsArray = Object.keys(grouped).map(key => ({
                    id: key,
                    createdAt: new Date(Number(key)),
                    cards: grouped[key]
                })).sort((a, b) => b.createdAt - a.createdAt);

                setFlashcardSets(setsArray);
            } catch (err) {
                console.error("Failed to fetch flashcards", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCards();
    }, [documentId]);

    const handleGenerate = async () => {
        setShowModal(false);
        setIsGenerating(true);
        setError('');
        try {
            const newCards = await studyService.generateFlashcards(documentId, { count: cardCount, difficulty: 'medium' });
            
            // Create a new set object for immediate UI update
            const newSet = {
                id: Date.now(),
                createdAt: new Date(),
                cards: newCards
            };
            
            setFlashcardSets([newSet, ...flashcardSets]);
            openSet(newSet);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate flashcards.');
        } finally {
            setIsGenerating(false);
        }
    };

    const openSet = (set) => {
        setActiveSet(set);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleFlipNext = (direction) => {
        setIsFlipped(false);
        setTimeout(() => {
            if (direction === 'next' && currentIndex < activeSet.cards.length - 1) setCurrentIndex(prev => prev + 1);
            if (direction === 'prev' && currentIndex > 0) setCurrentIndex(prev => prev - 1);
        }, 150);
    };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader /></div>;
    if (isGenerating) return <div className="h-full flex flex-col items-center justify-center p-8 text-center"><Loader size="lg" text="Extracting key concepts for your flashcards..." /></div>;

    return (
        <div className="h-full flex flex-col relative animate-fade-in pb-10">
            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

            {/* LIST VIEW */}
            {!activeSet && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Flashcard Sets</h3>
                            <p className="text-sm text-gray-500">Master key terms using active recall.</p>
                        </div>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" /> New Deck
                        </button>
                    </div>

                    {flashcardSets.length === 0 ? (
                        <div className="text-center p-10 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                            <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <h4 className="text-gray-900 font-medium">No flashcards yet.</h4>
                            <p className="text-sm text-gray-500 mt-1">Generate a deck to start memorizing concepts.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {flashcardSets.map((set, index) => (
                                <div key={index} onClick={() => openSet(set)} className="bg-surface p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <Layers className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{set.cards.length} Cards</span>
                                        </div>
                                        <h4 className="text-base font-bold text-gray-900 mb-1">Concept Deck</h4>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 font-medium mt-4 pt-4 border-t border-gray-50">
                                        <Clock className="h-3.5 w-3.5 mr-1" /> {set.createdAt.toLocaleDateString()} at {set.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ACTIVE DECK VIEW (3D FLIP) */}
            {activeSet && (
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setActiveSet(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Study Session</h3>
                                <p className="text-sm text-gray-500">Card {currentIndex + 1} of {activeSet.cards.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center perspective-1000 w-full max-w-lg mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.2 }}
                                className="w-full aspect-[4/3] relative cursor-pointer group"
                                onClick={() => setIsFlipped(!isFlipped)} style={{ transformStyle: 'preserve-3d' }}
                            >
                                <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }} className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
                                    
                                    {/* Front */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden bg-surface border-2 border-primary-100 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center hover:border-primary-300 transition-colors">
                                        <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-primary-500 bg-primary-50 px-3 py-1 rounded-full">Question</span>
                                        <h2 className="text-xl font-bold text-gray-900">{activeSet.cards[currentIndex].question}</h2>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden bg-primary-600 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center" style={{ transform: 'rotateY(180deg)' }}>
                                        <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-white bg-primary-700 px-3 py-1 rounded-full">Answer</span>
                                        <p className="text-lg font-medium text-white leading-relaxed">{activeSet.cards[currentIndex].answer}</p>
                                    </div>

                                </motion.div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="flex items-center justify-between w-full mt-10 px-4">
                            <button onClick={() => handleFlipNext('prev')} disabled={currentIndex === 0} className="flex items-center px-4 py-3 bg-surface border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 shadow-sm">
                                <ChevronLeft className="h-5 w-5 mr-1" /> Prev
                            </button>
                            <span className="text-sm font-bold text-gray-400">{Math.round(((currentIndex + 1) / activeSet.cards.length) * 100)}%</span>
                            <button onClick={() => handleFlipNext('next')} disabled={currentIndex === activeSet.cards.length - 1} className="flex items-center px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 shadow-sm">
                                Next <ChevronRight className="h-5 w-5 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INTERACTIVE MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900">Generate Flashcards</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full"><X className="h-5 w-5" /></button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-gray-700">Deck Size</label>
                                        <span className="text-2xl font-black text-primary-600">{cardCount} Cards</span>
                                    </div>
                                    <input type="range" min="5" max="20" step="5" value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"/>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex space-x-3">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
                                <button onClick={handleGenerate} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-sm">Generate</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FlashcardsTab;