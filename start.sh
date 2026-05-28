#!/bin/sh
echo "🚀 Iniciando PampaOutdoor API..."

# Correr seed para cargar datos iniciales
echo "🌱 Cargando datos iniciales..."
node dist/seed.js || echo "Seed ya ejecutado o error no crítico"

# Iniciar servidor
echo "✅ Iniciando servidor..."
node dist/main
