# StudyPilot AI 🚀

A comprehensive, AI-powered Learning Operating System designed to transform static documents into highly interactive, personalized study environments. 

## Overview
StudyPilot AI bridges the gap between passive reading and active retention. By leveraging vector databases and advanced LLMs, the platform digests complex PDFs and automatically synthesizes them into actionable educational assets, collaborative spaces, and intelligent conversational assistants.

## Core Features
Smart PDF Uploads & Pinecone Vectorization, AI Notes Generation (Summary & Detailed), Dynamic AI Quizzes with Difficulty Scaling, 3D Interactive Flashcards with Timestamp Grouping, Contextual AI Assistant Chat with Realistic UI, Global Study Library Navigation, Dashboard Analytics with Recent Sessions, Real-time Collaborative Study Rooms via Socket.IO.

## Tech Stack
**Frontend:** React, Vite, Tailwind CSS, Framer Motion, Socket.IO Client.
**Backend:** Node.js, Express, Socket.IO, BullMQ.
**Databases & Infrastructure:** MongoDB Atlas, Redis (Upstash/Render), Pinecone Vector Database.
**Artificial Intelligence:** IBM Watsonx.

## Architecture & Deployment
The application is deployed across a split cloud environment to optimize performance and real-time capabilities.

**Frontend Hosting:** Vercel (Optimized for React/Vite Edge Delivery).
**Backend Hosting:** Render (Configured for persistent WebSocket connections and background worker processes).
**Security:** JWT-based authentication with dynamically configured cross-site cookies (SameSite: None / Secure: True) and trusted proxy settings for production environments.

## Local Development Setup

**Prerequisites:** Node.js, MongoDB URI, Redis URL, Pinecone API Key, Watsonx API Key.

**1. Clone and Install Dependencies:**
Navigate to the root directory, install backend dependencies, navigate to the frontend directory, install frontend dependencies.

**2. Environment Variables:**
Create a `.env` file in the backend directory containing PORT, NODE_ENV, MONGO_URI, REDIS_URL, PINECONE_API_KEY, WATSONX_API_KEY, CLIENT_URL. Create a `.env` file in the frontend directory containing VITE_API_URL.

**3. Run the Servers:**
Start the backend Express/Socket.IO server, start the Vite development server, access the application at localhost:5173.

## Roadmap & Upcoming Upgrades
Interactive Knowledge Graph UI, Spaced Repetition System (SRS) for Flashcards, AI Study Plan & Roadmap Generator, Advanced Quiz Formats (True/False & Fill-in-the-Blanks), Native Audio / Podcast Mode via TTS.
