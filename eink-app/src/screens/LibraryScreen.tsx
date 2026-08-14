import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '../store/libraryStore';
import { useSettingsStore } from '../store/settingsStore';
import { useReaderStore } from '../store/readerStore';
import { COLOR_THEMES } from '../constants/theme';
import { BookCard } from '../components/BookCard';
import { GeometricSeal } from '../components/GeometricSeal';
import { pickAndParseBook } from '../utils/fileImporter';
import { OnboardingModal } from '../components/OnboardingModal';

const ONBOARDING_SEEN_KEY = '@eink_has_seen_onboarding';

export const LibraryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    books,
    progressMap,
    searchQuery,
    selectedTag,
    viewMode,
    isLoading,
    loadPersistedLibrary,
    addBook,
    removeBook,
    setSearchQuery,
    setSelectedTag,
    setViewMode,
  } = useLibraryStore();

  const { eink } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];
  const { openBook } = useReaderStore();
  const [isImporting, setIsImporting] = useState(false);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  useEffect(() => {
    loadPersistedLibrary();
    checkFirstTimeOnboarding();
  }, []);

  const checkFirstTimeOnboarding = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      if (!hasSeen) {
        setIsOnboardingVisible(true);
      }
    } catch (e) {
      console.error('Failed to check onboarding status:', e);
    }
  };

  const handleCloseOnboarding = async () => {
    setIsOnboardingVisible(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch (e) {
      console.error('Failed to save onboarding status:', e);
    }
  };

  const allTags = ['Tümü', 'EPUB', 'PDF', 'Klasik', 'Roman'];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      !selectedTag ||
      selectedTag === 'Tümü' ||
      (selectedTag === 'EPUB' && book.format === 'epub') ||
      (selectedTag === 'PDF' && book.format === 'pdf') ||
      (book.tags && book.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const handlePickDocument = async () => {
    try {
      setIsImporting(true);
      const newBook = await pickAndParseBook();
      if (newBook) {
        addBook(newBook);
        Alert.alert(
          'Kitap Başarıyla Eklendi',
          `"${newBook.title}" (${newBook.chapters.length} bölüm) cihaz hafızasına kaydedildi.`
        );
      }
    } catch (error: any) {
      Alert.alert('İçe Aktarma Hatası', error.message || 'Dosya okunurken bir hata oluştu.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenBook = (bookId: string) => {
    const progress = progressMap[bookId];
    openBook(bookId, progress?.currentChapterIndex || 0, progress?.currentPageIndex || 0);
    navigation.navigate('Reader');
  };

  const handleBookLongPress = (bookId: string, title: string) => {
    Alert.alert(
      title,
      'Bu kitabı kütüphaneden silmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => removeBook(bookId),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
    >
      {/* Top Header - Balanced without overflow */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.headerTag, { color: theme.accent }]}>HEURISTIC • E-INK</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            Kütüphane
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Onboarding / Guide Help Button (?) */}
          <TouchableOpacity
            onPress={() => setIsOnboardingVisible(true)}
            style={[styles.actionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
            accessibilityLabel="Felsefe & Rehber"
          >
            <Feather name="help-circle" size={17} color={theme.text} />
          </TouchableOpacity>

          {/* Grid / List View Toggle */}
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={[styles.actionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
            accessibilityLabel="Görünüm Değiştir"
          >
            <Feather
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={17}
              color={theme.text}
            />
          </TouchableOpacity>

          {/* Add Book Button */}
          <TouchableOpacity
            onPress={handlePickDocument}
            disabled={isImporting}
            style={[styles.importBtn, { backgroundColor: theme.surfaceSlate, borderColor: theme.border }]}
            accessibilityLabel="Kitap Ekle"
          >
            {isImporting ? (
              <ActivityIndicator size="small" color="#F4F1D0" />
            ) : (
              <>
                <Feather name="plus" size={15} color="#F4F1D0" />
                <Text style={styles.importBtnText}>Ekle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Editorial Card */}
      <View style={[styles.heroCard, { backgroundColor: theme.surfaceSlate }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroCategory}>HEURISTIC</Text>
          <Text style={styles.heroTitle}>Aesthetic-Usability Effect</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroDesc}>
            Kullanıcılar estetik açıdan dengeli ve kağıt sadeliğindeki arayüzleri her zaman daha kullanışlı ve odaklanabilir algılarlar.
          </Text>
        </View>
        <GeometricSeal size={74} circleColor="#3D4C65" squareColor="#F4F1D0" opacity={0.65} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Feather name="search" size={17} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Kitaplıkta ara (Başlık, yazar)..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tags Bar */}
      <View style={styles.tagsBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={allTags}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tagsContent}
          renderItem={({ item }) => {
            const isSelected = (!selectedTag && item === 'Tümü') || selectedTag === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTag(item === 'Tümü' ? null : item)}
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: isSelected ? theme.surfaceDark : theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isSelected ? '#F4F1D0' : theme.textSecondary },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Books List / Grid */}
      <FlatList
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={[styles.booksListContent, { paddingBottom: 100 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="book-open-outline" size={44} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Kitap Bulunamadı</Text>
            <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
              Arama kriterlerinize uygun kitap bulunamadı veya henüz kitap eklenmedi.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <BookCard
            book={item}
            index={index}
            progress={progressMap[item.id]}
            viewMode={viewMode}
            onPress={() => handleOpenBook(item.id)}
            onLongPress={() => handleBookLongPress(item.id, item.title)}
          />
        )}
      />

      {/* 10-Slide Fullscreen Literary & E-Ink Onboarding Modal */}
      <OnboardingModal
        visible={isOnboardingVisible}
        onClose={handleCloseOnboarding}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 8,
  },
  headerTitleGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTag: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
  },
  importBtnText: {
    color: '#F4F1D0',
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    paddingRight: 10,
    gap: 3,
  },
  heroCategory: {
    color: 'rgba(244, 241, 208, 0.5)',
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  heroTitle: {
    color: '#F4F1D0',
    fontSize: 16,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
  },
  heroDivider: {
    width: 32,
    height: 2,
    backgroundColor: '#F4F1D0',
    marginVertical: 3,
  },
  heroDesc: {
    color: 'rgba(244, 241, 208, 0.8)',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    lineHeight: 15,
  },
  searchSection: {
    marginVertical: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  tagsBar: {
    marginVertical: 4,
  },
  tagsContent: {
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  booksListContent: {
    paddingTop: 6,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
});
