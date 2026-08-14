const fs = require('fs');
const path = require('path');

function stripHtml(html) {
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

function getAllFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) getAllFiles(full, list);
    else list.push(full);
  }
  return list;
}

// 1. Parse Gezgin Satıcı
const gdmAllFiles = getAllFiles('C:/Users/muham/Downloads/epub_gdm').filter(f => f.includes('Gezgin Satici_split_') && (f.endsWith('.html') || f.endsWith('.xhtml'))).sort();
const gdmChapters = [];
let chapNum = 1;

for (const filePath of gdmAllFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const text = stripHtml(content);
  if (text.length > 50) {
    let titleMatch = content.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
    let title = titleMatch ? stripHtml(titleMatch[1]) : ('Bölüm ' + chapNum);
    if (!title || title.length > 60 || title.includes('epubindir')) title = 'Bölüm ' + chapNum;
    gdmChapters.push({
      id: 'gdm-ch-' + chapNum,
      title: title,
      content: text,
      order: chapNum,
    });
    chapNum++;
  }
}

// 2. Parse Years of Grace
const barnesAllFiles = getAllFiles('C:/Users/muham/Downloads/epub_barnes').filter(f => f.includes('20260821-e_split_') && (f.endsWith('.html') || f.endsWith('.xhtml'))).sort();
const barnesChapters = [];
let bNum = 1;

for (const filePath of barnesAllFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const text = stripHtml(content);
  if (text.length > 80) {
    let titleMatch = content.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
    let title = titleMatch ? stripHtml(titleMatch[1]) : ('Chapter ' + bNum);
    if (!title || title.length > 60) title = 'Chapter ' + bNum;
    barnesChapters.push({
      id: 'barnes-ch-' + bNum,
      title: title,
      content: text,
      order: bNum,
    });
    bNum++;
  }
}

const defaultBooks = [
  {
    id: 'book-gezgin-satici',
    title: 'Gezgin Satıcı',
    author: 'Guy De Maupassant',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    totalPages: 120,
    format: 'epub',
    description: 'Guy de Maupassant\'ın gerçekçi ve vurucu insan tahlilleri içeren klasik eseri.',
    addedAt: Date.now() - 86400000 * 2,
    tags: ['Klasik', 'Roman', 'EPUB'],
    chapters: gdmChapters
  },
  {
    id: 'book-years-of-grace',
    title: 'Years of Grace',
    author: 'Margaret Ayer Barnes',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
    totalPages: 240,
    format: 'epub',
    description: '1931 Pulitzer Kurgu Ödüllü unutulmaz roman.',
    addedAt: Date.now() - 86400000,
    tags: ['Roman', 'Pulitzer', 'EPUB'],
    chapters: barnesChapters
  }
];

const fileContent = `import { Book } from '../types/book';

export const DEFAULT_BOOKS: Book[] = ${JSON.stringify(defaultBooks, null, 2)};
`;

fs.writeFileSync('c:/Users/muham/Documents/eink/eink-app/src/constants/defaultBooks.ts', fileContent, 'utf8');
console.log('Successfully updated defaultBooks.ts with orders and coverImage!');
