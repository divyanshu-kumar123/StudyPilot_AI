import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { studyService } from '../../services/study.service';
import { analyticsService } from '../../services/analytics.service';
import Loader from '../common/Loader';

const QuizTab = ({ documentId }) => {
    const [quiz, setQuiz] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    
    // Test State
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            // Requesting a 3-question quiz for speed, adjust as needed
            const data = await studyService.generateQuiz(documentId, { totalQuestions: 3 });
            setQuiz(data);
            setSelectedAnswers({});
            setIsSubmitted(false);
            setScore(0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate quiz. AI might be busy.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOptionSelect = (questionIndex, option) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: option
        }));
    };

    const handleSubmit = async () => {
        let currentScore = 0;
        quiz.questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                currentScore += 1;
            }
        });
        
        setScore(currentScore);
        setIsSubmitted(true);

        // Send results to our analytics dashboard silently
        try {
            await analyticsService.recordQuizAttempt({
                score: currentScore,
                totalQuestions: quiz.questions.length,
                topics: [] // Can be extracted from doc later
            });
        } catch (err) {
            console.error('Failed to record analytics', err);
        }
    };

    if (isGenerating) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Loader size="lg" text="IBM Watsonx is analyzing the document and drafting your quiz..." />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                <Target className="h-12 w-12 text-primary-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Knowledge Check</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Test your understanding. The AI will generate a tailored multiple-choice quiz based directly on this document's contents.
                </p>
                {error && <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                <button 
                    onClick={handleGenerate}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                    Generate Practice Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-500">{quiz.questions.length} Questions • {quiz.difficulty} level</p>
                </div>
                {isSubmitted && (
                    <div className="text-right">
                        <div className="text-2xl font-extrabold text-primary-600">
                            {score} / {quiz.questions.length}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Final Score</p>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {quiz.questions.map((q, qIndex) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIndex * 0.1 }}
                        key={qIndex} 
                        className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <h4 className="text-base font-medium text-gray-900 mb-4">
                            <span className="text-primary-600 mr-2">{qIndex + 1}.</span> 
                            {q.questionText}
                        </h4>
                        
                        <div className="space-y-3">
                            {q.options.map((opt, oIndex) => {
                                const isSelected = selectedAnswers[qIndex] === opt;
                                const isCorrect = opt === q.correctAnswer;
                                
                                // Styling logic based on submission state
                                let optionClass = "border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer";
                                if (isSelected) optionClass = "border-primary-500 bg-primary-50 ring-1 ring-primary-500";
                                
                                if (isSubmitted) {
                                    if (isCorrect) optionClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                    else if (isSelected && !isCorrect) optionClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
                                    else optionClass = "border-gray-200 opacity-50 cursor-not-allowed";
                                }

                                return (
                                    <div 
                                        key={oIndex}
                                        onClick={() => handleOptionSelect(qIndex, opt)}
                                        className={`p-4 rounded-xl border transition-all flex items-center justify-between ${optionClass}`}
                                    >
                                        <span className="text-sm font-medium text-gray-700">{opt}</span>
                                        {isSubmitted && isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        {isSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explanation reveals after submission */}
                        {isSubmitted && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100"
                            >
                                <p className="text-sm text-blue-800"><span className="font-bold">Explanation:</span> {q.explanation}</p>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4">
                {!isSubmitted ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                        className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Answers
                    </button>
                ) : (
                    <button 
                        onClick={handleGenerate}
                        className="w-full py-3 flex items-center justify-center bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" /> Generate Another Quiz
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizTab;