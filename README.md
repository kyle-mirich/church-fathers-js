# Orthodox Reader - Modern Reader Application

A modern, feature-rich reading application for the Ante-Nicene Fathers with note-taking, highlighting, and search capabilities.

## ✨ Features

### 📖 Reading Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Collapsible Sidebar**: Navigation with works, chapters, and table of contents
- **Font Size Control**: Adjustable reading font size
- **Dark/Light Mode**: Theme switching with persistence
- **Free Scrolling**: Smooth scrolling through works content

### 📝 Note-Taking & Highlighting
- **Text Selection**: Select any text to create notes or highlights
- **7 Highlight Colors**: Yellow, Blue, Green, Pink, Orange, Purple, Red
- **Rich Notes**: Support for different note types (General, Question, Insight, Cross Reference, Prayer, Commentary)
- **Tags**: Organize notes with custom tags
- **Text Linking**: Notes linked to specific text selections
- **Persistent Storage**: All notes and highlights saved locally

### 🔍 Search & Navigation
- **Full-Text Search**: Search across all works or current work only
- **Live Results**: Real-time search with match counts and previews
- **Smart Navigation**: Click search results to jump to exact location
- **Chapter Navigation**: Quick access to any chapter or section

### 💾 Data Management
- **Local Storage**: Uses browser localStorage for immediate persistence
- **Export/Import**: Download your data as JSON backup
- **Migration Ready**: Designed for easy migration to Supabase/PostgreSQL
- **Storage Stats**: View usage statistics and data overview

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18.0 or higher
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd modern-reader
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 How to Use

### Reading
1. **Select a Work**: Use the sidebar to choose from available works
2. **Navigate**: Click on parts and chapters in the table of contents
3. **Adjust Settings**: Use the settings button to change theme and font size
4. **Search**: Click the search icon to find specific content

### Note-Taking
1. **Select Text**: Highlight any text in the reading area
2. **Choose Action**: Click the note or highlight icon in the popup toolbar
3. **Create Notes**: Add title, content, tags, and choose note type
4. **View Notes**: Access your notes in the "Notes" tab of the sidebar

### Highlighting
1. **Select Text**: Highlight the text you want to highlight
2. **Choose Color**: Click the highlighter icon and select a color
3. **Apply**: The highlight is immediately applied and saved
4. **Manage**: View and delete highlights in the Notes panel

### Data Management
1. **Export Data**: Click "Data Management" → "Export Data" to download JSON backup
2. **Import Data**: Use "Import Data" to restore from a backup file
3. **View Stats**: See your usage statistics and storage information

## 🏗️ Architecture

### Storage System
The application uses a flexible storage architecture:

- **Current**: localStorage for immediate persistence
- **Future**: Easy migration to Supabase or PostgreSQL
- **Migration**: Built-in tools for data export/import

### Key Components
- `NotesProvider`: Context provider for storage abstraction
- `useLocalNotes`/`useLocalHighlights`: localStorage hooks
- `useNotes`/`useHighlights`: Database hooks (ready for cloud migration)
- `TextSelectionToolbar`: UI for creating notes/highlights
- `DataManagementDialog`: Tools for backup and migration

### File Structure
```
app/
├── api/                     # API routes (ready for cloud storage)
├── reader-with-sidebar.tsx  # Main application component
components/
├── note-taking/            # Note-taking UI components
├── data-management.tsx     # Data export/import tools
hooks/
├── use-local-storage-notes.ts  # localStorage implementation
├── use-notes.ts                # Database implementation (future)
lib/
├── notes-provider.tsx      # Storage abstraction layer
├── text-selection.ts       # Text selection utilities
├── migration-utils.ts      # Data migration tools
```

## 🔄 Migrating to Cloud Storage

When ready to migrate to Supabase or PostgreSQL:

1. **Set up your database** with the provided schema
2. **Update configuration** in `lib/notes-provider.tsx`:
   ```typescript
   const USE_LOCAL_STORAGE = false // Change to false
   ```
3. **Configure database connection** in your environment
4. **Run migration** using the Data Management tools
5. **Test** the migration with exported data

The data structure is identical between storage methods, ensuring seamless migration.

## 🛠️ Development

### Adding New Features
1. **Notes**: Extend the `Note` interface and update forms
2. **Storage**: Both localStorage and database hooks support the same API
3. **UI**: Components are designed for easy extension

### Customization
- **Highlight Colors**: Modify `highlightColors` in components
- **Note Types**: Update `noteTypes` array for different categories
- **Storage**: Swap between localStorage and database easily

## 📊 Data Structure

### Notes
```typescript
interface Note {
  id: string
  userId: string
  workTitle: string
  partTitle?: string
  chapterTitle: string
  title?: string
  content: string
  noteType: string
  selectedText?: string
  selectionStart?: number
  selectionEnd?: number
  elementId?: string
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

### Highlights
```typescript
interface Highlight {
  id: string
  userId: string
  workTitle: string
  partTitle?: string
  chapterTitle: string
  selectedText: string
  color: string
  selectionStart: number
  selectionEnd: number
  elementId?: string
  xpath?: string
  createdAt: string
  updatedAt: string
}
```

## 🎨 Styling

The application uses:
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Lucide React** for icons
- **Custom highlight styles** in `styles/highlights.css`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

[Add your license information here]

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Styled with Tailwind CSS
- Note-taking inspired by modern reading applications

---

**Enjoy your enhanced reading experience with full note-taking capabilities!** 📚✨