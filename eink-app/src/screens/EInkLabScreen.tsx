import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';
import { DitherVisualizer } from '../components/DitherVisualizer';
import { GeometricSeal } from '../components/GeometricSeal';
import { ColorSchemeMode, RefreshMode } from '../types/eink';
import { getWaveformTelemetry } from '../utils/ditherEngine';

export const EInkLabScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    eink,
    setColorScheme,
    setRefreshMode,
    triggerManualFlash,
    updateEinkSettings,
    pushGhostingSnapshot,
    clearGhosting,
    ghostingStack,
  } = useSettingsStore();

  const theme = COLOR_THEMES[eink.colorScheme];
  const [ambientTemp, setAmbientTemp] = useState<number>(22);

  const waveformModes: {
    key: RefreshMode;
    title: string;
    tag: string;
    speedMs: number;
    ghosting: string;
    flicker: string;
    desc: string;
  }[] = [
    {
      key: 'fast_a2',
      title: 'A2 (Hızlı 1-Bit)',
      tag: '100-120 ms',
      speedMs: 120,
      ghosting: 'Yüksek (Her sayfada birikir)',
      flicker: 'Sıfır Flaşlama',
      desc: 'Sadece siyah ve beyaz uç gerilimler verilir, ara gri tonlar atlanır. 3D Page Flip ile anında sayfa geçişi.',
    },
    {
      key: 'du',
      title: 'DU (Direct Update)',
      tag: '200-240 ms',
      speedMs: 220,
      ghosting: 'Orta Seviye',
      flicker: 'Flaşsız Geçiş',
      desc: 'Hafif ters voltaj ile hızlı arayüz menü güncellemeleri sağlar.',
    },
    {
      key: 'regal',
      title: 'Regal (Diferansiyel LUT)',
      tag: '280-350 ms',
      speedMs: 320,
      ghosting: 'Çok Düşük (%1-2)',
      flicker: 'Lokal Mikro Dalga',
      desc: 'Eski ve yeni piksel matrisinin farkını alarak sadece değişen piksellere lokal ters voltaj uygular. Ekranı karartmadan ghosting\'i siler.',
    },
    {
      key: 'glr16',
      title: 'GLR16 (Metin Odaklı Gri)',
      tag: '450-500 ms',
      speedMs: 480,
      ghosting: 'Minimum',
      flicker: 'Hafif Geçiş',
      desc: '16 gri seviyeli kitap sayfaları için optimize edilmiş net tipografi modu.',
    },
    {
      key: 'gc16',
      title: 'GC16 (Tam Çakım & Temizlik)',
      tag: '850-1000 ms',
      speedMs: 950,
      ghosting: 'SIFIR (0)',
      flicker: 'Tam S/B Flaşlama',
      desc: 'Pikselleri önce tam siyaha (-15V), ardından tam beyaza (+15V) sürerek partiküllerin kinetik hafızasını sıfırlar.',
    },
  ];

  const activeTelemetry = getWaveformTelemetry(eink.refreshMode);
  const tempMultiplier = ambientTemp < 10 ? 1.4 : ambientTemp > 35 ? 0.85 : 1.0;
  const compensatedDuration = Math.round(activeTelemetry.totalDurationMs * tempMultiplier);

  const colorPalettes: { key: ColorSchemeMode; title: string; desc: string; hexBg: string; hexText: string }[] = [
    {
      key: 'paperwhite',
      title: 'Day Paperwhite',
      desc: '#F3F3F3 - Yüksek kontrastlı, göz dostu mat kağıt hissi.',
      hexBg: '#F3F3F3',
      hexText: '#212222',
    },
    {
      key: 'warm_cream',
      title: 'Kitap Kağıdı (Warm Cream)',
      desc: '#F4F1D0 - Referans sarı-krem nostaljik mat kitap sayfası.',
      hexBg: '#F4F1D0',
      hexText: '#1F1E1C',
    },
    {
      key: 'amber_sepia',
      title: 'Sıcak Amber (Gece Modu)',
      desc: '#F4ECD8 - Melatonin salgısını koruyan mavi ışık filtreli tayf.',
      hexBg: '#F4ECD8',
      hexText: '#2C251C',
    },
    {
      key: 'anti_halation',
      title: 'Halasyon Önleyici Koyu Mod',
      desc: '#212222 & #F4F1D0 - Astigmatizmde ışık halesini ve göz yorgunluğunu önler.',
      hexBg: '#212222',
      hexText: '#F4F1D0',
    },
    {
      key: 'pure_monochrome',
      title: 'Saf E-Ink 16-Ton',
      desc: '#EDEDED - 16-seviye elektroforetik Kindle Carta ekran simülasyonu.',
      hexBg: '#EDEDED',
      hexText: '#0D0D0D',
    },
  ];

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTag, { color: theme.accent }]}>HEURISTIC • OPTICAL ENGINEERING</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>E-Ink Laboratuvarı</Text>
        </View>
        <GeometricSeal size={40} opacity={0.6} />
      </View>

      {/* 1. Dithering & Micro-capsules */}
      <DitherVisualizer />

      {/* 2. Waveform Modes & Driving Voltage Oscilloscope */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceDark, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardCategory}>WAVEFORM ENGINE</Text>
            <Text style={styles.cardTitle}>LUT Voltaj Sürüşü & Osiloskop</Text>
          </View>
          <GeometricSeal size={32} opacity={0.5} />
        </View>
        <View style={styles.dividerLine} />
        <Text style={styles.cardDesc}>
          Her mod mikro-kapsüllere farklı voltaj darbe dizisi (+15V / -15V / 0V) uygular. 3D Page Flip hızını ve ghosting miktarını belirler.
        </Text>

        {/* Waveform Mode Selector Grid */}
        <View style={styles.modeGrid}>
          {waveformModes.map((m, idx) => {
            const isSelected = eink.refreshMode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                onPress={() => setRefreshMode(m.key)}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                    borderColor: isSelected ? '#F4F1D0' : 'transparent',
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.modeCardHeader}>
                  <Text style={styles.modeIndex}>#{idx + 1}</Text>
                  <Text style={styles.modeTitle}>{m.title}</Text>
                  <View style={styles.speedTag}>
                    <Text style={styles.speedTagText}>{m.tag}</Text>
                  </View>
                </View>
                <Text style={styles.modeDescText}>{m.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Voltage Pulse Timeline */}
        <View style={styles.oscilloscopeBox}>
          <View style={styles.oscHeader}>
            <Text style={styles.oscTitle}>
              LUT Sürüş Çizelgesi: {activeTelemetry.modeName}
            </Text>
            <Text style={styles.oscDuration}>
              {compensatedDuration} ms ({ambientTemp}°C)
            </Text>
          </View>

          {/* Pulse Bars */}
          <View style={styles.pulseBarContainer}>
            {activeTelemetry.pulses.map((p, idx) => {
              const flexWidth = p.durationRatio;
              const isPositive = p.voltage > 0;
              const isNegative = p.voltage < 0;
              const barColor = isPositive ? '#2E7D32' : isNegative ? '#C62828' : '#757575';
              return (
                <View key={`pulse-${idx}`} style={{ flex: flexWidth, gap: 2 }}>
                  <View
                    style={[
                      styles.pulseBar,
                      {
                        backgroundColor: barColor,
                        height: isPositive ? 26 : isNegative ? 26 : 10,
                        alignSelf: 'stretch',
                      },
                    ]}
                  >
                    <Text style={styles.pulseVoltText}>
                      {p.voltage > 0 ? `+${p.voltage}V` : `${p.voltage}V`}
                    </Text>
                  </View>
                  <Text style={styles.pulseLabel} numberOfLines={1}>
                    {p.label.split(' ')[0]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Temperature Stepper */}
          <View style={styles.tempRow}>
            <Text style={styles.tempLabel}>
              Ortam Sıcaklığı (Viskozite & LUT Süresi):
            </Text>
            <View style={styles.tempStepper}>
              <TouchableOpacity
                onPress={() => setAmbientTemp((t) => Math.max(-5, t - 5))}
                style={styles.tempBtn}
              >
                <Text style={styles.tempBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.tempValueText}>{ambientTemp}°C</Text>
              <TouchableOpacity
                onPress={() => setAmbientTemp((t) => Math.min(45, t + 5))}
                style={styles.tempBtn}
              >
                <Text style={styles.tempBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Trigger Waveform Button */}
        <TouchableOpacity
          onPress={triggerManualFlash}
          style={[styles.flashBtn, { backgroundColor: theme.surfaceSlate }]}
        >
          <MaterialCommunityIcons name="flash" size={18} color="#F4F1D0" />
          <Text style={styles.flashBtnText}>Bu Waveform Modunu Ekrana Uygula</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Ghosting Accumulation Simulator */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceDark, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardCategory}>OPTICAL RESIDUE</Text>
            <Text style={styles.cardTitle}>Ghosting (Hayalet İz) Birikimi</Text>
          </View>
          <GeometricSeal size={32} opacity={0.5} />
        </View>
        <View style={styles.dividerLine} />
        <Text style={styles.cardDesc}>
          A2 modunda ardışık 3D sayfa çevirmede biriken hayalet izleri simüle edin ve GC16 ile kinetik sıfırlama yapın.
        </Text>

        <View style={styles.ghostingStatsRow}>
          <Text style={styles.ghostingStatText}>
            Aktif Hayalet İz Katmanları: <Text style={{ fontWeight: '700', color: '#F4F1D0' }}>{ghostingStack.length} Katman</Text>
          </Text>
        </View>

        <View style={styles.ghostingActionsGrid}>
          <TouchableOpacity
            onPress={() => {
              const testTexts = [
                'Bölüm I: Balta girmemiş ormanlarda boa yılanı avını bütün olarak yutar...',
                'Bölüm II: Çölde bir ses duydum: "Lütfen bana bir koyun çizer misiniz?"...',
                'Bölüm III: Küçük prens başka bir gezegenden gelmişti, çok küçüktü...',
              ];
              const sample = testTexts[ghostingStack.length % testTexts.length];
              pushGhostingSnapshot(sample);
            }}
            style={[styles.ghostBtn, { backgroundColor: '#354057' }]}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={16} color="#F4F1D0" />
            <Text style={styles.ghostBtnText}>A2 Sayfa Çevir (+Gölge)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerManualFlash();
              clearGhosting();
            }}
            style={[styles.ghostBtn, { backgroundColor: theme.surfaceSlate }]}
          >
            <MaterialCommunityIcons name="broom" size={16} color="#F4F1D0" />
            <Text style={styles.ghostBtnText}>GC16 Tam Temizlik</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Color Science & Halation Prevention */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceDark, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardCategory}>COLOR ERGONOMICS</Text>
            <Text style={styles.cardTitle}>Renk Bilimi & Halasyon Önleme</Text>
          </View>
          <GeometricSeal size={32} opacity={0.5} />
        </View>
        <View style={styles.dividerLine} />
        <Text style={styles.cardDesc}>
          Karanlıkta saf siyah üzerine saf beyaz yerine, yumuşak krem ve halasyon önleyici tonlar göz bebeği yorgunluğunu önler.
        </Text>

        <View style={styles.palettesList}>
          {colorPalettes.map((p) => {
            const isSelected = eink.colorScheme === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setColorScheme(p.key)}
                style={[
                  styles.paletteItem,
                  {
                    backgroundColor: p.hexBg,
                    borderColor: isSelected ? '#546382' : 'transparent',
                    borderWidth: isSelected ? 2.5 : 1,
                  },
                ]}
              >
                <View style={styles.paletteContent}>
                  <Text style={[styles.paletteTitle, { color: p.hexText }]}>
                    {p.title} {isSelected && '✓'}
                  </Text>
                  <Text style={[styles.paletteDescText, { color: p.hexText, opacity: 0.8 }]}>
                    {p.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
    marginBottom: 4,
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
  cardDesc: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.75)',
    lineHeight: 16,
    marginBottom: 10,
  },
  modeGrid: {
    gap: 8,
    marginVertical: 4,
  },
  modeCard: {
    padding: 12,
    borderRadius: 8,
  },
  modeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modeIndex: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
    marginRight: 6,
  },
  modeTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  speedTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  speedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F4F1D0',
  },
  modeDescText: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.7)',
    lineHeight: 14,
  },
  oscilloscopeBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1E1F1F',
    marginTop: 10,
    gap: 8,
  },
  oscHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oscTitle: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  oscDuration: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  pulseBarContainer: {
    flexDirection: 'row',
    height: 42,
    alignItems: 'center',
    gap: 4,
  },
  pulseBar: {
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseVoltText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pulseLabel: {
    fontSize: 8,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.5)',
    textAlign: 'center',
  },
  tempRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tempLabel: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.8)',
  },
  tempStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#354057',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F1D0',
  },
  tempValueText: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
    minWidth: 32,
    textAlign: 'center',
  },
  flashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  flashBtnText: {
    color: '#F4F1D0',
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
  },
  ghostingStatsRow: {
    marginVertical: 4,
  },
  ghostingStatText: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.8)',
  },
  ghostingActionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  ghostBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ghostBtnText: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  palettesList: {
    gap: 8,
    marginTop: 2,
  },
  paletteItem: {
    padding: 12,
    borderRadius: 8,
  },
  paletteContent: {
    gap: 2,
  },
  paletteTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  paletteDescText: {
    fontSize: 10,
    lineHeight: 14,
  },
});
