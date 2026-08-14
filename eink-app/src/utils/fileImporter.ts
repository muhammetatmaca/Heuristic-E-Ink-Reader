import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { Book, Chapter } from '../types/book';

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const ALLOWED_EXTENSIONS = ['epub', 'pdf', 'txt'];
const DISALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'tiff', 'ico'];

/**
 * Lets the user pick ONLY valid EPUB, PDF, or TXT book files from device storage.
 * Strictly blocks images, videos, audio, and unsupported formats with descriptive errors.
 */
export async function pickAndParseBook(): Promise<Book | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/epub+zip', 'application/pdf', 'text/plain'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const { uri, name, mimeType } = asset;

    const extension = name.split('.').pop()?.toLowerCase() || '';
    const cleanTitle = name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // 1. Image Check
    if (
      DISALLOWED_IMAGE_EXTENSIONS.includes(extension) ||
      mimeType?.startsWith('image/')
    ) {
      throw new Error(
        'Fotoğraf veya görsel dosyaları doğrudan kitap olarak eklenemez. Lütfen bir .EPUB veya .PDF e-kitap dosyası seçin.'
      );
    }

    // 2. Strict Allowed Format Check
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(
        `Desteklenmeyen dosya türü (".${extension}"). Yalnızca .EPUB ve .PDF (veya .TXT) formatındaki e-kitaplar desteklenmektedir.`
      );
    }

    // 3. Process PDF
    if (extension === 'pdf' || mimeType?.includes('pdf')) {
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
      const destUri = `${docDir}pdf_${Date.now()}_${name}`;
      await FileSystem.copyAsync({ from: uri, to: destUri });

      const newBook: Book = {
        id: `book-pdf-${Date.now()}`,
        title: cleanTitle,
        author: 'PDF Belgesi',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
        totalPages: 20,
        format: 'pdf',
        fileUri: destUri,
        description: `${cleanTitle} adlı orijinal PDF belgesi.`,
        addedAt: Date.now(),
        tags: ['PDF', 'Belge'],
        chapters: [
          {
            id: 'pdf-ch-1',
            title: cleanTitle,
            content: 'PDF Document',
            order: 1,
          },
        ],
      };

      return newBook;
    }

    // 4. Process EPUB
    if (extension === 'epub' || mimeType?.includes('epub')) {
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const zip = await JSZip.loadAsync(base64Data, { base64: true });
      const chapters: Chapter[] = [];
      let chapIndex = 1;

      const htmlFileNames = Object.keys(zip.files)
        .filter((fn) => !zip.files[fn].dir && (fn.endsWith('.html') || fn.endsWith('.xhtml') || fn.endsWith('.htm')))
        .sort();

      for (const fn of htmlFileNames) {
        const file = zip.files[fn];
        const content = await file.async('string');
        const text = stripHtml(content);

        if (text.length > 50) {
          const titleMatch = content.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
          let title = titleMatch ? stripHtml(titleMatch[1]) : `Bölüm ${chapIndex}`;
          if (!title || title.length > 50) title = `Bölüm ${chapIndex}`;

          chapters.push({
            id: `chap-${Date.now()}-${chapIndex}`,
            title,
            content: text,
            order: chapIndex,
          });
          chapIndex++;
        }
      }

      if (chapters.length === 0) {
        throw new Error('Seçilen EPUB dosyası içinde okunabilir metin veya bölüm bulunamadı.');
      }

      const newBook: Book = {
        id: `book-epub-${Date.now()}`,
        title: cleanTitle,
        author: 'Bilinmeyen Yazar',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
        totalPages: Math.max(10, Math.round(chapters.length * 5)),
        format: 'epub',
        description: `${cleanTitle} adlı EPUB eseri.`,
        addedAt: Date.now(),
        tags: ['EPUB', 'İçe Aktarılan'],
        chapters,
      };

      return newBook;
    }

    // 5. Process TXT
    if (extension === 'txt' || mimeType?.includes('text/plain')) {
      const rawText = await FileSystem.readAsStringAsync(uri);
      const cleanText = stripHtml(rawText);

      if (cleanText.length < 20) {
        throw new Error('Metin dosyası çok kısa veya boş.');
      }

      const chunkSize = 2500;
      const chapters: Chapter[] = [];

      for (let i = 0; i < cleanText.length; i += chunkSize) {
        const chunk = cleanText.substring(i, i + chunkSize);
        const chapNum = Math.floor(i / chunkSize) + 1;
        chapters.push({
          id: `chap-${Date.now()}-${chapNum}`,
          title: `Bölüm ${chapNum}`,
          content: chunk,
          order: chapNum,
        });
      }

      const newBook: Book = {
        id: `book-txt-${Date.now()}`,
        title: cleanTitle,
        author: 'Metin Belgesi',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
        totalPages: chapters.length * 4,
        format: 'txt',
        description: `${cleanTitle} adlı metin belgesi.`,
        addedAt: Date.now(),
        tags: ['Metin', 'Belge'],
        chapters,
      };

      return newBook;
    }

    throw new Error('Yalnızca .EPUB ve .PDF formatındaki e-kitaplar eklenebilir.');
  } catch (err: any) {
    console.error('Book import validation error:', err);
    throw err;
  }
}
