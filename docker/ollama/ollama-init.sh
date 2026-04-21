#!/bin/sh
set -e

MODEL=phi3
EMBED_MODEL=nomic-embed-text

echo "🚀 Starting Ollama server..."
ollama serve &

echo "⏳ Waiting for Ollama to be ready..."
until ollama list >/dev/null 2>&1; do
  sleep 2
done

# Check & pull LLM model
if ollama list | grep -q "^$MODEL"; then
  echo "✅ $MODEL already exists. Skip pull."
else
  echo "📥 Pulling $MODEL model..."
  ollama pull $MODEL
fi

# Check & pull Embedding model
if ollama list | grep -q "^$EMBED_MODEL"; then
  echo "✅ $EMBED_MODEL already exists. Skip pull."
else
  echo "📥 Pulling $EMBED_MODEL model..."
  ollama pull $EMBED_MODEL
fi

wait