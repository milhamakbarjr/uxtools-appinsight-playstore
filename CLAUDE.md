# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UX Tools PlayStore Analytics - A React Router 7 dashboard for tracking and analyzing Google Play Store app metrics. It scrapes reviews from the Play Store, performs sentiment/topic/pattern analysis, and presents the data through an interactive UI.

## Commands

```bash
# Development
bun run dev          # Start development server with Vite

# Production
bun run build        # Build for production
bun run start        # Run production server

# Code Quality
bun run lint         # Run ESLint
bun run typecheck    # Generate types and run TypeScript checking

# Testing (analysis modules)
bun run test:scraper     # Test Play Store scraper
bun run test:sentiment   # Test sentiment analysis
bun run test:topics      # Test topic analysis
bun run test:patterns    # Test pattern analysis
bun run test:analysis    # Test full analysis pipeline
bun run test:transformer # Test data transformers
```

## Architecture

### Tech Stack
- **Runtime**: Bun
- **Framework**: React Router v7 (framework mode) with Vite
- **UI**: React 19 + Tailwind CSS + Radix UI (shadcn/ui components)
- **Charts**: Recharts
- **Data**: google-play-scraper, natural (NLP), franc (language detection)

### Directory Structure

```
app/
├── routes.ts                  # Route configuration (file-based routing via @react-router/fs-routes)
├── routes/                    # Route files
│   ├── _index.tsx            # Home page with app search
│   └── analysis.$appId.tsx   # Analysis page (dynamic route)
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── app-analysis/         # Analysis tab components
│       ├── overview-tab.tsx
│       ├── reviews-tab.tsx
│       └── topics-tab.tsx
└── lib/
    ├── scraper/              # Play Store data fetching
    │   └── PlayStoreScraper.ts
    └── analysis/             # Review analysis pipeline
        ├── AnalysisService.ts      # Orchestrates analysis
        ├── SentimentAnalyzer.ts    # Sentiment scoring
        ├── TopicAnalyzer.ts        # Topic extraction
        ├── PatternAnalyzer.ts      # Usage patterns
        └── transformers/
            └── AnalysisTransformer.ts  # Converts analysis to UI data
```

### Key Configuration Files
- `react-router.config.ts` - React Router framework configuration
- `vite.config.ts` - Vite configuration with React Router plugin
- `app/routes.ts` - Route definitions using flatRoutes

### Data Flow

1. **Search** (`_index.tsx`): User searches for an app → loader calls `gplay.search()`
2. **Scrape** (`analysis.$appId.tsx`): `PlayStoreScraper` fetches reviews and app details
3. **Analyze** (`AnalysisService`): Runs sentiment, topic, and pattern analyzers
4. **Transform** (`AnalysisTransformer`): Converts raw analysis into tab-specific data structures
5. **Display**: Data passed to Overview/Reviews/Topics tab components

### Path Aliases
- `~/*` → `./app/*`
- `~/lib/*` → `./app/lib/*`

## Configuration Notes

- Review fetch limit is configured in `app/routes/analysis.$appId.tsx` via `PlayStoreScraper({ maxReviews: 1000, batchSize: 100 })`
- React Router types are auto-generated in `.react-router/types/` directory

## Another Notes
- always run bun run build everytime you finished with edits. To make sure the code is properly implemented