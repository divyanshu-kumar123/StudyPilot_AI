import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Target, Layers, FileText, Share2, BrainCircuit } from 'lucide-react';
import { documentService } from '../../services/document.service';
import Loader from '../../components/common/Loader';
import QuizTab from '../../components/study/QuizTab';
import FlashcardsTab from '../../components/study/FlashcardsTab';
import NotesTab from '../../components/study/NotesTab';

// Configure the PDF.js worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const StudyWorkspace = () => {
    const { documentId } = useParams();
    const [documentData, setDocumentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // PDF State
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    // Tab State
    const [activeTab, setActiveTab] = useState('quizzes');

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const data = await documentService.getDocumentById(documentId);
                setDocumentData(data);
            } catch (err) {
                setError('Failed to load document. It may have been deleted or you lack permission.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocument();
    }, [documentId]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    if (isLoading) return <Loader fullScreen text="Loading Study Workspace..." />;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    const tabs = [
        { id: 'quizzes', label: 'Quizzes', icon: Target },
        { id: 'flashcards', label: 'Flashcards', icon: Layers },
        { id: 'notes', label: 'AI Notes', icon: FileText },
        { id: 'graph', label: 'Knowledge Graph', icon: BrainCircuit },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-gray-50">
            {/* Top Toolbar */}
            <div className="h-14 bg-surface border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-10">
                <div className="flex items-center space-x-4 truncate">
                    <Link to="/documents" className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                    <h1 className="text-sm font-bold text-gray-900 truncate">{documentData?.title}</h1>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium uppercase tracking-wider hidden sm:block">
                        Ready
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-medium transition-colors">
                        <Share2 className="h-4 w-4 mr-2" /> Study Room
                    </button>
                </div>
            </div>

            {/* Split Pane Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* LEFT PANE: PDF Viewer */}
                <div className="w-full lg:w-1/2 border-r border-gray-200 flex flex-col bg-gray-200/50 relative overflow-hidden">
                    {/* PDF Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface shadow-xl rounded-full px-4 py-2 flex items-center space-x-4 z-10 border border-gray-200">
                        <button 
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber(p => p - 1)}
                            className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full disabled:opacity-50"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 w-20 text-center">
                            {pageNumber} / {numPages || '-'}
                        </span>
                        <button 
                            disabled={pageNumber >= numPages}
                            onClick={() => setPageNumber(p => p + 1)}
                            className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full disabled:opacity-50"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full">
                            <ZoomOut className="h-4 w-4" />
                        </button>
                        <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full">
                            <ZoomIn className="h-4 w-4" />
                        </button>
                    </div>

                    {/* PDF Document */}
                    <div className="flex-1 overflow-auto flex justify-center p-4 pdf-container">
                        <Document
                            file={documentData?.fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<Loader text="Rendering PDF..." />}
                            className="drop-shadow-lg"
                        >
                            <Page 
                                pageNumber={pageNumber} 
                                scale={scale} 
                                renderAnnotationLayer={false}
                                renderTextLayer={true}
                                className="bg-white"
                            />
                        </Document>
                    </div>
                </div>

                {/* RIGHT PANE: AI Tools */}
                <div className="w-full lg:w-1/2 flex flex-col bg-background">
                    {/* Tabs Header */}
                    <div className="flex items-center px-4 pt-4 border-b border-gray-200 bg-surface overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeTab === tab.id 
                                    ? 'border-primary-600 text-primary-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {activeTab === 'quizzes' && <QuizTab documentId={documentId} />}
                                {activeTab === 'flashcards' && <FlashcardsTab documentId={documentId} />}
                                {activeTab === 'notes' && <NotesTab documentId={documentId} />}
                                
                                {activeTab === 'graph' && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                                        <BrainCircuit className="h-12 w-12 text-primary-200 mb-4" />
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">Knowledge Graph</h3>
                                        <p className="text-sm text-gray-500 max-w-sm">
                                            The AI is ready to generate a visual map based on this specific document context.
                                        </p>
                                        <button className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                                            Generate Map
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyWorkspace;