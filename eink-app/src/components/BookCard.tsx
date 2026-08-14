import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Book, ReadingProgress } from '../types/book';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';
import { GeometricSeal } from './GeometricSeal';

interface BookCardProps {
  book: Book;
  progress?: ReadingProgress;
  viewMode?: 'grid' | 'list';
  index?: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  progress,
  viewMode = 'grid',
  index = 0,
  onPress,
  onLongPress,
}) => {
  const { eink } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const percent = progress?.progressPercent || 0;
  const isAltSlate = index % 3 === 0;

  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
        style={[
          styles.listContainer,
          {
            backgroundColor: theme.surfaceDark,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Left Index Badge matching Reference */}
        <View style={styles.listIndexBadge}>
          <Text style={styles.listIndexText}>{index + 1}</Text>
        </View>

        {/* Info */}
        <View style={styles.listInfo}>
          <View style={styles.heuristicRow}>
            <Text style={styles.heuristicTag}>
              {book.tags?.[0]?.toUpperCase() || 'KLASİK'}
            </Text>
            <Text style={styles.formatText}>{book.format.toUpperCase()}</Text>
          </View>

          <Text style={styles.listTitle} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={styles.listAuthor} numberOfLines={1}>
            {book.author}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${percent}%`, backgroundColor: theme.parchment },
                ]}
              />
            </View>
            <Text style={styles.progressText}>%{percent}</Text>
          </View>
        </View>

        {/* Geometric Seal Watermark */}
        <GeometricSeal size={36} opacity={0.4} />
      </TouchableOpacity>
    );
  }

  // Grid Card Mode (Reference Editorial Card Structure)
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={[
        styles.gridContainer,
        {
          backgroundColor: isAltSlate ? theme.surfaceSlate : theme.surfaceDark,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Top Header Row with Heuristic Badge & Geometric Seal */}
      <View style={styles.cardTopRow}>
        <View style={styles.tagWrapper}>
          <Text style={styles.heuristicTag}>
            {book.tags?.[0]?.toUpperCase() || 'E-INK OKUMA'}
          </Text>
          <Text style={styles.cardIndexText}>#{index + 1}</Text>
        </View>
        <GeometricSeal size={28} opacity={0.55} />
      </View>

      {/* Title & Author */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>
          {book.author}
        </Text>
      </View>

      {/* 2px Accent Divider Line from Reference */}
      <View style={styles.dividerLine} />

      {/* Bottom Description & Progress */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {book.description || 'Dinamik reflow ve elektroforetik e-paper deneyimi.'}
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percent}%`, backgroundColor: theme.parchment },
              ]}
            />
          </View>
          <Text style={styles.progressText}>%{percent}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    width: '48%',
    minHeight: 220,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagWrapper: {
    gap: 2,
  },
  heuristicTag: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(244, 241, 208, 0.7)',
  },
  cardIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F4F1D0',
  },
  cardBody: {
    marginVertical: 10,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
    lineHeight: 20,
  },
  cardAuthor: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.75)',
  },
  dividerLine: {
    width: 42,
    height: 2,
    backgroundColor: '#F4F1D0',
    marginVertical: 6,
  },
  cardFooter: {
    gap: 8,
  },
  cardDesc: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.65)',
    lineHeight: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F4F1D0',
    fontVariant: ['tabular-nums'],
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  listIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#546382',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listIndexText: {
    color: '#F4F1D0',
    fontSize: 12,
    fontWeight: '700',
  },
  listInfo: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  heuristicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(244, 241, 208, 0.5)',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F1D0',
  },
  listAuthor: {
    fontSize: 11,
    color: 'rgba(244, 241, 208, 0.75)',
  },
});
