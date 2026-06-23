#!/bin/bash

# Basic SocialSyncs CLI Usage Example
# Make sure to set your API key first: export SOCIALSYNCS_API_KEY=your_key

echo "🚀 SocialSyncs CLI Example Workflow"
echo ""

# Check if API key is set
if [ -z "$SOCIALSYNCS_API_KEY" ]; then
    echo "❌ SOCIALSYNCS_API_KEY is not set!"
    echo "Set it with: export SOCIALSYNCS_API_KEY=your_api_key"
    exit 1
fi

echo "✅ API key is set"
echo ""

# 1. List integrations
echo "📋 Step 1: Listing connected integrations..."
socialsyncs integrations:list
echo ""

# 2. Create a post
echo "📝 Step 2: Creating a test post..."
socialsyncs posts:create \
  -c "Hello from SocialSyncs CLI! This is an automated test post." \
  -s "$(date -u -v+1H +%Y-%m-%dT%H:%M:%SZ)" # Schedule 1 hour from now
echo ""

# 3. List posts
echo "📋 Step 3: Listing recent posts..."
socialsyncs posts:list -l 5
echo ""

echo "✅ Example workflow completed!"
echo ""
echo "💡 Tips:"
echo "  - Use -i flag to specify integrations when creating posts"
echo "  - Upload images with: socialsyncs upload ./path/to/image.png"
echo "  - Delete posts with: socialsyncs posts:delete <post-id>"
echo "  - Get help: socialsyncs --help"
