import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, ReadingProgress } from '../types/book';
import { DEFAULT_BOOKS } from '../constants/defaultBooks';

const STORAGE_BOOKS_KEY = '@eink_library_books';
const STORAGE_PROGRESS_KEY = '@eink_library_progress';

interface LibraryState {
  books: Book[];
  progressMap: Record<string, ReadingProgress>;
  searchQuery: string;
  selectedTag: string | null;
  viewMode: 'grid' | 'list';
  isLoading: boolean;

  // Actions
  loadPersistedLibrary: () => Promise<void>;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  updateProgress: (bookId: string, progress: Partial<ReadingProgress>) => void;
  getProgress: (bookId: string) => ReadingProgress;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: DEFAULT_BOOKS,
  progressMap: {},
  searchQuery: '',
  selectedTag: null,
  viewMode: 'grid',
  isLoading: false,

  loadPersistedLibrary: async () => {
    try {
      set({ isLoading: true });
      const [storedBooksJson, storedProgressJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_BOOKS_KEY),
        AsyncStorage.getItem(STORAGE_PROGRESS_KEY),
      ]);

      if (storedBooksJson) {
        const parsedBooks: Book[] = JSON.parse(storedBooksJson);
        if (parsedBooks && parsedBooks.length > 0) {
          set({ books: parsedBooks });
        }
      } else {
        // First run: save the 2 sample books to storage
        await AsyncStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(DEFAULT_BOOKS));
      }

      if (storedProgressJson) {
        const parsedProgress = JSON.parse(storedProgressJson);
        if (parsedProgress) {
          set({ progressMap: parsedProgress });
        }
      }
    } catch (e) {
      console.error('Failed to load persisted library:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setBooks: (books) => {
    set({ books });
    AsyncStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(books)).catch(console.error);
  },

  addBook: (book) => {
    set((state) => {
      const updated = [book, ...state.books];
      AsyncStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updated)).catch(console.error);
      return {
        books: updated,
        progressMap: {
          ...state.progressMap,
          [book.id]: {
            bookId: book.id,
            currentChapterIndex: 0,
            currentPageIndex: 0,
            totalChapters: book.chapters.length,
            progressPercent: 0,
            lastReadTimestamp: Date.now(),
            totalTimeSpentSeconds: 0,
            wordsRead: 0,
          },
        },
      };
    });
  },

  removeBook: (bookId) => {
    set((state) => {
      const updatedBooks = state.books.filter((b) => b.id !== bookId);
      const nextProgress = { ...state.progressMap };
      delete nextProgress[bookId];

      AsyncStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(updatedBooks)).catch(console.error);
      AsyncStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(nextProgress)).catch(console.error);

      return {
        books: updatedBooks,
        progressMap: nextProgress,
      };
    });
  },

  updateProgress: (bookId, newProgress) => {
    set((state) => {
      const existing = state.progressMap[bookId] || {
        bookId,
        currentChapterIndex: 0,
        currentPageIndex: 0,
        totalChapters: 1,
        progressPercent: 0,
        lastReadTimestamp: Date.now(),
        totalTimeSpentSeconds: 0,
        wordsRead: 0,
      };

      const updatedProgressMap = {
        ...state.progressMap,
        [bookId]: {
          ...existing,
          ...newProgress,
          lastReadTimestamp: Date.now(),
        },
      };

      AsyncStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(updatedProgressMap)).catch(console.error);

      return { progressMap: updatedProgressMap };
    });
  },

  getProgress: (bookId) => {
    const existing = get().progressMap[bookId];
    if (existing) return existing;
    return {
      bookId,
      currentChapterIndex: 0,
      currentPageIndex: 0,
      totalChapters: 1,
      progressPercent: 0,
      lastReadTimestamp: Date.now(),
      totalTimeSpentSeconds: 0,
      wordsRead: 0,
    };
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
