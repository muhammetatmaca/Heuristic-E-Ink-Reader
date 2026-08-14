import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { useReaderStore } from '../store/readerStore';
import { COLOR_THEMES } from '../constants/theme';
import { GeometricSeal } from './GeometricSeal';

interface ReaderHeaderProps {
  title: string;
  onBack: () => void;
  onOpenLab?: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  title,
  onBack,
  onOpenLab,
}) => {
  const insets = useSafeAreaInsets();
  const { eink, triggerManualFlash } = useSettingsStore();
  const {
    currentBookId,
    currentChapterIndex,
    currentPageIndex,
    isTocVisible,
    isTypographyVisible,
    isEinkSettingsVisible,
    isSearchVisible,
    setTocVisible,
    setTypographyVisible,
    setEinkSettingsVisible,
    setSearchVisible,
    bookmarks,
    addBookmark,
    removeBookmark,
    isCurrentPageBookmarked,
  } = useReaderStore();

  const theme = COLOR_THEMES[eink.colorScheme];
  const isBookmarked = currentBookId
    ? isCurrentPageBookmarked(currentBookId, currentChapterIndex, currentPageIndex)
    : false;

  const handleToggleBookmark = () => {
    if (!currentBookId) return;
    if (isBookmarked) {
      const target = bookmarks.find(
        (b) =>
          b.bookId === currentBookId &&
          b.chapterIndex === currentChapterIndex &&
          b.pageIndex === currentPageIndex
      );
      if (target) removeBookmark(target.id);
    } else {
      addBookmark({
        id: `bm-${Date.now()}`,
        bookId: currentBookId,
        chapterIndex: currentChapterIndex,
        pageIndex: currentPageIndex,
        title: `Bölüm ${currentChapterIndex + 1}, Sayfa ${currentPageIndex + 1}`,
        createdAt: Date.now(),
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 10),
          backgroundColor: theme.surfaceDark,
          borderBottomColor: 'rgba(244, 241, 208, 0.15)',
        },
      ]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconButton}
          accessibilityLabel="Kitaplığa Dön"
        >
          <Ionicons name="chevron-back" size={22} color="#F4F1D0" />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.headerTag}>HEURISTIC READ</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {/* Quick Refresh Flash Button */}
          <TouchableOpacity
            onPress={triggerManualFlash}
            style={styles.iconButton}
            accessibilityLabel="E-Ink Ekranı Yenile"
          >
            <MaterialCommunityIcons name="refresh" size={19} color="#F4F1D0" />
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity
            onPress={() => setSearchVisible(!isSearchVisible)}
            style={styles.iconButton}
            accessibilityLabel="Kitap İçi Arama"
          >
            <Feather name="search" size={18} color="#F4F1D0" />
          </TouchableOpacity>

          {/* Bookmark Button */}
          <TouchableOpacity
            onPress={handleToggleBookmark}
            style={styles.iconButton}
            accessibilityLabel="Yer İmi"
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={19}
              color={isBookmarked ? theme.surfaceSlate : '#F4F1D0'}
            />
          </TouchableOpacity>

          {/* Typography Settings Button (Aa) */}
          <TouchableOpacity
            onPress={() => setTypographyVisible(!isTypographyVisible)}
            style={styles.iconButton}
            accessibilityLabel="Yazı Tipi ve Biçimlendirme"
          >
            <MaterialCommunityIcons name="format-size" size={20} color="#F4F1D0" />
          </TouchableOpacity>

          {/* E-Ink Visual Simulator Button */}
          <TouchableOpacity
            onPress={() => setEinkSettingsVisible(!isEinkSettingsVisible)}
            style={styles.iconButton}
            accessibilityLabel="E-Ink Optik Ayarları"
          >
            <MaterialCommunityIcons name="tune-vertical-variant" size={19} color="#F4F1D0" />
          </TouchableOpacity>

          {/* Table of Contents Button */}
          <TouchableOpacity
            onPress={() => setTocVisible(!isTocVisible)}
            style={styles.iconButton}
            accessibilityLabel="İçindekiler ve Notlar"
          >
            <Ionicons name="list" size={20} color="#F4F1D0" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    zIndex: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTag: {
    fontSize: 8,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: 'rgba(244, 241, 208, 0.5)',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
