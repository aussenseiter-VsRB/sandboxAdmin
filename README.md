# Landing Page CMS Prototype

A minimal drag-and-drop content management system for building landing pages. This prototype allows you to create, edit, and preview multi-page landing pages using a block-based approach.

## Overview

This is a prototype internal tool that solves the problem of creating landing pages without needing to write HTML/CSS manually. It's a two-sided application with a React frontend and NestJS backend that stores data in a JSON file. The project is designed for rapid prototyping and demonstrates a complete drag-and-drop CMS with a builder interface, live preview, and basic page management.

## Architecture

```
React Frontend (Client) ↔ NestJS Backend (Server) ↔ JSON File (page.json)
```

The architecture is straightforward: the frontend is served from the `/client` directory, the backend runs from the `/server` directory, and data is persisted in `/server/data/page.json`. The two communicate via REST APIs on `http://localhost:3001`.

**Data Flow:**
- Frontend PUTs the full block array to `/page/:id` on save; backend overwrites in-memory/SQLite state with no diffing
- Frontend GETs the latest blocks from `/page/:id` on load and page switch
- Backend reads from/writing to `page.json` to persist changes across restarts
- Page metadata (id/name) is managed through `/pages` and `/pages` POST endpoints

## Tech Stack

| Technology | Version | What It's Used For | Why It Was Chosen |
|------------|---------|-------------------|-------------------|
| React | ^19.2.7 | Frontend UI, component rendering, drag-and-drop interactions | Modern React with hooks for functional components; excellent ecosystem |
| TypeScript | ~6.0.2 | Type safety for frontend, shared block type definitions | Prevents runtime errors and improves developer experience |
| Vite | ^8.1.1 | Frontend build tool and dev server | Fast development with Hot Module Replacement |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop functionality for blocks and reordering | Modern, accessible drag-and-drop library with granular control |
| @dnd-kit/sortable | ^10.0.0 | Sorting functionality for block reordering | Provides accessibility and smooth keyboard navigation |
| NestJS | ^11.0.1 | Backend framework | Structured, type-safe server with decorator-based architecture |
| TypeScript (Backend) | ^5.7.3 | Backend type safety | Consistent typing across frontend and backend |
| SQLite (via JSON) | Filesystem | Data storage | Simple file-based persistence for a prototype; easy to debug |
| ESLint/Prettier | Built-in | Code quality | Maintainable, consistent code style |

## Data Model

**Block (defined in `client/src/blocks/types.ts` and `server/src/page/page.service.ts`):**

```typescript
export interface Block {
  id: string;
  type: BlockType; // 'hero' | 'text' | 'image' | 'cta'
  props: Record<string, any>;
}
```

**Page (defined in `server/src/page/page.service.ts`):**

```typescript
interface PageData {
  id: string;
  name: string;
  blocks: Block[];
}
```

**Shared Type Definition:**
The `Block` interface is **duplicated** between frontend (`client/src/blocks/types.ts`) and backend (`server/src/page/page.service.ts`). This is a conscious design choice to ensure type consistency while allowing each side to maintain its own type definitions that match its implementation patterns.

**Block Fields Explained:**
- `id`: Unique identifier for the block (string, automatically generated)
- `type`: Block type from registry (string literal union: 'hero' | 'text' | 'image' | 'cta')
- `props`: Key-value store for block-specific properties (dynamic, varies by block type)

Page data is stored as an array of `PageData` objects in `/server/data/page.json`.

## Backend

### Endpoints

| Method | Path | Request Body | Response | What It Does |
|--------|------|--------------|----------|--------------|
| GET | `/pages` | - | `{ id: string; name: string }[]` | Lists all pages with their IDs and names |
| POST | `/pages` | `{ id: string; name: string }` | `{ id: string; name: string; blocks: Block[] }` | Creates a new page with empty blocks |
| GET | `/page/:id` | - | `{ blocks: Block[] }` | Retrieves the current blocks for a page |
| PUT | `/page/:id` | `{ blocks: Block[] }` | `{ blocks: Block[] }` | Overwrites all blocks for a page with new array (no diffing) |

