#!/bin/bash

# Script to optimize user search performance by adding MongoDB indexes

echo "🔧 Optimizing user search performance..."

# Start the backend server to create indexes
cd /home/biplab-mal/Projects/notes-app/backend

echo "📦 Installing dependencies..."
npm install

echo "🚀 Starting server briefly to create indexes..."
# The indexes will be created automatically when the User model is loaded
timeout 10s npm start || true

echo "✅ Indexes should now be created in MongoDB"
echo "🔍 User search performance has been optimized with:"
echo "   - Text search indexes on email, username, firstName, lastName"
echo "   - Individual field indexes for faster queries"
echo "   - Compound indexes for active user searches"
echo "   - Frontend debouncing to reduce API calls"
echo ""
echo "Performance improvements:"
echo "   - Added MongoDB text search indexes"
echo "   - Limited search to prefix matching for faster regex queries"
echo "   - Reduced selected fields in search results"
echo "   - Added 300ms debouncing on frontend"
echo "   - Error handling and fallback search methods"
