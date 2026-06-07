import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, Clock, AlertCircle, BookOpen, Target, Trash2 } from 'lucide-react';
import { documentService } from '../../services/document.service';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const fetchDocuments = async () => {
        try {
            const data = await documentService.getUserDocuments();
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError('');

        try {
            await documentService.uploadDocument(file);
            await fetchDocuments();
        } catch (error) {
            setUploadError(error.response?.data?.message || 'Failed to upload document.');
        } finally {
            setIsUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 15 * 1024 * 1024,
        multiple: false
    });

    // Helper to format "uploaded X ago"
    const timeAgo = (dateInput) => {
        const date = new Date(dateInput);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Documents</h1>
                    <p className="text-gray-500 mt-1">Manage and organize your learning materials</p>
                </div>
                <button 
                    {...getRootProps()}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm cursor-pointer"
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="h-4 w-4 mr-2" /> Upload Document
                </button>
            </div>

            {/* Upload Zone (Appears conditionally if dragging or uploading) */}
            {(isDragActive || isUploading || uploadError) && (
                <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                        isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-surface'
                    }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                            {isUploading ? <Loader size="md" /> : <UploadCloud className="h-8 w-8" />}
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-900">
                                {isUploading ? 'Uploading document...' : isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                            </p>
                        </div>
                        {uploadError && <p className="text-sm text-red-500 mt-2 font-medium">{uploadError}</p>}
                    </div>
                </div>
            )}

            {/* Documents Grid */}
            {isLoading ? (
                <div className="p-10 flex justify-center"><Loader size="lg" /></div>
            ) : documents.length === 0 ? (
                <div className="text-center p-20 border-2 border-dashed border-gray-200 rounded-3xl bg-surface">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
                    <p className="text-gray-500 mt-1">Upload your first PDF to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {documents.map((doc, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={doc._id} 
                        >
                            <Link 
                                to={doc.processingStatus === 'completed' ? `/study/${doc._id}` : '#'}
                                className={`block bg-surface p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative group ${doc.processingStatus !== 'completed' && 'opacity-70 cursor-not-allowed'}`}
                            >
                                {/* Delete Button (Hover) */}
                                <button className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50 z-10" onClick={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                {/* Document Icon */}
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-400 to-primary-500 flex items-center justify-center text-white mb-5 shadow-inner">
                                    <FileText className="h-6 w-6" />
                                </div>

                                {/* Details */}
                                <h4 className="text-base font-bold text-gray-900 line-clamp-1 mb-1">{doc.title}</h4>
                                <p className="text-xs text-gray-500 font-medium mb-5">{(doc.fileSize / 1024).toFixed(1)} KB</p>

                                {/* Stats Badges */}
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="flex items-center text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg">
                                        <BookOpen className="h-3.5 w-3.5 mr-1.5" /> 0 Flashcards
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg">
                                        <Target className="h-3.5 w-3.5 mr-1.5" /> 0 Quizzes
                                    </div>
                                </div>

                                {/* Footer / Status */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium text-gray-400">
                                    <div className="flex items-center">
                                        <Clock className="h-3.5 w-3.5 mr-1.5" /> {timeAgo(doc.createdAt)}
                                    </div>
                                    {doc.processingStatus !== 'completed' && (
                                        <span className="text-primary-500 flex items-center animate-pulse">
                                            Processing...
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Documents;