import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Clock, Copy, Check, X, Tag } from 'lucide-react';
import { studyService } from '../../services/study.service';
import Loader from '../common/Loader';

const NotesTab = ({ documentId }) => {
    const [savedNotes, setSavedNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [noteType, setNoteType] = useState('summary');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await studyService.getSavedNotes(documentId);
                setSavedNotes(data);
            } catch (err) {
                console.error("Failed to fetch notes", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, [documentId]);

    const handleGenerate = async () => {
        setShowModal(false);
        setIsGenerating(true);
        setError('');
        try {
            const data = await studyService.generateNotes(documentId, { noteType });
            setSavedNotes([data, ...savedNotes]);
            setActiveNote(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate notes.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!activeNote) return;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = activeNote.content;
        navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader /></div>;
    if (isGenerating) return <div className="h-full flex flex-col items-center justify-center p-8 text-center"><Loader size="lg" text={`Watsonx is synthesizing your ${noteType} notes...`} /></div>;

    return (
        <div className="h-full flex flex-col relative animate-fade-in pb-10">
            {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

            {/* LIST VIEW */}
            {!activeNote && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Saved Notes</h3>
                            <p className="text-sm text-gray-500">Access your generated study guides.</p>
                        </div>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Generate Notes
                        </button>
                    </div>

                    {savedNotes.length === 0 ? (
                        <div className="text-center p-10 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <h4 className="text-gray-900 font-medium">No notes generated yet.</h4>
                            <p className="text-sm text-gray-500 mt-1">Create summaries or detailed study guides.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedNotes.map(note => (
                                <div key={note._id} onClick={() => setActiveNote(note)} className="bg-surface p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">{note.noteType.replace('_', ' ')}</span>
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 mb-1">{note.title || 'Study Guide'}</h4>
                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                        <Clock className="h-3.5 w-3.5 mr-1" /> {new Date(note.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ACTIVE NOTE VIEW */}
            {activeNote && (
                <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setActiveNote(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{activeNote.title || 'Study Guide'}</h3>
                                <div className="flex space-x-2 mt-1">
                                    {activeNote.tags?.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            <Tag className="h-3 w-3 mr-1" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleCopy} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center" title="Copy text">
                            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="flex-1 bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm overflow-y-auto custom-scrollbar">
                        <div 
                            className="prose prose-primary max-w-none text-gray-700 prose-headings:text-gray-900 prose-h1:text-xl prose-h2:text-lg prose-p:text-sm prose-li:text-sm"
                            dangerouslySetInnerHTML={{ __html: activeNote.content }}
                        />
                    </div>
                </div>
            )}

            {/* INTERACTIVE MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900">Generate Notes</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full"><X className="h-5 w-5" /></button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700">Select Detail Level</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {['summary', 'key_points', 'detailed'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setNoteType(type)}
                                                className={`p-4 border rounded-xl text-left transition-all ${noteType === type ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'}`}
                                            >
                                                <h4 className={`text-sm font-bold capitalize ${noteType === type ? 'text-primary-700' : 'text-gray-900'}`}>{type.replace('_', ' ')}</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {type === 'summary' && 'A concise overview of the main concepts.'}
                                                    {type === 'key_points' && 'Bullet points of the most critical facts.'}
                                                    {type === 'detailed' && 'Comprehensive breakdown of all materials.'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
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

export default NotesTab;