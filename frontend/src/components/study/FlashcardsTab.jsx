import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { studyService } from '../../services/study.service';
import Loader from '../common/Loader';

const FlashcardsTab = ({ documentId }) => {
    const [flashcards, setFlashcards] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    
    // Deck State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const data = await studyService.generateFlashcards(documentId, { count: 10, difficulty: 'medium' });
            setFlashcards(data);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate flashcards.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    };

    if (isGenerating) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Loader size="lg" text="Extracting key concepts for your flashcards..." />
            </div>
        );
    }

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                <Layers className="h-12 w-12 text-primary-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Flashcards</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Master key terms and concepts. The AI will generate a deck of double-sided flashcards from this document.
                </p>
                {error && <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                <button 
                    onClick={handleGenerate}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                    Generate Flashcard Deck
                </button>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="h-full flex flex-col animate-fade-in pb-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Concept Deck</h3>
                    <p className="text-sm text-gray-500">Card {currentIndex + 1} of {flashcards.length}</p>
                </div>
                <button 
                    onClick={handleGenerate}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Regenerate Deck"
                >
                    <RotateCcw className="h-5 w-5" />
                </button>
            </div>

            {/* 3D Card Container */}
            <div className="flex-1 flex flex-col items-center justify-center perspective-1000 w-full max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full aspect-[4/3] relative cursor-pointer group"
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                            className="w-full h-full relative"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front of Card (Question) */}
                            <div 
                                className="absolute inset-0 w-full h-full backface-hidden bg-surface border-2 border-primary-100 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center hover:border-primary-300 transition-colors"
                            >
                                <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-primary-500 bg-primary-50 px-3 py-1 rounded-full">
                                    Question
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900">{currentCard.question}</h2>
                                <p className="absolute bottom-6 text-sm text-gray-400 font-medium group-hover:text-primary-400 transition-colors">Click to reveal answer</p>
                            </div>

                            {/* Back of Card (Answer) */}
                            <div 
                                className="absolute inset-0 w-full h-full backface-hidden bg-primary-600 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center"
                                style={{ transform: 'rotateY(180deg)' }}
                            >
                                <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-white bg-primary-700 px-3 py-1 rounded-full">
                                    Answer
                                </span>
                                <p className="text-xl font-medium text-white leading-relaxed">{currentCard.answer}</p>
                                <p className="absolute bottom-6 text-sm text-primary-200 font-medium">Click to flip back</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Deck Controls */}
                <div className="flex items-center justify-between w-full mt-10 px-4">
                    <button 
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center px-4 py-3 bg-surface border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" /> Previous
                    </button>
                    <span className="text-sm font-bold text-gray-400">
                        {Math.round(((currentIndex + 1) / flashcards.length) * 100)}% Mastered
                    </span>
                    <button 
                        onClick={handleNext}
                        disabled={currentIndex === flashcards.length - 1}
                        className="flex items-center px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Next <ChevronRight className="h-5 w-5 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardsTab;