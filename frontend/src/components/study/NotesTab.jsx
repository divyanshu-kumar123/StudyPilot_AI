import { useState } from 'react';
import { FileText, Download, Copy, Check } from 'lucide-react';
import { studyService } from '../../services/study.service';
import Loader from '../common/Loader';

const NotesTab = ({ documentId }) => {
    const [notes, setNotes] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [noteType, setNoteType] = useState('summary');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const data = await studyService.generateNotes(documentId, { noteType });
            setNotes(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate notes.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!notes) return;
        // Strip HTML tags for clipboard copy
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = notes.content;
        navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isGenerating) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Loader size="lg" text={`Synthesizing ${noteType} notes...`} />
            </div>
        );
    }

    if (!notes) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                <FileText className="h-12 w-12 text-primary-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Generated Notes</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Get beautifully formatted, readable notes instantly. Choose your preferred depth below.
                </p>
                
                <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    {['summary', 'detailed', 'key_points'].map(type => (
                        <button
                            key={type}
                            onClick={() => setNoteType(type)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                                noteType === type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {error && <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                
                <button 
                    onClick={handleGenerate}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                    Generate {noteType.replace('_', ' ')}
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col animate-fade-in pb-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{notes.title}</h3>
                    <div className="flex space-x-2 mt-2">
                        {notes.tags?.map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleCopy}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                    <button 
                        onClick={() => setNotes(null)}
                        className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                        New Notes
                    </button>
                </div>
            </div>

            {/* Rich Text Render Area */}
            <div className="flex-1 bg-surface border border-gray-100 rounded-2xl p-8 shadow-sm overflow-y-auto">
                {/* Using dangerouslySetInnerHTML because we specifically instructed our Watsonx 
                    backend prompt (in Phase 3 Part 3) to return safe, formatted HTML tags.
                */}
                <div 
                    className="prose prose-primary max-w-none text-gray-700 leading-relaxed 
                    prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-2xl 
                    prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-p:mb-4 
                    prose-ul:list-disc prose-ul:pl-5 prose-li:mb-1"
                    dangerouslySetInnerHTML={{ __html: notes.content }}
                />
            </div>
        </div>
    );
};

export default NotesTab;