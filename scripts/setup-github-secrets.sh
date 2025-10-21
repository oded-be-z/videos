#!/bin/bash

###############################################################################
# GitHub Secrets Setup Script
#
# Automatically configures all required GitHub repository secrets
# for Seekapa YouTube automation deployment.
#
# Prerequisites:
#   - GitHub CLI installed (gh)
#   - Authenticated with gh auth login
#   - Repository access to oded-be-z/videos
#
# Usage:
#   chmod +x scripts/setup-github-secrets.sh
#   ./scripts/setup-github-secrets.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Seekapa YouTube Automation - Secrets Setup     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ Error: GitHub CLI (gh) is not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  sudo apt install gh"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo ""
    echo "Please authenticate first:"
    echo "  gh auth login"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
echo ""

# Confirm repository
REPO="oded-be-z/videos"
echo -e "${BLUE}Repository: ${REPO}${NC}"
echo ""

read -p "Continue with secrets setup? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Setting GitHub Secrets...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to set secret with confirmation
set_secret() {
    local name=$1
    local value=$2
    local display_value="${value:0:20}...${value: -10}"

    echo -n "Setting ${name}... "

    if echo "$value" | gh secret set "$name" -R "$REPO" 2>/dev/null; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
}

# Load API keys from ~/.claude/CLAUDE.md
SYNTHESIA_KEY=$(grep "SYNTHESIA_API_KEY = " ~/.claude/CLAUDE.md | head -1 | sed 's/.*= "\(.*\)"/\1/' | tr -d '"')
AZURE_KEY=$(grep "AZURE_AI_FOUNDRY_KEY = " ~/.claude/CLAUDE.md | head -1 | sed 's/.*= "\(.*\)"/\1/' | tr -d '"')
PERPLEXITY_KEY=$(grep "PERPLEXITY_API_KEY = " ~/.claude/CLAUDE.md | head -1 | sed 's/.*= "\(.*\)"/\1/' | tr -d '"')

# Set Synthesia API Key
set_secret "SYNTHESIA_API_KEY" "$SYNTHESIA_KEY"

# Set Azure OpenAI Key
set_secret "AZURE_OPENAI_KEY" "$AZURE_KEY"

# Set Azure OpenAI Endpoint
set_secret "AZURE_OPENAI_ENDPOINT" "https://brn-azai.openai.azure.com/"

# Set Perplexity API Key
set_secret "PERPLEXITY_API_KEY" "$PERPLEXITY_KEY"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}YouTube OAuth Credentials Required${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "To complete YouTube API setup, you need to:"
echo ""
echo "1. Create Google Cloud project"
echo "2. Enable YouTube Data API v3"
echo "3. Create OAuth 2.0 credentials"
echo "4. Generate refresh token"
echo ""
echo "Run this script to get YouTube credentials:"
echo "  ${GREEN}node scripts/get-youtube-token.js${NC}"
echo ""
echo "Then set these secrets manually:"
echo "  ${BLUE}gh secret set YOUTUBE_CLIENT_ID --body \"your_client_id\"${NC}"
echo "  ${BLUE}gh secret set YOUTUBE_CLIENT_SECRET --body \"your_client_secret\"${NC}"
echo "  ${BLUE}gh secret set YOUTUBE_REFRESH_TOKEN --body \"your_refresh_token\"${NC}"
echo ""

# Verify secrets were set
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Verifying Secrets...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

gh secret list -R "$REPO"

echo ""
echo -e "${GREEN}✅ Core secrets configured successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Complete YouTube OAuth setup (see DEPLOYMENT.md Step 2)"
echo "2. Select Synthesia avatars (see DEPLOYMENT.md Step 3)"
echo "3. Run local tests: ${GREEN}npm test${NC}"
echo "4. Enable production: ${GREEN}gh workflow run daily-video.yml${NC}"
echo ""
