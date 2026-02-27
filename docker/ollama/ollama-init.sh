#!/bin/sh
set -e

MODEL=phi3

echo "🚀 Starting Ollama server..."
ollama serve &

echo "⏳ Waiting for Ollama to be ready..."
until ollama list >/dev/null 2>&1; do
  sleep 2
done

# Check model existence
if ollama list | grep -q "^$MODEL"; then
  echo "✅ $MODEL already exists. Skip pull."
else
  echo "📥 Pulling $MODEL model..."
  ollama pull $MODEL
fi

# Optional warm-up
if [ "${OLLAMA_WARMUP:-true}" = "true" ]; then
  echo "🔥 Warming up $MODEL..."
  ollama run $MODEL "hello" >/dev/null 2>&1 || true
fi

wait