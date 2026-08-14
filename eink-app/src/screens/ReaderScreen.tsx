import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { useReaderStore } from '../store/readerStore';
import { useLibraryStore } from '../store/libraryStore';
import { COLOR_THEMES } from '../constants/theme';
import { paginateText, calculateReadingTimeMinutes } from '../utils/documentParser';
import { EInkDisplaySurface } from '../components/EInkDisplaySurface';
import { ReaderHeader } from '../components/ReaderHeader';
import { ReaderFooter } from '../components/ReaderFooter';
import { TableOfContentsModal } from '../components/TableOfContentsModal';
import { TypographySettingsModal } from '../components/TypographySettingsModal';
import { EInkSettingsModal } from '../components/EInkSettingsModal';
import { SearchModal } from '../components/SearchModal';
import { RealBookPageFlip } from '../components/RealBookPageFlip';
import { PDFViewerSurface } from '../components/PDFViewerSurface';
import { Bookmark } from '../types/book';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ReaderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { eink, typography, triggerManualFlash, pushGhostingSnapshot, clearGhosting } =
    useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const {
    currentBookId,
    currentChapterIndex,
    currentPageIndex,
    isMenuVisible,
    isTocVisible,
    isTypographyVisible,
    isEinkSettingsVisible,
    isSearchVisible,
    setChapterIndex,
    setPageIndex,
    nextPage,
    prevPage,
    toggleMenu,
    setTocVisible,
    setTypographyVisible,
    setEinkSettingsVisible,
    setSearchVisible,
    incrementPagesSinceFlash,
    resetPagesSinceFlash,
  } = useReaderStore();

  const { books, updateProgress, getProgress } = useLibraryStore();
  const currentBook = books.find((b) => b.id === currentBookId) || books[0];
  const isPdf = currentBook?.format === 'pdf' && currentBook?.fileUri;

  const [pdfTotalPages, setPdfTotalPages] = useState<number>(currentBook?.totalPages || 20);

  const currentChapter =
    currentBook?.chapters[currentChapterIndex] || currentBook?.chapters[0];

  // EPUB/Text dynamic pagination
  const pages = useMemo(() => {
    if (isPdf || !currentChapter) return [''];
    return paginateText(currentChapter.content, typography, SCREEN_WIDTH, SCREEN_HEIGHT);
  }, [
    isPdf,
    currentChapter,
    typography.fontSize,
    typography.fontFamily,
    typography.lineHeightRatio,
    typography.horizontalMargin,
    typography.paragraphSpacing,
  ]);

  const currentPageText = pages[currentPageIndex] || pages[0] || '';
  const nextPageText =
    pages[currentPageIndex + 1] ||
    (currentChapterIndex < (currentBook?.chapters.length || 1) - 1
      ? 'Sonraki Bölüm...'
      : '');
  const prevPageText =
    pages[currentPageIndex - 1] ||
    (currentChapterIndex > 0 ? 'Önceki Bölüm...' : '');
  const totalPagesCount = isPdf ? pdfTotalPages : pages.length;

  const handleFlipNext = () => {
    if (isPdf) {
      if (currentPageIndex < pdfTotalPages - 1) {
        setPageIndex(currentPageIndex + 1);
        triggerWaveformFlashIfNeeded();
      }
      return;
    }

    pushGhostingSnapshot(currentPageText);
    const moved = nextPage(totalPagesCount, currentPageText);
    if (!moved && currentChapterIndex < currentBook.chapters.length - 1) {
      setChapterIndex(currentChapterIndex + 1);
    }
    triggerWaveformFlashIfNeeded();
  };

  const handleFlipPrev = () => {
    if (isPdf) {
      if (currentPageIndex > 0) {
        setPageIndex(currentPageIndex - 1);
        triggerWaveformFlashIfNeeded();
      }
      return;
    }

    pushGhostingSnapshot(currentPageText);
    const moved = prevPage(currentPageText);
    if (!moved && currentChapterIndex > 0) {
      setChapterIndex(currentChapterIndex - 1);
    }
    triggerWaveformFlashIfNeeded();
  };

  const triggerWaveformFlashIfNeeded = () => {
    const count = incrementPagesSinceFlash();
    if (eink.refreshMode === 'gc16' || count >= eink.flashFrequency) {
      triggerManualFlash();
      resetPagesSinceFlash();
    } else if (eink.refreshMode === 'regal') {
      clearGhosting();
    }
  };

  useEffect(() => {
    if (!currentBook) return;
    const overallPercent = Math.min(
      100,
      Math.round(
        isPdf
          ? ((currentPageIndex + 1) / Math.max(1, pdfTotalPages)) * 100
          : ((currentChapterIndex * 10 + currentPageIndex + 1) /
              Math.max(1, currentBook.chapters.length * 10)) *
              100
      )
    );
    const existingProgress = getProgress(currentBook.id);
    updateProgress(currentBook.id, {
      currentChapterIndex,
      currentPageIndex,
      totalChapters: isPdf ? 1 : currentBook.chapters.length,
      progressPercent: overallPercent,
      totalTimeSpentSeconds: existingProgress.totalTimeSpentSeconds + 5,
      wordsRead: isPdf
        ? existingProgress.wordsRead + 250
        : existingProgress.wordsRead + (currentPageText.split(/\s+/).length || 0),
    });
  }, [currentChapterIndex, currentPageIndex, isPdf, pdfTotalPages]);

  const readingTimeLeft = useMemo(() => {
    if (isPdf) {
      return Math.max(1, Math.round((pdfTotalPages - currentPageIndex) * 1.5));
    }
    if (!currentChapter) return 1;
    return calculateReadingTimeMinutes(pages.slice(currentPageIndex).join(' '));
  }, [isPdf, pdfTotalPages, currentChapter, currentPageIndex, pages]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {isMenuVisible && (
        <ReaderHeader
          title={currentBook?.title || 'E-Ink Reader'}
          onBack={() => navigation.goBack()}
          onOpenLab={() => navigation.navigate('EInkLab')}
        />
      )}

      <EInkDisplaySurface style={styles.surface}>
        {isPdf && currentBook.fileUri ? (
          <PDFViewerSurface
            fileUri={currentBook.fileUri}
            currentPageIndex={currentPageIndex}
            onPageChanged={(pIdx, total) => {
              setPageIndex(pIdx);
              setPdfTotalPages(total);
            }}
            onTapCenter={toggleMenu}
          />
        ) : (
          <RealBookPageFlip
            currentPageText={currentPageText}
            nextPageText={nextPageText}
            prevPageText={prevPageText}
            chapterTitle={currentChapter?.title || ''}
            currentPageIndex={currentPageIndex}
            onNextPage={handleFlipNext}
            onPrevPage={handleFlipPrev}
            onTapCenter={toggleMenu}
          />
        )}
      </EInkDisplaySurface>

      <ReaderFooter
        currentPage={currentPageIndex}
        totalPages={totalPagesCount}
        chapterTitle={isPdf ? currentBook?.title || 'PDF' : currentChapter?.title || ''}
        readingTimeLeftMin={readingTimeLeft}
        onPrevPage={handleFlipPrev}
        onNextPage={handleFlipNext}
        showControls={isMenuVisible}
      />

      <TableOfContentsModal
        visible={isTocVisible}
        onClose={() => setTocVisible(false)}
        onSelectChapter={(idx) => {
          setChapterIndex(idx);
          setPageIndex(0);
        }}
        onSelectBookmark={(b: Bookmark) => {
          setChapterIndex(b.chapterIndex);
          setPageIndex(b.pageIndex);
        }}
      />
      <TypographySettingsModal
        visible={isTypographyVisible}
        onClose={() => setTypographyVisible(false)}
      />
      <EInkSettingsModal
        visible={isEinkSettingsVisible}
        onClose={() => setEinkSettingsVisible(false)}
      />
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setSearchVisible(false)}
        onNavigateToMatch={(chapterIndex, snippet) => {
          setChapterIndex(chapterIndex);
          setPageIndex(0);
          Alert.alert('Bölüme Geçildi', `"${snippet}"`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  surface: { flex: 1 },
});
