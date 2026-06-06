import { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
    Controls, 
    Background, 
    useNodesState, 
    useEdgesState,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { BrainCircuit, Maximize } from 'lucide-react';
import { studyService } from '../../services/study.service';
import Loader from '../common/Loader';

// Initialize Dagre layout engine
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Helper function to auto-layout the nodes
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const nodeWidth = 172;
    const nodeHeight = 36;
    
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'TB' ? 'top' : 'left';
        node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';
        
        // Offset to center the node
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
        return node;
    });

    return { nodes, edges };
};

const KnowledgeGraphTab = ({ documentId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [hasGraph, setHasGraph] = useState(false);

    // Fetch existing graph on mount
    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const data = await studyService.getKnowledgeGraph(documentId);
                if (data && data.nodes.length > 0) {
                    processAndSetGraph(data.nodes, data.edges);
                } else {
                    setHasGraph(false);
                }
            } catch (err) {
                // 404 just means it hasn't been generated yet, which is fine
                if (err.response?.status !== 404) {
                    console.error("Failed to fetch graph:", err);
                }
                setHasGraph(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGraph();
    }, [documentId]);

    const processAndSetGraph = (rawNodes, rawEdges) => {
        // Map backend schema to React Flow schema
        const flowNodes = rawNodes.map((n) => ({
            id: n.id,
            data: { label: n.label },
            position: { x: 0, y: 0 }, // Temporary, Dagre will overwrite this
            style: {
                background: n.type === 'concept' ? '#eef2ff' : '#fff',
                border: n.type === 'concept' ? '2px solid #6366f1' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '12px',
                fontWeight: n.type === 'concept' ? 'bold' : 'normal',
                color: '#1e293b',
                width: 172,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }
        }));

        const flowEdges = rawEdges.map((e, index) => ({
            id: `e${index}-${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            label: e.relationship,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: 10 },
            labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.8 }
        }));

        // Apply auto-layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setHasGraph(true);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const data = await studyService.generateKnowledgeGraph(documentId);
            processAndSetGraph(data.nodes, data.edges);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to map document relationships.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader /></div>;

    if (isGenerating) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Loader size="lg" text="Mapping conceptual relationships via Watsonx..." />
            </div>
        );
    }

    if (!hasGraph) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-surface">
                <BrainCircuit className="h-12 w-12 text-primary-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Knowledge Graph</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Visualize how concepts connect. The AI will build an interactive map of entities and relationships from this document.
                </p>
                {error && <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                <button 
                    onClick={handleGenerate}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                    Generate Conceptual Map
                </button>
            </div>
        );
    }

    return (
        <div className="h-full w-full border border-gray-200 rounded-2xl overflow-hidden bg-white animate-fade-in relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
                minZoom={0.1}
            >
                <Background color="#cbd5e1" gap={16} size={1} />
                <Controls showInteractive={false} />
                
                <Panel position="top-right" className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-100 m-4">
                    <div className="flex items-center space-x-2 text-xs font-medium text-gray-600">
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-primary-100 border-2 border-primary-500 mr-1"></div> Concept</div>
                        <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-1"></div> Term</div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default KnowledgeGraphTab;