### Validation

No validation is performed by the backend. All data from the frontend is accepted and persisted as-is.

### Module Structure

- `server/src/page/page.module.ts`: Module for page functionality
- `server/src/page/page.service.ts`: Service containing business logic, file I/O, and data persistence
- `server/src/page/page.controller.ts`: Controller with API endpoints

## Frontend

### Block Registry

**File**: `client/src/blocks/registry.ts`

The block registry is a constant mapping from block types to their definitions:

```typescript
export const blockRegistry: Record<BlockType, BlockDefinition> = {
  hero: {
    render: HeroBlock,    // Component for preview/live view
    edit: HeroEditor,     // Component for inline editing
    defaultProps: { ... }, // Default values when block is created
    label: 'Hero',        // Display name in palette
  },
  // ... text, image, cta blocks
};
```

**How it works:**
- Registry maps `BlockType` string literals to `BlockDefinition` objects
- Each definition includes render component (for preview) and edit component (for inline editing)
- Used by `Preview` component to render blocks and `Builder` to provide editor forms

### Drag-and-Drop System

**Palette vs. Canvas Distinction:**
- **Palette** (`Palette.tsx`): Located on the left, contains draggable block thumbnails for adding new blocks
- **Canvas** (`Canvas.tsx`): Central area showing the page's block structure with drop zones and sortable blocks

**Wiring:**
- **`DndContext`** (`Builder.tsx`): Main drag-drop context with sensors and collision detection
- **`useDraggable`** (`Palette.tsx`): Makes palette items draggable from the registry
- **`useSortable`** (`SortableBlock.tsx`): Makes blocks in the canvas sortable with keyboard navigation
- **`useDroppable`** (`DropZone.tsx`): Defines drop zones between blocks and at top/bottom

**Palette Collision Detection:**
The `paletteCollision` function in `Builder.tsx` specifically detects when palette items are dragged toward the canvas and routes them to drop zones:

```typescript
const paletteCollision: CollisionDetection = useMemo(
  () =>
    (args) => {
      const isPalette = args.active.data.current?.type === 'palette-item';
      if (isPalette) {
        const zones = args.droppableContainers.filter(
          (c) => typeof c.id === 'string' && c.id.startsWith('drop-zone-')
        );
        if (zones.length === 0) return [];
        return closestCenter({ ...args, droppableContainers: zones });
      }
      return closestCenter(args);
    },
  []
);
```

**Drop-zone Insertion:**
When a palette item is dropped on a drop zone:
1. Get the zone ID from `over.id` (e.g., "drop-zone-2")
2. Parse the index number from the zone ID
3. Create a new block with nextId counter, type from active, and defaultProps
4. Insert new block at that index in the blocks array
5. Pass updated array to parent via `onBlocksChange`

**Sorting (Block Reorder):**
When a block is dropped within the canvas:
1. Find oldIndex (block being moved) and newIndex (target position)
2. If oldIndex === newIndex or either is invalid, abort
3. Remove block from old position and insert at new position
4. Update blocks array via `onBlocksChange`

**Live Preview:**
- `Preview.tsx` component renders blocks using the registry
- Live updates when the builder changes, showing current state without saving

### Page/State Management

**Central State Management:**
- `App.tsx` holds global app state (pages, current page, view mode)
- **Pages list**: Fetched once on load from `/pages` endpoint
- **Current page**: Loaded from `/page/:id` when page changes or app loads
- **Blocks**: Held in local state, derived from API response

**Save/Load Workflow:**
1. Page change: Click page button → `handleSwitchPage()`
   - If dirty: saves first → then switches
   - If clean: switches immediately
2. Manual save: Click Save button → `handleSave()`
   - PUTs blocks array to `/page/:id`
   - Sets dirty=false on success
