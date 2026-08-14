import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { useReaderStore } from '../store/readerStore';
import { useLibraryStore } from '../store/libraryStore';
import { COLOR_THEMES } from '../constants/theme';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToMatch: (chapterIndex: number, snippet: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onNavigateToMatch,
}) => {
  const [query, setQuery] = useState('');
  const { eink } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const { currentBookId } = useReaderStore();
  const { books } = useLibraryStore();
  const currentBook = books.find((b) => b.id === currentBookId);

  // Perform instant search across all chapters of the current book
  const matches: { chapterIndex: number; chapterTitle: string; snippet: string; matchIndex: number }[] = [];

  if (query.trim().length >= 2 && currentBook) {
    const qLower = query.toLowerCase();
    currentBook.chapters.forEach((chapter, chIdx) => {
      const contentLower = chapter.content.toLowerCase();
      let pos = 0;
      let count = 0;

      while ((pos = contentLower.indexOf(qLower, pos)) !== -1 && count < 8) {
        const start = Math.max(0, pos - 40);
        const end = Math.min(chapter.content.length, pos + query.length + 50);
        const snippet = (start > 0 ? '...' : '') + chapter.content.substring(start, end).replace(/\n/g, ' ') + (end < chapter.content.length ? '...' : '');

        matches.push({
          chapterIndex: chIdx,
          chapterTitle: chapter.title,
          snippet,
          matchIndex: pos,
        });

        pos += query.length;
        count++;
      }
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Search Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
              ]}
            >
              <Feather name="search" size={18} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Kitap içinde ara..."
                placeholderTextColor={theme.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.cancelText, { color: theme.accent }]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {/* Results List */}
          <FlatList
            data={matches}
            keyExtractor={(_, index) => `match-${index}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather
                  name={query.length < 2 ? 'search' : 'alert-circle'}
                  size={32}
                  color={theme.textMuted}
                />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  {query.length < 2
                    ? 'Aramak için en az 2 harf yazın.'
                    : 'Eşleşen sonuç bulunamadı.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onNavigateToMatch(item.chapterIndex, item.snippet);
                  onClose();
                }}
                style={[
                  styles.matchCard,
                  { borderBottomColor: theme.border, backgroundColor: theme.surfaceAlt },
                ]}
              >
                <Text style={[styles.matchChapter, { color: theme.accent }]}>
                  {item.chapterTitle}
                </Text>
                <Text style={[styles.matchSnippet, { color: theme.text }]} numberOfLines={3}>
                  {item.snippet}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  modalContainer: {
    marginHorizontal: 16,
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  closeBtn: {
    paddingHorizontal: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  matchCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  matchChapter: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  matchSnippet: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
  },
});
