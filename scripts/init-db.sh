#!/bin/bash

echo "🚀 ResumeSmart AI Agent Setup"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL 15+"
    exit 1
fi

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Installing..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

echo "✓ Dependencies verified"

# Pull Ollama models
echo "📥 Pulling Ollama models..."
ollama pull phi3:mini
ollama pull nomic-embed-text

# Setup backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
cp .env.example .env
cd ..

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup database
echo "🗄️ Setting up database..."
chmod +x scripts/init-db.sh
./scripts/init-db.sh

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Access at: http://localhost:5173"