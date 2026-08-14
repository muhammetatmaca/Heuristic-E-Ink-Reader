import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';

interface ReaderFooterProps {
  currentPage: number;
  totalPages: number;
  chapterTitle: string;
  readingTimeLeftMin: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  showControls?: boolean;
}

export const ReaderFooter: React.FC<ReaderFooterProps> = ({
  currentPage,
  totalPages,
  chapterTitle,
  readingTimeLeftMin,
  onPrevPage,
  onNextPage,
  showControls = false,
}) => {
  const insets = useSafeAreaInsets();
  const { eink } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const percent = totalPages > 0 ? Math.round(((currentPage + 1) / totalPages) * 100) : 0;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: showControls ? theme.surfaceDark : 'transparent',
          borderTopColor: showControls ? 'rgba(244, 241, 208, 0.15)' : 'transparent',
          borderTopWidth: showControls ? 1 : 0,
        },
      ]}
    >
      {/* 1. Status Information Bar */}
      <View style={styles.statusRow}>
        <Text
          style={[styles.statusChapter, { color: showControls ? '#F4F1D0' : theme.textMuted }]}
          numberOfLines={1}
        >
          {chapterTitle}
        </Text>

        <Text
          style={[styles.statusProgress, { color: showControls ? '#F4F1D0' : theme.textMuted }]}
        >
          {readingTimeLeftMin > 0 ? `${readingTimeLeftMin} dk • ` : ''}
          %{percent} • {currentPage + 1}/{Math.max(1, totalPages)}
        </Text>
      </View>

      {/* 2. Interactive Navigation Controls (Always perfectly fitting within screen boundaries) */}
      {showControls && (
        <View style={styles.controlsWrapper}>
          {/* Progress track */}
          <View style={styles.trackBg}>
            <View
              style={[
                styles.trackFill,
                { width: `${Math.max(2, percent)}%`, backgroundColor: theme.parchment },
              ]}
            />
          </View>

          {/* Previous / Next buttons row - Perfectly balanced 3-column layout */}
          <View style={styles.buttonsRow}>
            {/* Previous Page Button */}
            <TouchableOpacity
              onPress={onPrevPage}
              disabled={isFirstPage}
              activeOpacity={0.7}
              style={[
                styles.navBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: '#354057',
                  opacity: isFirstPage ? 0.35 : 1,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={16} color="#F4F1D0" />
              <Text style={styles.navBtnText} numberOfLines={1}>
                Önceki
              </Text>
            </TouchableOpacity>

            {/* Mode & Page Badge */}
            <View style={styles.badgePill}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {eink.refreshMode.toUpperCase()} • {currentPage + 1}/{Math.max(1, totalPages)}
              </Text>
            </View>

            {/* Next Page Button */}
            <TouchableOpacity
              onPress={onNextPage}
              disabled={isLastPage}
              activeOpacity={0.7}
              style={[
                styles.navBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: '#354057',
                  opacity: isLastPage ? 0.35 : 1,
                },
              ]}
            >
              <Text style={styles.navBtnText} numberOfLines={1}>
                Sonraki
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#F4F1D0" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 15,
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusChapter: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '500',
    marginRight: 8,
  },
  statusProgress: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  controlsWrapper: {
    marginTop: 6,
    gap: 8,
  },
  trackBg: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1.5,
    width: '100%',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
  },
  navBtnText: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
    letterSpacing: 0.3,
  },
});
