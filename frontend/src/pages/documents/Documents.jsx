import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
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
            // Re-fetch documents to show the newly uploaded one in 'pending' state
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
        maxSize: 15 * 1024 * 1024, // 15MB
        multiple: false
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'processing': return <Loader size="sm" className="text-primary-500" />;
            case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Clock className="h-5 w-5 text-yellow-500" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Documents</h1>
                    <p className="text-gray-500 mt-1">Upload and manage your study materials.</p>
                </div>
            </div>

            {/* Upload Zone */}
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-surface hover:border-primary-400 hover:bg-gray-50'
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
                        <p className="text-sm text-gray-500 mt-1">or click to browse (Max 15MB)</p>
                    </div>
                    {uploadError && <p className="text-sm text-red-500 mt-2 font-medium">{uploadError}</p>}
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Uploaded Files</h2>
                </div>
                
                {isLoading ? (
                    <div className="p-10"><Loader size="md" /></div>
                ) : documents.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No documents found. Upload a PDF to get started!</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {documents.map((doc) => (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={doc._id} 
                                className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="ml-4 truncate pr-4">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{doc.title}</h4>
                                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                            <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                                            <span>•</span>
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6 flex-shrink-0">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(doc.processingStatus)}
                                        <span className="text-sm font-medium text-gray-700 capitalize hidden sm:block">
                                            {doc.processingStatus}
                                        </span>
                                    </div>
                                    
                                    {doc.processingStatus === 'completed' ? (
                                        <Link 
                                            to={`/study/${doc._id}`}
                                            className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center"
                                        >
                                            Study <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    ) : (
                                        <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                            Processing
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documents;