import { create } from 'zustand';
import { Bookmark, Highlight } from '../types/book';

interface SearchMatch {
  chapterIndex: number;
  chapterTitle: string;
  snippet: string;
  matchIndex: number;
}

interface ReaderState {
  currentBookId: string | null;
  currentChapterIndex: number;
  currentPageIndex: number;
  previousPageSnapshot: string | null; // For authentic E-Ink ghosting simulation
  pagesSinceLastFullFlash: number;
  
  bookmarks: Bookmark[];
  highlights: Highlight[];
  
  // UI Modal visibility
  isMenuVisible: boolean;
  isTocVisible: boolean;
  isTypographyVisible: boolean;
  isEinkSettingsVisible: boolean;
  isSearchVisible: boolean;
  
  // Search
  searchQuery: string;
  searchResults: SearchMatch[];
  
  // Actions
  openBook: (bookId: string, initialChapter?: number, initialPage?: number) => void;
  setChapterIndex: (index: number) => void;
  setPageIndex: (index: number, snapshot?: string) => void;
  nextPage: (totalPagesInChapter: number, snapshot?: string) => boolean;
  prevPage: (snapshot?: string) => boolean;
  
  toggleMenu: () => void;
  setMenuVisible: (visible: boolean) => void;
  setTocVisible: (visible: boolean) => void;
  setTypographyVisible: (visible: boolean) => void;
  setEinkSettingsVisible: (visible: boolean) => void;
  setSearchVisible: (visible: boolean) => void;
  
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookmarkId: string) => void;
  isCurrentPageBookmarked: (bookId: string, chapterIndex: number, pageIndex: number) => boolean;
  
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (highlightId: string) => void;
  
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchMatch[]) => void;
  incrementPagesSinceFlash: () => number;
  resetPagesSinceFlash: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBookId: 'kucuk-prens',
  currentChapterIndex: 0,
  currentPageIndex: 0,
  previousPageSnapshot: null,
  pagesSinceLastFullFlash: 0,

  bookmarks: [
    {
      id: 'bm-1',
      bookId: 'kucuk-prens',
      chapterIndex: 0,
      pageIndex: 0,
      title: 'Bölüm I: Boa Yılanı',
      createdAt: Date.now() - 3600000 * 24,
      snippet: 'Altı yaşımdayken ilk balta girmemiş ormanlar üzerine...',
    },
  ],
  highlights: [],

  isMenuVisible: false,
  isTocVisible: false,
  isTypographyVisible: false,
  isEinkSettingsVisible: false,
  isSearchVisible: false,

  searchQuery: '',
  searchResults: [],

  openBook: (bookId, initialChapter = 0, initialPage = 0) =>
    set({
      currentBookId: bookId,
      currentChapterIndex: initialChapter,
      currentPageIndex: initialPage,
      previousPageSnapshot: null,
      pagesSinceLastFullFlash: 0,
      isMenuVisible: false,
      isTocVisible: false,
      isTypographyVisible: false,
      isEinkSettingsVisible: false,
      isSearchVisible: false,
    }),

  setChapterIndex: (currentChapterIndex) =>
    set({
      currentChapterIndex,
      currentPageIndex: 0,
      previousPageSnapshot: null,
    }),

  setPageIndex: (currentPageIndex, snapshot) =>
    set((state) => ({
      currentPageIndex,
      previousPageSnapshot: snapshot || state.previousPageSnapshot,
      pagesSinceLastFullFlash: state.pagesSinceLastFullFlash + 1,
    })),

  nextPage: (totalPagesInChapter, snapshot) => {
    const { currentPageIndex } = get();
    if (currentPageIndex < totalPagesInChapter - 1) {
      set((state) => ({
        currentPageIndex: currentPageIndex + 1,
        previousPageSnapshot: snapshot || null,
        pagesSinceLastFullFlash: state.pagesSinceLastFullFlash + 1,
      }));
      return true;
    }
    return false; // Can't go further in this chapter
  },

  prevPage: (snapshot) => {
    const { currentPageIndex } = get();
    if (currentPageIndex > 0) {
      set((state) => ({
        currentPageIndex: currentPageIndex - 1,
        previousPageSnapshot: snapshot || null,
        pagesSinceLastFullFlash: state.pagesSinceLastFullFlash + 1,
      }));
      return true;
    }
    return false;
  },

  toggleMenu: () => set((state) => ({ isMenuVisible: !state.isMenuVisible })),
  setMenuVisible: (isMenuVisible) => set({ isMenuVisible }),
  setTocVisible: (isTocVisible) => set({ isTocVisible }),
  setTypographyVisible: (isTypographyVisible) => set({ isTypographyVisible }),
  setEinkSettingsVisible: (isEinkSettingsVisible) => set({ isEinkSettingsVisible }),
  setSearchVisible: (isSearchVisible) => set({ isSearchVisible }),

  addBookmark: (bookmark) =>
    set((state) => ({ bookmarks: [bookmark, ...state.bookmarks] })),

  removeBookmark: (bookmarkId) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
    })),

  isCurrentPageBookmarked: (bookId, chapterIndex, pageIndex) => {
    const { bookmarks } = get();
    return bookmarks.some(
      (b) =>
        b.bookId === bookId &&
        b.chapterIndex === chapterIndex &&
        b.pageIndex === pageIndex
    );
  },

  addHighlight: (highlight) =>
    set((state) => ({ highlights: [highlight, ...state.highlights] })),

  removeHighlight: (highlightId) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== highlightId),
    })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),

  incrementPagesSinceFlash: () => {
    const next = get().pagesSinceLastFullFlash + 1;
    set({ pagesSinceLastFullFlash: next });
    return next;
  },

  resetPagesSinceFlash: () => set({ pagesSinceLastFullFlash: 0 }),
}));
