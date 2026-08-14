import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { useReaderStore } from '../store/readerStore';
import { useLibraryStore } from '../store/libraryStore';
import { COLOR_THEMES } from '../constants/theme';
import { Chapter, Bookmark, Highlight } from '../types/book';

interface TableOfContentsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectChapter: (index: number) => void;
  onSelectBookmark: (bookmark: Bookmark) => void;
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  visible,
  onClose,
  onSelectChapter,
  onSelectBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'bookmarks' | 'highlights'>('chapters');
  const { eink } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const {
    currentBookId,
    currentChapterIndex,
    bookmarks,
    highlights,
    removeBookmark,
    removeHighlight,
  } = useReaderStore();

  const { books } = useLibraryStore();
  const currentBook = books.find((b) => b.id === currentBookId);
  const currentBookmarks = bookmarks.filter((b) => b.bookId === currentBookId);
  const currentHighlights = highlights.filter((h) => h.bookId === currentBookId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
              {currentBook?.title || 'İçindekiler'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('chapters')}
              style={[
                styles.tabItem,
                activeTab === 'chapters' && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'chapters' ? theme.text : theme.textMuted },
                ]}
              >
                Bölümler ({currentBook?.chapters.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('bookmarks')}
              style={[
                styles.tabItem,
                activeTab === 'bookmarks' && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'bookmarks' ? theme.text : theme.textMuted },
                ]}
              >
                Yer İmleri ({currentBookmarks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('highlights')}
              style={[
                styles.tabItem,
                activeTab === 'highlights' && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'highlights' ? theme.text : theme.textMuted },
                ]}
              >
                Notlar ({currentHighlights.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'chapters' && (
            <FlatList
              data={currentBook?.chapters || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => {
                const isActive = index === currentChapterIndex;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelectChapter(index);
                      onClose();
                    }}
                    style={[
                      styles.chapterRow,
                      {
                        borderBottomColor: theme.border,
                        backgroundColor: isActive ? theme.surfaceAlt : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chapterOrder,
                        { color: isActive ? theme.accent : theme.textMuted },
                      ]}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[
                        styles.chapterTitle,
                        {
                          color: isActive ? theme.accent : theme.text,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    {isActive && (
                      <Ionicons name="checkmark" size={18} color={theme.accent} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {activeTab === 'bookmarks' && (
            <FlatList
              data={currentBookmarks}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="bookmark" size={32} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    Henüz yer imi eklenmedi.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bookmarkRow,
                    { borderBottomColor: theme.border, backgroundColor: theme.surfaceAlt },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.bookmarkTextContainer}
                    onPress={() => {
                      onSelectBookmark(item);
                      onClose();
                    }}
                  >
                    <Text style={[styles.bookmarkTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    {item.snippet && (
                      <Text
                        style={[styles.bookmarkSnippet, { color: theme.textMuted }]}
                        numberOfLines={2}
                      >
                        "{item.snippet}"
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeBookmark(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Feather name="trash-2" size={16} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {activeTab === 'highlights' && (
            <FlatList
              data={currentHighlights}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="edit-3" size={32} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    Henüz metin vurgusu veya not eklenmedi.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bookmarkRow,
                    { borderBottomColor: theme.border, backgroundColor: theme.surfaceAlt },
                  ]}
                >
                  <View style={styles.bookmarkTextContainer}>
                    <Text style={[styles.highlightText, { color: theme.text }]}>
                      "{item.text}"
                    </Text>
                    {item.note && (
                      <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                        Not: {item.note}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => removeHighlight(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Feather name="trash-2" size={16} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chapterOrder: {
    width: 28,
    fontSize: 13,
    fontWeight: '700',
  },
  chapterTitle: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  bookmarkTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  bookmarkTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  bookmarkSnippet: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  highlightText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  noteText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
  },
});