3. Load: Initial render → `useEffect` fetches `/pages` and `/page/:id`

### Component Tree

```
App.tsx (Root)
├── {isEmpty ? Empty Canvas : Canvas}
│   ├── Builder
│   │   ├── DndContext
│   │   │   ├── Palette (Draggable items)
│   │   │   ├── Canvas
│   │   │   │   ├── DropZone (top)
│   │   │   │   ├── SortableContext
│   │   │   │   │   ├── SortableBlock
│   │   │   │   │   └── DropZone (between blocks)
│   │   │   │   └── DropZone (bottom)
│   │   │   └── DragOverlay
│   │   └── Builder-specific logic (drag end handling, state updates)
│   └── Preview (when view==='preview')
└── Page selector UI
```

## Block Types

| Block Type | Props | What Each Prop Controls | Description |
|------------|-------|-------------------------|-------------|
| `hero` | `heading: string`<br>`subheading: string`<br>`bgColor: string` | Heading text, subheading text, background color | Full-width hero section with large heading and optional subheading |
| `text` | `content: string` | Plain text content | Markdown-able text block with auto-wrap and line height |
| `image` | `src: string`<br>`alt: string` | Image URL, alt text | Responsive image with fallback when no URL provided |
| `cta` | `text: string`<br>`link: string` | Button text, link URL | Click-through button styled as a prominent CTA |

## How to Add a New Block Type

1. **Add to registry** (`client/src/blocks/registry.ts`):
   - Import new component functions
   - Add entry to `blockRegistry` object with `render`, `edit`, `defaultProps`, `label`

2. **Create render component** (`client/src/blocks/components.tsx`):
   - Export `NewBlock` FC that receives `{ props: Record<string, any> }`
   - Returns JSX for live preview and rendering

3. **Create editor component** (`client/src/blocks/components.tsx`):
   - Export `NewBlockEditor` FC that receives `{ props, onChange }`
   - Provides UI for editing block properties

4. **Update types** (`client/src/blocks/types.ts`):
   - Add `'new'` to `BlockType` union literal type

5. **Update backend type** (`server/src/page/page.service.ts`):
   - Add `'new'` to block type literal type in `Block` interface

6. **Provide default props**:
   - Define sensible defaults in the registry entry

## How to Run It Locally

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. **Environment variables** (if needed):
   - Set `PORT` in `.env` file (default: 3001)

3. **Start the backend:**
   ```bash
   cd server
   npm start
   ```

4. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Open your browser:** Navigate to `http://localhost:5173`

The backend runs on port 3001, frontend on port 5173 by default.

## Known Limitations / What's NOT Implemented

- **No authentication**: Anyone can access and edit pages
- **No multi-user support**: No conflict detection or merge strategies
- **No versioning**: No way to see previous versions or revert changes
- **No real database**: Uses simple JSON file persistence in `server/data/page.json`
- **No undo/redo**: State changes are one-way unless re-saved
- **No real-time collaboration**: Only single-user editing
- **No validation**: Backend accepts any data without checking
- **No responsive design**: Simple static layout only
- **No SEO optimization**: Basic landing page structure only
- **No form handling**: Only simple blocks, no complex interactions
- **No error boundaries**: Component crashes bubble up to UI
- **No accessibility features**: Basic keyboard navigation only
- **No theming**: Fixed color scheme and styling

## Possible Next Steps

- Add authentication/authorization
- Implement real database (PostgreSQL with Prisma)
- Add undo/redo functionality
- Implement real-time collaboration
- Add form handling and complex interactions
- Implement responsive design and mobile support
- Add SEO optimization features
- Implement versioning and history
- Add drag-select and batch operations
- Incorporate WYSIWYG editing for rich text
- Add A/B testing capabilities
- Implement role-based access control
- Add analytics integration
- Create custom block templates
- Support importing/exporting page layouts

