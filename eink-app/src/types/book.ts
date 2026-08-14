export interface Chapter {
  id: string;
  title: string;
  content: string; // Plain text or HTML formatted string
  pageCount?: number;
  order: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterIndex: number;
  pageIndex: number;
  title: string;
  createdAt: number;
  snippet?: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  chapterIndex: number;
  pageIndex: number;
  text: string;
  note?: string;
  color?: string;
  createdAt: number;
}

export interface ReadingProgress {
  bookId: string;
  currentChapterIndex: number;
  currentPageIndex: number;
  totalChapters: number;
  progressPercent: number; // 0 to 100
  lastReadTimestamp: number;
  totalTimeSpentSeconds: number;
  wordsRead: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string; // URL or base64 or placeholder style
  format: 'epub' | 'pdf' | 'txt' | 'builtin';
  fileUri?: string;
  fileSize?: string;
  description?: string;
  chapters: Chapter[];
  addedAt: number;
  totalPages?: number;
  tags?: string[];
}
