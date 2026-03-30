#!/bin/bash

# Build script for WordPress.org version of MotionPlayer for Rive plugin

PLUGIN_NAME="motion-player-rive"
PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD_DIR="$PLUGIN_DIR/build-wp-org"
PLUGIN_FILE="$PLUGIN_DIR/${PLUGIN_NAME}.php"

# Extract version from plugin header (avoid matching "version" inside Description, etc.)
VERSION=$(grep -E "^[[:space:]]*\*[[:space:]]*Version:[[:space:]]*" "$PLUGIN_FILE" | head -1 | sed -e 's/^[[:space:]]*\*[[:space:]]*Version:[[:space:]]*\([0-9.]*\).*/\1/' | tr -d '\r\n ')

# Validate version was found
if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from plugin header."
    exit 1
fi

ZIP_NAME="${PLUGIN_NAME}-${VERSION}-wp-org.zip"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building WordPress.org version of ${PLUGIN_NAME} plugin v${VERSION}...${NC}"

# Clean previous builds
if [ -d "$BUILD_DIR" ]; then
    echo "Cleaning previous build..."
    rm -rf "$BUILD_DIR"
fi

# Create build directory
mkdir -p "$BUILD_DIR/$PLUGIN_NAME"

# Core plugin files
cp "$PLUGIN_DIR/motion-player-rive.php" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/uninstall.php" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/readme.txt" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/LICENSE" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/index.php" "$BUILD_DIR/$PLUGIN_NAME/"

# Copy directories
cp -r "$PLUGIN_DIR/includes" "$BUILD_DIR/$PLUGIN_NAME/"
cp -r "$PLUGIN_DIR/assets" "$BUILD_DIR/$PLUGIN_NAME/"
cp -r "$PLUGIN_DIR/blocks" "$BUILD_DIR/$PLUGIN_NAME/"
cp -r "$PLUGIN_DIR/languages" "$BUILD_DIR/$PLUGIN_NAME/"

# Remove development files
find "$BUILD_DIR/$PLUGIN_NAME" -name ".DS_Store" -delete
find "$BUILD_DIR/$PLUGIN_NAME" -name "*.log" -delete
find "$BUILD_DIR/$PLUGIN_NAME" -name ".git*" -delete
find "$BUILD_DIR/$PLUGIN_NAME" -name "build-wp-org.sh" -delete

# Create zip file
echo "Creating zip archive..."
cd "$BUILD_DIR"
zip -r "$ZIP_NAME" "$PLUGIN_NAME" -x "*.DS_Store" "*.log" ".git*" "*.bak" > /dev/null

# Move zip to plugin directory
mv "$ZIP_NAME" "$PLUGIN_DIR/"

# Clean up build directory
rm -rf "$BUILD_DIR"

echo -e "${GREEN}✓ WordPress.org build complete!${NC}"
echo -e "${YELLOW}Plugin zip: $PLUGIN_DIR/$ZIP_NAME${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
