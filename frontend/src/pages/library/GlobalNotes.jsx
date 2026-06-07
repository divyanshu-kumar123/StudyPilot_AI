import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studyService } from '../../services/study.service';
import Loader from '../../components/common/Loader';

const GlobalNotes = () => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGlobalNotes = async () => {
            try {
                const data = await studyService.getAllUserNotes();
                setNotes(data);
            } catch (error) {
                console.error('Failed to fetch global notes', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGlobalNotes();
    }, []);

    const timeAgo = (dateInput) => {
        const diffInMinutes = Math.floor((new Date() - new Date(dateInput)) / 60000);
        if (diffInMinutes < 60) return `${diffInMinutes} MINUTES AGO`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} HOURS AGO`;
        return `${Math.floor(diffInMinutes / 1440)} DAYS AGO`;
    };

    if (isLoading) return <Loader fullScreen text="Loading your notes..." />;

    return (
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">All Notes</h1>

            {notes.length === 0 ? (
                <div className="text-center p-20 border-2 border-dashed border-gray-200 rounded-3xl bg-surface">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Notes Found</h3>
                    <p className="text-gray-500 mt-1">Upload a document and generate notes to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {notes.map((note, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={note._id}
                            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex items-start space-x-3 mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2">
                                            {note.title || 'Study Guide'}
                                        </h4>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider flex items-center">
                                            <BookOpen className="h-3 w-3 mr-1" /> {note.documentId?.title || 'Unknown Document'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-600 capitalize">
                                        {note.noteType.replace('_', ' ')}
                                    </span>
                                    {note.tags?.slice(0, 2).map((tag, i) => (
                                        <span key={i} className="px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                                            <Tag className="h-3 w-3 mr-1" /> {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="flex items-center text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-wider">
                                    <Clock className="h-3 w-3 mr-1" /> CREATED {timeAgo(note.createdAt)}
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(`/study/${note.documentId?._id}`)}
                                className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors flex items-center justify-center"
                            >
                                Read Notes <ArrowRight className="h-4 w-4 ml-2" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GlobalNotes;