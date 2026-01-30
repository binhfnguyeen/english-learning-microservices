#!/bin/sh
set -e

echo "🚀 Starting Ollama server..."
ollama serve &

echo "⏳ Waiting for Ollama to be ready..."
until ollama list >/dev/null 2>&1; do
  sleep 2
done

# Check model existence
if ollama list | grep -q "^llama3"; then
  echo "✅ llama3 already exists. Skip pull."
else
  echo "📥 Pulling llama3 model..."
  ollama pull llama3
fi

# Optional warm-up
if [ "${OLLAMA_WARMUP:-true}" = "true" ]; then
  echo "🔥 Warming up llama3..."
  ollama run llama3 "hello" >/dev/null 2>&1 || true
fi

wait