#!/bin/bash
# ============================================
# QUICK START GUIDE
# ============================================

echo "🚀 NodeJS Employee Management System - Quick Start"
echo "=================================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MongoDB is installed and running
echo "🔍 Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas"
    echo "📚 Guide: See SETUP_MONGODB.md for instructions"
else
    echo "✅ MongoDB CLI found"
fi

echo ""
echo "🌱 Seeding database with mock data..."
npm run seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open Terminal 1 and run: npm run server:dev"
    echo "   2. Open Terminal 2 and run: npm run dev"
    echo "   3. Open browser: http://localhost:5173"
    echo ""
    echo "🛠️  Useful commands:"
    echo "   - npm run prisma:studio  (GUI database manager)"
    echo "   - npm run seed           (Re-seed database)"
    echo "   - npm run build          (Build for production)"
    echo ""
else
    echo "❌ Database seeding failed!"
    echo "⚠️  Check your MongoDB connection in .env file"
    echo "📚 Guide: See SETUP_MONGODB.md for troubleshooting"
    exit 1
fi
