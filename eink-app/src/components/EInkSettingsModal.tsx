import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';
import { ColorSchemeMode, DitherAlgorithm, RefreshMode, PaperType, InkWeight } from '../types/eink';
import { GeometricSeal } from './GeometricSeal';
import { getWaveformTelemetry } from '../utils/ditherEngine';

interface EInkSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabKey = 'paper' | 'color' | 'waveform' | 'dither';

export const EInkSettingsModal: React.FC<EInkSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    eink,
    updateEinkSettings,
    setColorScheme,
    setPaperType,
    setRefreshMode,
    setDitherAlgorithm,
    triggerManualFlash,
    resetDefaults,
    pushGhostingSnapshot,
    clearGhosting,
    ghostingStack,
  } = useSettingsStore();

  const theme = COLOR_THEMES[eink.colorScheme];
  const [activeTab, setActiveTab] = useState<TabKey>('paper');
  const [ambientTemp, setAmbientTemp] = useState<number>(22);

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'paper', label: 'DOKU & KAĞIT', icon: 'book-open-page-variant' },
    { key: 'color', label: 'RENK & IŞIK', icon: 'palette-outline' },
    { key: 'waveform', label: 'WAVEFORM & HIZ', icon: 'lightning-bolt' },
    { key: 'dither', label: 'DITHER & GHOST', icon: 'grain' },
  ];

  const paperTypes: { key: PaperType; label: string; desc: string }[] = [
    { key: 'deckle_rough', label: 'Tırtıklı & Ham Kesim', desc: 'Deckle-edge pürüzlü dişli kenarlar ve pamuk lif dokusu' },
    { key: 'book_parchment', label: 'Kitap Parşömeni', desc: 'Nostaljik sarı-mat kitap sayfası (#F4F1D0)' },
    { key: 'japanese_washi', label: 'Japon Washi', desc: 'Doğal uzun lifli organik doku' },
    { key: 'cotton_rag', label: 'Pamuklu Kağıt', desc: 'Mikro lifli doğal mat yüzey' },
    { key: 'kraft_recycled', label: 'Kraft Kağıdı', desc: 'Hafif ham rustik doku' },
    { key: 'smooth_vellum', label: 'Pürüzsüz Parşömen', desc: 'Modern pürüzsüz yüzey' },
    { key: 'newsprint', label: 'Gazete Kağıdı', desc: 'Yumuşak açık gri ton' },
  ];

  const inkWeights: { key: InkWeight; label: string }[] = [
    { key: 'light', label: 'İnce Mürekkep' },
    { key: 'regular', label: 'Standart E-Paper' },
    { key: 'bold_press', label: 'Pres Baskı (Koyu)' },
  ];

  const colorSchemes: { key: ColorSchemeMode; label: string; sub: string; bg: string; fg: string }[] = [
    { key: 'warm_cream', label: 'Kitap Kağıdı (Warm Cream)', sub: '#F4F1D0 • Klasik Sarı/Mat', bg: '#F4F1D0', fg: '#1F1E1C' },
    { key: 'paperwhite', label: 'Day Paperwhite', sub: '#F3F3F3 • Gün Işığı Kağıt', bg: '#F3F3F3', fg: '#212222' },
    { key: 'amber_sepia', label: 'Sıcak Amber', sub: '#F4ECD8 • Melatonin Koruma', bg: '#F4ECD8', fg: '#2C251C' },
    { key: 'anti_halation', label: 'Anti-Halasyon', sub: '#212222 • Gece Göz Koruması', bg: '#212222', fg: '#F4F1D0' },
    { key: 'pure_monochrome', label: 'Saf E-Ink 16-Ton', sub: '#EDEDED • Kindle Carta Gri', bg: '#EDEDED', fg: '#0D0D0D' },
  ];

  const waveformModes: { key: RefreshMode; label: string; tag: string; desc: string }[] = [
    { key: 'fast_a2', label: 'A2 (Hızlı 1-Bit)', tag: '100 ms • Hızlı', desc: 'Sadece siyah ve beyaz uç gerilimler verilir. 3D Page Flip anında geçer.' },
    { key: 'du', label: 'DU (Direct Update)', tag: '220 ms • Hızlı Menü', desc: 'Hafif ters voltaj ile menü ve arayüz güncellemeleri.' },
    { key: 'regal', label: 'Regal (Diferansiyel LUT)', tag: '320 ms • Temiz', desc: 'Piksel farkını alarak lokal mikro-dalga ile ghosting\'i sıfırlar.' },
    { key: 'glr16', label: 'GLR16 (Metin Odaklı)', tag: '480 ms • Keskin', desc: '16 gri tonlu kitap sayfaları için optimize edilmiş net tipografi.' },
    { key: 'gc16', label: 'GC16 (Tam Çakım & Temizlik)', tag: '950 ms • Sıfır Gölge', desc: 'Siyah-Beyaz tam kinetik sıfırlama dalgası.' },
  ];

  const ditherOptions: { key: DitherAlgorithm; label: string; tag: string; desc: string }[] = [
    { key: 'atkinson', label: 'Atkinson', tag: 'E-Paper Standart', desc: '6-komşulu %75 hata yayımı ile keskin kenarlar' },
    { key: 'floyd_steinberg', label: 'Floyd-Steinberg', tag: 'Yumuşak Geçiş', desc: 'Dengeli klasik hata difüzyonu' },
    { key: 'bayer4', label: 'Bayer 4x4', tag: 'Sıralı Matris', desc: 'Nostaljik gazete baskı tramı' },
    { key: 'blue_noise', label: 'Mavi Gürültü', tag: 'Homojen Doku', desc: 'Gözü yormayan eşit dağılımlı optik grain' },
    { key: 'none', label: 'Kapalı (Eşikleme)', tag: 'Sıfır Dither', desc: 'Saf siyah/beyaz sert eşikleme' },
  ];

  const activeTelemetry = getWaveformTelemetry(eink.refreshMode);
  const tempMultiplier = ambientTemp < 10 ? 1.4 : ambientTemp > 35 ? 0.85 : 1.0;
  const compensatedDuration = Math.round(activeTelemetry.totalDurationMs * tempMultiplier);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalContainer, { backgroundColor: theme.surfaceDark, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <GeometricSeal size={24} opacity={0.8} />
              <View>
                <Text style={styles.heuristicHeaderTag}>HEURISTIC • MASTER OPTICAL SUITE</Text>
                <Text style={styles.modalTitle}>Optik Laboratuvar & E-Ink Ayarları</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#F4F1D0" />
            </TouchableOpacity>
          </View>

          {/* Master Tabs */}
          <View style={styles.tabsRow}>
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.tabItem,
                    isSelected && [styles.tabItemActive, { borderBottomColor: '#F4F1D0' }],
                  ]}
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={16}
                    color={isSelected ? '#F4F1D0' : 'rgba(244, 241, 208, 0.45)'}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isSelected ? '#F4F1D0' : 'rgba(244, 241, 208, 0.45)' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* ════════ TAB 1: PAPER & TEXTURE ════════ */}
            {activeTab === 'paper' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>FİZİKSEL KAĞIT TÜRÜ & DOKU</Text>
                <View style={styles.grid2}>
                  {paperTypes.map((p) => {
                    const isSelected = eink.paperType === p.key;
                    return (
                      <TouchableOpacity
                        key={p.key}
                        onPress={() => setPaperType(p.key)}
                        style={[
                          styles.cardItem,
                          {
                            backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                            borderColor: isSelected ? '#F4F1D0' : 'transparent',
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        <Text style={styles.cardTitle}>{p.label}</Text>
                        <Text style={styles.cardDesc}>{p.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Tırtıklı Kenar & Diş Pürüzlülüğü Stepper */}
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Tırtıklı Kenar & Diş Pürüzü (Deckle Edge)</Text>
                    <Text style={styles.settingSubDesc}>Ham kesim kağıt kenarı ve lif kabartması</Text>
                  </View>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          deckleEdgeRoughness: Math.max(0, eink.deckleEdgeRoughness - 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>%{eink.deckleEdgeRoughness}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          deckleEdgeRoughness: Math.min(100, eink.deckleEdgeRoughness + 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Paper Texture Intensity Stepper */}
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Kağıt Lif ve Doku Yoğunluğu</Text>
                    <Text style={styles.settingSubDesc}>Mikro lif pürüzlülüğü ve kağıt kabartması</Text>
                  </View>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          paperTextureIntensity: Math.max(0, eink.paperTextureIntensity - 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>%{eink.paperTextureIntensity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          paperTextureIntensity: Math.min(100, eink.paperTextureIntensity + 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Paper Aging / Patina */}
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Kağıt Yaşı (Vintage Patina)</Text>
                    <Text style={styles.settingSubDesc}>Yıllanmış kitap kenarı ve sararma tonu</Text>
                  </View>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          paperAging: Math.max(0, eink.paperAging - 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>%{eink.paperAging}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          paperAging: Math.min(100, eink.paperAging + 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Ink Weight */}
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>MÜREKKEP BASKI DERİNLİĞİ</Text>
                <View style={styles.segmentedRow}>
                  {inkWeights.map((w) => {
                    const isSelected = eink.inkWeight === w.key;
                    return (
                      <TouchableOpacity
                        key={w.key}
                        onPress={() => updateEinkSettings({ inkWeight: w.key })}
                        style={[
                          styles.segmentBtn,
                          {
                            backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                            borderColor: isSelected ? '#F4F1D0' : 'transparent',
                            borderWidth: isSelected ? 1.5 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.segmentBtnText,
                            { color: isSelected ? '#F4F1D0' : 'rgba(244, 241, 208, 0.7)' },
                          ]}
                        >
                          {w.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ════════ TAB 2: COLOR & LIGHT ════════ */}
            {activeTab === 'color' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>RENK SPEKTRUMU & GÖZ ERGONOMİSİ</Text>
                <View style={styles.verticalList}>
                  {colorSchemes.map((item) => {
                    const isSelected = eink.colorScheme === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => setColorScheme(item.key)}
                        style={[
                          styles.colorPaletteCard,
                          {
                            backgroundColor: item.bg,
                            borderColor: isSelected ? '#546382' : 'transparent',
                            borderWidth: isSelected ? 2.5 : 1,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.colorCardTitle, { color: item.fg }]}>
                            {item.label} {isSelected && '✓'}
                          </Text>
                          <Text style={[styles.colorCardSub, { color: item.fg, opacity: 0.8 }]}>
                            {item.sub}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Warm Light Stepper */}
                <View style={[styles.settingRow, { marginTop: 12 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Sıcak Ön Işık (Amber Tint)</Text>
                    <Text style={styles.settingSubDesc}>Melatonin koruması için sıcak amber katmanı</Text>
                  </View>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          warmLightIntensity: Math.max(0, eink.warmLightIntensity - 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>%{eink.warmLightIntensity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          warmLightIntensity: Math.min(100, eink.warmLightIntensity + 10),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ════════ TAB 3: WAVEFORM & SPEED ════════ */}
            {activeTab === 'waveform' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>WAVEFORM LUT SÜRÜŞÜ (3D FLIP HIZI)</Text>
                <View style={styles.verticalList}>
                  {waveformModes.map((item) => {
                    const isSelected = eink.refreshMode === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => setRefreshMode(item.key)}
                        style={[
                          styles.modeCardFull,
                          {
                            backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                            borderColor: isSelected ? '#F4F1D0' : 'transparent',
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        <View style={styles.modeCardHeader}>
                          <Text style={styles.cardTitle}>{item.label}</Text>
                          <View style={styles.speedTag}>
                            <Text style={styles.speedTagText}>{item.tag}</Text>
                          </View>
                        </View>
                        <Text style={styles.cardDesc}>{item.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Oscilloscope Pulse Timeline */}
                <View style={styles.oscilloscopeBox}>
                  <View style={styles.oscHeader}>
                    <Text style={styles.oscTitle}>LUT Sürüşü: {activeTelemetry.modeName}</Text>
                    <Text style={styles.oscDuration}>
                      {compensatedDuration} ms ({ambientTemp}°C)
                    </Text>
                  </View>

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
                                height: isPositive ? 24 : isNegative ? 24 : 10,
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
                    <Text style={styles.tempLabel}>Ortam Sıcaklığı (Viskozite & LUT Süresi):</Text>
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

                {/* Flash Frequency Stepper */}
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>GC16 Tam Temizlik Sıklığı</Text>
                    <Text style={styles.settingSubDesc}>Her kaç sayfada bir kinetik flaşlama yapılsın</Text>
                  </View>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          flashFrequency: Math.max(1, eink.flashFrequency - 1),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>{eink.flashFrequency} Sayfa</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateEinkSettings({
                          flashFrequency: Math.min(20, eink.flashFrequency + 1),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ════════ TAB 4: DITHERING & GHOSTING ════════ */}
            {activeTab === 'dither' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>DITHERING (NOKTALAMA) ALGORİTMASI</Text>
                <View style={styles.verticalList}>
                  {ditherOptions.map((opt) => {
                    const isSelected = eink.ditherAlgorithm === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => setDitherAlgorithm(opt.key)}
                        style={[
                          styles.modeCardFull,
                          {
                            backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                            borderColor: isSelected ? '#F4F1D0' : 'transparent',
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        <View style={styles.modeCardHeader}>
                          <Text style={styles.cardTitle}>{opt.label}</Text>
                          <View style={styles.speedTag}>
                            <Text style={styles.speedTagText}>{opt.tag}</Text>
                          </View>
                        </View>
                        <Text style={styles.cardDesc}>{opt.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Ghosting Simulator */}
                <View style={[styles.oscilloscopeBox, { marginTop: 12 }]}>
                  <Text style={styles.oscTitle}>GHOSTING (HAYALET İZ) KONTROLÜ</Text>
                  <Text style={styles.settingSubDesc}>
                    Aktif Hayalet İz Katmanı: <Text style={{ fontWeight: '700', color: '#F4F1D0' }}>{ghostingStack.length} Katman</Text>
                  </Text>

                  <View style={styles.ghostingActionsGrid}>
                    <TouchableOpacity
                      onPress={() => {
                        const sample = 'Hayalet iz test katmanı ' + (ghostingStack.length + 1);
                        pushGhostingSnapshot(sample);
                      }}
                      style={[styles.ghostBtn, { backgroundColor: '#354057' }]}
                    >
                      <MaterialCommunityIcons name="plus-circle-outline" size={16} color="#F4F1D0" />
                      <Text style={styles.ghostBtnText}>+Gölge Ekle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        triggerManualFlash();
                        clearGhosting();
                      }}
                      style={[styles.ghostBtn, { backgroundColor: theme.surfaceSlate }]}
                    >
                      <MaterialCommunityIcons name="broom" size={16} color="#F4F1D0" />
                      <Text style={styles.ghostBtnText}>GC16 Temizle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Bottom Actions */}
            <View style={styles.footerActionRow}>
              <TouchableOpacity
                onPress={triggerManualFlash}
                style={[styles.primaryActionBtn, { backgroundColor: theme.surfaceSlate }]}
              >
                <MaterialCommunityIcons name="refresh" size={18} color="#F4F1D0" />
                <Text style={styles.primaryActionBtnText}>GC16 Tam Çakım</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetDefaults} style={styles.secondaryActionBtn}>
                <Text style={styles.secondaryActionBtnText}>Sıfırla</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '92%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 241, 208, 0.15)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heuristicHeaderTag: {
    fontSize: 8,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: 'rgba(244, 241, 208, 0.5)',
    letterSpacing: 1.2,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  closeBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 241, 208, 0.12)',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabContent: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 1.1,
    color: 'rgba(244, 241, 208, 0.6)',
    marginBottom: 4,
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verticalList: {
    gap: 6,
  },
  cardItem: {
    width: '48.5%',
    padding: 10,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  cardDesc: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.7)',
    marginTop: 2,
    lineHeight: 14,
  },
  colorPaletteCard: {
    padding: 12,
    borderRadius: 8,
  },
  colorCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  colorCardSub: {
    fontSize: 10,
    marginTop: 2,
  },
  modeCardFull: {
    padding: 10,
    borderRadius: 8,
  },
  modeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  speedTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  speedTagText: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  oscilloscopeBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1E1F1F',
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
    height: 38,
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
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentBtnText: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '600',
    color: '#F4F1D0',
  },
  settingSubDesc: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.55)',
    marginTop: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#354057',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F1D0',
  },
  stepValue: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  ghostingActionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  ghostBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  ghostBtnText: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  footerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 10,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    color: '#F4F1D0',
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
  },
  secondaryActionBtn: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 241, 208, 0.3)',
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    color: '#F4F1D0',
  },
});
