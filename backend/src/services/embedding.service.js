let pipeline;

// Singleton to load the Xenova model once
const getEmbeddingPipeline = async () => {
    if (!pipeline) {
        // Dynamic import because @xenova/transformers is an ESM/CJS hybrid in some Node environments
        const transformers = await import('@xenova/transformers');
        // 'Xenova/all-MiniLM-L6-v2' is fast, lightweight, and creates 384-dimensional vectors
        pipeline = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('[AI] Local Xenova Transformer model loaded into memory.');
    }
    return pipeline;
};

const generateEmbedding = async (text) => {
    const extractor = await getEmbeddingPipeline();
    // pooling: 'mean' and normalize: true are required for standard sentence embeddings
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Convert Float32Array to standard JS Array for Pinecone
    return Array.from(output.data); 
};

module.exports = { generateEmbedding, getEmbeddingPipeline };