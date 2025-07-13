# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands should be run from the `app/` directory:

```bash
cd app/
```

- **Development server**: `npm run dev` or `yarn dev` - starts Vite dev server
- **Build extension**: `npm run build` or `yarn build` - builds Chrome extension for production
- **Preview**: `npm run preview` - builds and serves production build locally
- **Format code**: `npm run prettier` - formats TypeScript/TSX files with Prettier

## Project Architecture

This is a Japanese vocabulary learning Chrome extension (formerly PWA) built with React, Vite, and Tailwind CSS. It overrides the new tab page to display JLPT vocabulary words.

### Core Technology Stack
- **Frontend**: React 17 with TypeScript
- **State Management**: Jotai (atomic state management) 
- **Styling**: Tailwind CSS 3.x
- **Build Tool**: Vite 2.x
- **Extension Platform**: Chrome Extension Manifest V3
- **Data Fetching**: SWR for API calls and caching
- **Storage**: Chrome Extension Storage API (chrome.storage.local)

### Chrome Extension Specific Architecture

**Manifest V3 Structure**:
- New tab override via `chrome_url_overrides`
- Service worker background script at `src/sw/service-worker.ts`
- Extension popup for quick settings at `popup.html`
- Chrome extension storage instead of localStorage

**Key Extension Files**:
- `public/manifest.json` - Chrome extension manifest v3
- `src/sw/service-worker.ts` - Background service worker
- `popup.html` + `popup.js` - Extension popup interface
- `src/utils/extension-storage.ts` - Chrome storage utilities
- `src/utils/extension-storage-provider.ts` - Jotai storage provider for Chrome APIs

### State Management with Jotai

**Storage Integration**:
- Uses custom storage providers to integrate Jotai with chrome.storage.local
- Main store in `src/context/store.ts` contains all global atoms
- Uses `jotai-optics` for focused atom updates
- Persistent storage with custom storage providers for extension compatibility

**Component Structure**:
- Three main views: Word (`word`), Book (`book`), Settings (`settings`)
- View switching handled by `viewAtom` state
- Fade transitions between views using `FadeContainer` component
- All components are functional components with hooks

### Data Flow

**API Integration**:
- API endpoint: `https://jlpt-vocab-api.vercel.app/api`
- Words fetched on app initialization and cached via service worker
- Two learning modes: `ichigoichie` (one-time encounter) and `random`
- Progress tracking via `learnedAtom` and `metAtom` arrays stored in chrome.storage.local

**Extension Storage Migration**:
- Automatic migration from localStorage to chrome.storage.local on first load
- Maintains backward compatibility with existing user data

### Important Files

**Core Application**:
- `src/App.tsx` - Main app component with view routing and data loading
- `src/context/store.ts` - Jotai atoms for state management with Chrome storage
- `src/types.ts` - TypeScript type definitions

**Extension Infrastructure**:
- `public/manifest.json` - Extension manifest with permissions and configuration
- `src/sw/service-worker.ts` - Background service worker for extension functionality
- `src/utils/extension-storage.ts` - Chrome storage API wrapper
- `src/utils/extension-storage-provider.ts` - Jotai storage provider for Chrome

**Utilities**:
- `src/utils/api.tsx` - API functions and external service URLs
- `src/utils/use-fetch-with-cache.ts` - Custom hook for cached API calls
- `src/utils/use-audio.tsx` - Audio playback functionality

**Key Components**:
- `src/components/word.tsx` - Main word display card
- `src/components/furigana.tsx` - Japanese reading aids display
- `src/components/word-actions.tsx` - Word interaction buttons

### Learning System

The extension implements a spaced repetition-like system:
- **Levels**: JLPT levels 1-5 (configurable in popup and settings)
- **Modes**: 
  - `ichigoichie`: Words shown only once
  - `random`: Words can be revisited
- **Progress**: Tracks "learned" and "met" words separately in Chrome storage
- **Audio**: Pronunciation via external dictionary service

### Build and Deployment

**Build Process**:
- Vite builds the extension with multiple entry points (newtab, popup, service worker)
- Service worker compiled separately and output as `sw.js`
- Manual copy of additional files (popup.js, manifest.json, favicon.svg) to dist

**Extension Loading**:
- Load unpacked extension from `app/dist` folder in Chrome developer mode
- Manifest V3 compliance for Chrome Web Store distribution

### Styling Notes

- Uses Tailwind CSS with custom responsive font sizing
- Font: Uses serif font for Japanese text display
- Responsive design with mobile-first approach
- Color scheme: Stone/neutral tones

### API Integration

External services:
- Jisho.org for dictionary lookups
- Youdao for audio pronunciation  
- Custom JLPT vocab API for word data

### Extension Permissions

Required permissions in manifest:
- `storage` - for chrome.storage.local API
- Host permissions for external APIs (vocab API, pronunciation, dictionary)
- `chrome_url_overrides` for new tab page replacement