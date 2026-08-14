import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { useLibraryStore } from '../store/libraryStore';
import { COLOR_THEMES } from '../constants/theme';
import { GeometricSeal } from '../components/GeometricSeal';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { eink, typography, resetDefaults } = useSettingsStore();
  const { books, progressMap } = useLibraryStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const totalReadingSeconds = Object.values(progressMap).reduce(
    (acc, p) => acc + (p.totalTimeSpentSeconds || 0),
    0
  );
  const totalWords = Object.values(progressMap).reduce(
    (acc, p) => acc + (p.wordsRead || 0),
    0
  );

  const totalMinutes = Math.round(totalReadingSeconds / 60);

  const handleReset = () => {
    Alert.alert(
      'Varsayılan Ayarlara Dön',
      'Tüm E-Ink, kağıt ve tipografi ayarları orijinal durumuna sıfırlanacak. Devam etmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetDefaults();
            Alert.alert('Tamamlandı', 'Ayarlar başarıyla sıfırlandı.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTag, { color: theme.accent }]}>HEURISTIC • CONFIGURATION</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ayarlar & İstatistikler</Text>
        </View>
        <GeometricSeal size={36} opacity={0.6} />
      </View>

      {/* Reading Statistics Cards (Reference Editorial Cards) */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.surfaceDark, borderColor: theme.border }]}>
          <Text style={styles.statCategory}>HEURISTIC 1</Text>
          <Text style={styles.statValue}>{totalMinutes} dk</Text>
          <Text style={styles.statTitle}>Toplam Okuma</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.surfaceSlate, borderColor: theme.border }]}>
          <Text style={styles.statCategory}>HEURISTIC 2</Text>
          <Text style={styles.statValue}>{books.length}</Text>
          <Text style={styles.statTitle}>Kütüphane</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.surfaceDark, borderColor: theme.border }]}>
          <Text style={styles.statCategory}>HEURISTIC 3</Text>
          <Text style={styles.statValue}>%95</Text>
          <Text style={styles.statTitle}>Kağıt Matlığı</Text>
        </View>
      </View>

      {/* App & Research Details Card */}
      <View style={[styles.card, { backgroundColor: theme.surfaceDark, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardCategory}>SYSTEM ARCHITECTURE</Text>
            <Text style={styles.cardTitle}>E-Ink & Kağıt Motoru</Text>
          </View>
          <GeometricSeal size={32} opacity={0.5} />
        </View>
        <View style={styles.dividerLine} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kağıt Türü:</Text>
          <Text style={styles.infoValue}>{eink.paperType.toUpperCase()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dithering Motoru:</Text>
          <Text style={styles.infoValue}>{eink.ditherAlgorithm.toUpperCase()} (16-Level Carta)</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Waveform Sürüşü:</Text>
          <Text style={styles.infoValue}>{eink.refreshMode.toUpperCase()} (3D Page Flip)</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Yazı Tipi:</Text>
          <Text style={styles.infoValue}>{typography.fontFamily} ({typography.fontSize} pt)</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Aktif Renk:</Text>
          <Text style={styles.infoValue}>{eink.colorScheme.toUpperCase()}</Text>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        onPress={handleReset}
        style={[styles.resetBtn, { backgroundColor: theme.surfaceSlate }]}
      >
        <Feather name="refresh-cw" size={16} color="#F4F1D0" />
        <Text style={styles.resetBtnText}>Tüm Ayarları Orijinaline Sıfırla</Text>
      </TouchableOpacity>
    </ScrollView>
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
    paddingVertical: 10,
    marginBottom: 8,
  },
  headerTag: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  statCategory: {
    fontSize: 8,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: 'rgba(244, 241, 208, 0.5)',
    letterSpacing: 1.1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Roboto Mono',
    fontWeight: '800',
    color: '#F4F1D0',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  statTitle: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.75)',
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: 'rgba(244, 241, 208, 0.5)',
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
    marginTop: 2,
  },
  dividerLine: {
    width: 36,
    height: 2,
    backgroundColor: '#F4F1D0',
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 241, 208, 0.15)',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.7)',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  resetBtnText: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
});
