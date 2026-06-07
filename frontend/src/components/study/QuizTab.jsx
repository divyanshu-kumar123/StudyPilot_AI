import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, XCircle, Plus, Clock, X } from 'lucide-react';
import { studyService } from '../../services/study.service';
import { analyticsService } from '../../services/analytics.service';
import Loader from '../common/Loader';

const QuizTab = ({ documentId }) => {
    const [savedQuizzes, setSavedQuizzes] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [questionCount, setQuestionCount] = useState(5);
    const [error, setError] = useState('');

    // Active Test State
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    // Fetch saved quizzes on mount
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const data = await studyService.getSavedQuizzes(documentId);
                setSavedQuizzes(data);
            } catch (err) {
                console.error("Failed to fetch quizzes", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizzes();
    }, [documentId]);

    const handleGenerate = async () => {
        setShowModal(false);
        setIsGenerating(true);
        setError('');
        try {
            const data = await studyService.generateQuiz(documentId, { 
                totalQuestions: questionCount,
                difficulty: 'intermediate' // Passing valid enum
            });
            setSavedQuizzes([data, ...savedQuizzes]); // Add to list
            openQuiz(data); // Immediately open it
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate quiz.');
        } finally {
            setIsGenerating(false);
        }
    };

    const openQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };

    const closeQuiz = () => {
        setActiveQuiz(null);
    };

    const handleOptionSelect = (questionIndex, option) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmit = async () => {
        let currentScore = 0;
        activeQuiz.questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) currentScore += 1;
        });
        
        setScore(currentScore);
        setIsSubmitted(true);

        try {
            await analyticsService.recordQuizAttempt({
                score: currentScore,
                totalQuestions: activeQuiz.totalQuestions,
                topics: []
            });
        } catch (err) {
            console.error('Failed to record analytics', err);
        }
    };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader /></div>;
    if (isGenerating) return <div className="h-full flex flex-col items-center justify-center p-8 text-center"><Loader size="lg" text="IBM Watsonx is drafting your tailored quiz..." /></div>;

    return (
        <div className="h-full flex flex-col relative animate-fade-in pb-10">
            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

            {/* LIST VIEW: Showing saved quizzes */}
            {!activeQuiz && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Saved Quizzes</h3>
                            <p className="text-sm text-gray-500">Revisit past quizzes or generate a new one.</p>
                        </div>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" /> New Quiz
                        </button>
                    </div>

                    {savedQuizzes.length === 0 ? (
                        <div className="text-center p-10 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                            <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <h4 className="text-gray-900 font-medium">No quizzes generated yet.</h4>
                            <p className="text-sm text-gray-500 mt-1">Generate your first quiz to test your knowledge.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedQuizzes.map(quiz => (
                                <div key={quiz._id} onClick={() => openQuiz(quiz)} className="bg-surface p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider">{quiz.totalQuestions} Qs</span>
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 mb-1">{quiz.title}</h4>
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <Clock className="h-3.5 w-3.5 mr-1" /> {new Date(quiz.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ACTIVE QUIZ VIEW */}
            {activeQuiz && (
                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center space-x-3">
                            <button onClick={closeQuiz} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{activeQuiz.title}</h3>
                                <p className="text-sm text-gray-500">{activeQuiz.totalQuestions} Questions</p>
                            </div>
                        </div>
                        {isSubmitted && (
                            <div className="text-right">
                                <div className="text-2xl font-extrabold text-primary-600">{score} / {activeQuiz.totalQuestions}</div>
                                <p className="text-xs text-gray-500 font-medium">Final Score</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {activeQuiz.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-base font-medium text-gray-900 mb-4">
                                    <span className="text-primary-600 mr-2">{qIndex + 1}.</span> {q.questionText}
                                </h4>
                                <div className="space-y-3">
                                    {q.options.map((opt, oIndex) => {
                                        const isSelected = selectedAnswers[qIndex] === opt;
                                        const isCorrect = opt === q.correctAnswer;
                                        let optionClass = "border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer";
                                        
                                        if (isSelected) optionClass = "border-primary-500 bg-primary-50 ring-1 ring-primary-500";
                                        if (isSubmitted) {
                                            if (isCorrect) optionClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                            else if (isSelected && !isCorrect) optionClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
                                            else optionClass = "border-gray-200 opacity-50 cursor-not-allowed";
                                        }

                                        return (
                                            <div key={oIndex} onClick={() => handleOptionSelect(qIndex, opt)} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${optionClass}`}>
                                                <span className="text-sm font-medium text-gray-700">{opt}</span>
                                                {isSubmitted && isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                                                {isSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                                {isSubmitted && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-sm text-blue-800"><span className="font-bold">Explanation:</span> {q.explanation}</p>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    {!isSubmitted && (
                        <button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== activeQuiz.totalQuestions} className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                            Submit Answers
                        </button>
                    )}
                </div>
            )}

            {/* INTERACTIVE MODAL: Quiz Settings */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900">Configure Quiz</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="text-center">
                                    <Target className="h-12 w-12 text-primary-200 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">How many questions would you like Watsonx to generate for this session?</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-gray-700">Question Count</label>
                                        <span className="text-2xl font-black text-primary-600">{questionCount}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" max="10" 
                                        value={questionCount} 
                                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                                        <span>1</span><span>10</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex space-x-3">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleGenerate} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm">
                                    Generate
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizTab;