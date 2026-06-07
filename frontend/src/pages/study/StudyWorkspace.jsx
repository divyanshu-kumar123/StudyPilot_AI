import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Target,
  Layers,
  FileText,
  BrainCircuit,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { documentService } from "../../services/document.service";
import Loader from "../../components/common/Loader";

import QuizTab from "../../components/study/QuizTab";
import FlashcardsTab from "../../components/study/FlashcardsTab";
import NotesTab from "../../components/study/NotesTab";
import KnowledgeGraphTab from "../../components/study/KnowledgeGraphTab";
import ChatTab from "../../components/study/ChatTab";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const StudyWorkspace = () => {
  const { documentId } = useParams();
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  // Default to the new Content tab
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await documentService.getDocumentById(documentId);
        setDocumentData(data);
      } catch (err) {
        setError("Failed to load document.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocument();
  }, [documentId]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  if (isLoading) return <Loader fullScreen text="Loading Study Workspace..." />;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  const tabs = [
    { id: "content", label: "Document Content", icon: BookOpen },
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "quizzes", label: "Quizzes", icon: Target },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "notes", label: "AI Notes", icon: FileText },
    { id: "graph", label: "Knowledge Graph", icon: BrainCircuit },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-background">
      {/* Header & Full Width Tabs */}
      <div className="bg-surface border-b border-gray-200 flex-shrink-0 z-10 pt-2 px-6">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-4 truncate">
            <Link
              to="/documents"
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {documentData?.title}
            </h1>
          </div>
        </div>

        {/* Horizontal Tab Bar */}
        <div className="flex items-center overflow-x-auto no-scrollbar space-x-2 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <tab.icon
                className={`h-4 w-4 mr-2 ${activeTab === tab.id ? "text-primary-600" : "text-gray-400"}`}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Full Screen Content Area */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full max-w-6xl mx-auto p-4 md:p-6"
          >
            {/* PDF Viewer Tab */}
            {activeTab === "content" && (
              <div className="h-full flex flex-col items-center bg-gray-200/50 rounded-2xl overflow-hidden relative border border-gray-200 shadow-inner">
                {/* Floating PDF Controls */}
                <div className="absolute top-6 bg-surface shadow-lg rounded-full px-4 py-2 flex items-center space-x-4 z-10 border border-gray-100">
                  <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((p) => p - 1)}
                    className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 w-20 text-center">
                    {pageNumber} / {numPages || "-"}
                  </span>
                  <button
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber((p) => p + 1)}
                    className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <button
                    onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                    className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                    className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 w-full overflow-auto flex justify-center py-20 pdf-container no-scrollbar">
                  <Document
                    file={documentData?.fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<Loader text="Rendering PDF..." />}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                      className="shadow-xl"
                    />
                  </Document>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="h-full w-full max-w-4xl mx-auto">
                <ChatTab documentId={documentId} />
              </div>
            )}

            {activeTab === "quizzes" && <QuizTab documentId={documentId} />}
            {activeTab === "flashcards" && (
              <FlashcardsTab documentId={documentId} />
            )}
            {activeTab === "notes" && <NotesTab documentId={documentId} />}
            {activeTab === "graph" && (
              <KnowledgeGraphTab documentId={documentId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyWorkspace;
