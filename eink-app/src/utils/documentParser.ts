import { Chapter, Book } from '../types/book';
import { TypographySettings } from '../types/eink';

/**
 * Calculates estimated pages for a chapter given typography parameters and screen dimensions
 */
export function paginateText(
  text: string,
  settings: TypographySettings,
  containerWidth: number = 360,
  containerHeight: number = 600
): string[] {
  if (!text || text.trim().length === 0) return [''];

  // Calculate approximate characters per line & lines per page
  const usableWidth = Math.max(200, containerWidth - settings.horizontalMargin * 2);
  const usableHeight = Math.max(300, containerHeight - 100); // 100px for header/footer margins

  // Estimate character width (approx 0.55 * fontSize for serif fonts)
  const avgCharWidth = settings.fontSize * 0.52;
  const charsPerLine = Math.floor(usableWidth / avgCharWidth);

  // Line height in pixels
  const lineHeight = settings.fontSize * settings.lineHeightRatio;
  const linesPerPage = Math.floor(usableHeight / lineHeight);

  const targetCharsPerPage = Math.max(250, Math.floor(charsPerLine * linesPerPage * 0.9));

  const paragraphs = text.split(/\n\s*\n/);
  const pages: string[] = [];
  let currentPageText = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (currentPageText.length + trimmedPara.length + 2 > targetCharsPerPage) {
      if (currentPageText.length > 0) {
        pages.push(currentPageText.trim());
        currentPageText = '';
      }

      // If a single paragraph is larger than an entire page, split by sentence
      if (trimmedPara.length > targetCharsPerPage) {
        const sentences = trimmedPara.split(/(?<=[.?!])\s+/);
        for (const sentence of sentences) {
          if (currentPageText.length + sentence.length + 1 > targetCharsPerPage) {
            if (currentPageText.length > 0) {
              pages.push(currentPageText.trim());
              currentPageText = '';
            }
          }
          currentPageText += (currentPageText ? ' ' : '') + sentence;
        }
      } else {
        currentPageText = trimmedPara;
      }
    } else {
      currentPageText += (currentPageText ? '\n\n' : '') + trimmedPara;
    }
  }

  if (currentPageText.trim().length > 0) {
    pages.push(currentPageText.trim());
  }

  return pages.length > 0 ? pages : [text];
}

/**
 * Calculates estimated reading time in minutes (assuming 220 words/min)
 */
export function calculateReadingTimeMinutes(text: string, wpm: number = 220): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Strips HTML tags from text
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses simple raw text file content into structured chapters
 */
export function parseRawTextIntoBook(
  fileName: string,
  content: string,
  fileUri?: string
): Book {
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const paragraphs = content.split(/\n\s*\n/);
  
  // Try to detect chapter markers e.g. "BÖLÜM 1", "CHAPTER 1", "I.", "1."
  const chapterRegex = /^(bölüm|chapter|part|kısım|\d+\.|\b[ivxlcdm]+\.)/i;
  const chapters: Chapter[] = [];

  let currentChapterTitle = 'Bölüm 1';
  let currentChapterContent: string[] = [];
  let order = 1;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed.length < 80 && chapterRegex.test(trimmed)) {
      if (currentChapterContent.length > 0) {
        chapters.push({
          id: `ch-${order}`,
          order,
          title: currentChapterTitle,
          content: currentChapterContent.join('\n\n'),
        });
        order++;
        currentChapterContent = [];
      }
      currentChapterTitle = trimmed;
    } else {
      currentChapterContent.push(trimmed);
    }
  }

  if (currentChapterContent.length > 0 || chapters.length === 0) {
    chapters.push({
      id: `ch-${order}`,
      order,
      title: currentChapterTitle,
      content: currentChapterContent.join('\n\n'),
    });
  }

  return {
    id: `book-${Date.now()}`,
    title: cleanTitle,
    author: 'Bilinmeyen Yazar',
    format: 'txt',
    fileUri,
    fileSize: `${(content.length / 1024).toFixed(1)} KB`,
    description: 'İçe aktarılan metin belgesi.',
    chapters,
    addedAt: Date.now(),
    totalPages: chapters.reduce((acc, c) => acc + Math.ceil(c.content.length / 1200), 0),
    tags: ['İçe Aktarılan', 'Metin'],
  };
}
