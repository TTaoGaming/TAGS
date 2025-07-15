#!/bin/bash

# 🚀 TAGS MPE Controller v25.6.9 - Production Deployment Script
# Tectangle Audio Gesture Studio

echo "🎛️ TAGS MPE Controller v25.6.9 - Production Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the production directory."
    exit 1
fi

echo "✅ Production files verified"

# Option 1: Local Development Server
echo ""
echo "🎯 Deployment Options:"
echo "1. Local Development Server (Python)"
echo "2. Local Development Server (Node.js)"
echo "3. Upload to Web Server"
echo "4. Deploy to GitHub Pages"
echo ""

read -p "Choose deployment option (1-4): " choice

case $choice in
    1)
        echo "🐍 Starting Python HTTP Server..."
        echo "📱 Open: http://localhost:8000"
        echo "🛑 Press Ctrl+C to stop"
        python3 -m http.server 8000 || python -m http.server 8000
        ;;
    2)
        echo "📦 Starting Node.js Server..."
        if command -v npx &> /dev/null; then
            echo "📱 Open: http://localhost:3000"
            echo "🛑 Press Ctrl+C to stop"
            npx serve . -p 3000
        else
            echo "❌ npx not found. Please install Node.js first."
            exit 1
        fi
        ;;
    3)
        echo "🌐 Web Server Deployment Instructions:"
        echo ""
        echo "1. Upload entire directory to your web server"
        echo "2. Ensure HTTPS is enabled (required for camera access)"
        echo "3. Set index.html as the default document"
        echo "4. Configure MIME types for .json, .js, .css files"
        echo "5. Test camera permissions on the live site"
        echo ""
        echo "📋 Use DEPLOYMENT-CHECKLIST.md for complete validation"
        ;;
    4)
        echo "🐙 GitHub Pages Deployment Instructions:"
        echo ""
        echo "1. Create a new repository on GitHub"
        echo "2. Upload all files to the repository"
        echo "3. Go to Settings → Pages"
        echo "4. Select 'Deploy from a branch' → main branch"
        echo "5. Your app will be available at: https://username.github.io/repository-name"
        echo ""
        echo "⚠️  Note: GitHub Pages uses HTTPS automatically (required for camera access)"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "📚 Documentation:"
echo "- README.md - Complete user guide and technical specs"
echo "- DEPLOYMENT-CHECKLIST.md - Production deployment checklist"
echo "- BOY-SCOUT-IMPROVEMENTS.md - Code quality improvements log"
echo ""
echo "🎯 Production Features:"
echo "✅ Apple HIG compliant mobile experience"
echo "✅ PWA ready with service worker"
echo "✅ 96-key orientation-aware MIDI system"
echo "✅ Native iOS fullscreen with multiple exit methods"
echo "✅ Performance optimized for mid-range smartphones"
echo ""
echo "🚀 Ready for production deployment!" 