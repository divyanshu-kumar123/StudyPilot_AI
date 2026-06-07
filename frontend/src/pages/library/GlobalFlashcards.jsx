import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studyService } from '../../services/study.service';
import Loader from '../../components/common/Loader';

const GlobalFlashcards = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGlobalFlashcards = async () => {
            try {
                const data = await studyService.getAllUserFlashcards();
                
                // Group individual cards into "Sets" based on exact creation time
                const grouped = data.reduce((acc, card) => {
                    const timeKey = new Date(card.createdAt).setSeconds(0,0); 
                    if (!acc[timeKey]) acc[timeKey] = {
                        id: timeKey,
                        createdAt: new Date(Number(timeKey)),
                        documentId: card.documentId?._id,
                        documentTitle: card.documentId?.title || 'Unknown Document',
                        cards: []
                    };
                    acc[timeKey].cards.push(card);
                    return acc;
                }, {});

                const setsArray = Object.values(grouped).sort((a, b) => b.createdAt - a.createdAt);
                setFlashcardSets(setsArray);
            } catch (error) {
                console.error('Failed to fetch global flashcards', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGlobalFlashcards();
    }, []);

    const timeAgo = (dateInput) => {
        const diffInMinutes = Math.floor((new Date() - new Date(dateInput)) / 60000);
        if (diffInMinutes < 60) return `${diffInMinutes} MINUTES AGO`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} HOURS AGO`;
        return `${Math.floor(diffInMinutes / 1440)} DAYS AGO`;
    };

    if (isLoading) return <Loader fullScreen text="Loading your flashcard library..." />;

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">All Flashcard Sets</h1>

            {flashcardSets.length === 0 ? (
                <div className="text-center p-20 border-2 border-dashed border-gray-200 rounded-3xl bg-surface">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Flashcards Found</h3>
                    <p className="text-gray-500 mt-1">Upload a document and generate flashcards to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {flashcardSets.map((set, index) => {
                        // Mocking progress for the UI as per screenshot. In a real scenario, this would come from the database tracking user views.
                        const progressPercent = Math.floor(Math.random() * 100); 
                        const reviewedCards = Math.floor((progressPercent / 100) * set.cards.length);

                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={set.id}
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start space-x-3 mb-4">
                                        <div className="p-3 bg-[#e6fcf5] text-[#20c997] rounded-xl flex-shrink-0">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2">
                                                {set.documentTitle}
                                            </h4>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                CREATED {timeAgo(set.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 mb-6">
                                        <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">
                                            {set.cards.length} Cards
                                        </span>
                                        {progressPercent > 0 && (
                                            <span className="px-3 py-1.5 bg-[#e6fcf5] border border-[#b2f2bb] rounded-lg text-xs font-bold text-[#20c997] flex items-center">
                                                <TrendingUp className="h-3 w-3 mr-1" /> {progressPercent}%
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                            <span>Progress</span>
                                            <span>{reviewedCards}/{set.cards.length} reviewed</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div 
                                                className="bg-[#20c997] h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/study/${set.documentId}`)}
                                    className="w-full py-2.5 bg-[#067854] text-[#20c997] rounded-xl text-sm font-bold hover:bg-[#c3fae8] transition-colors flex items-center justify-center"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" /> Study Now
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GlobalFlashcards;