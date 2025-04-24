#!/bin/bash
# Install Sharp specifically for Linux
npm install --platform=linux --arch=x64 sharp

# Install other dependencies with pnpm
pnpm install

# Build the Next.js app
pnpm run build