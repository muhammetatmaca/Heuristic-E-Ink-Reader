import React from 'react';
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
import { FontFamily } from '../types/eink';
import { GeometricSeal } from './GeometricSeal';

interface TypographySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TypographySettingsModal: React.FC<TypographySettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { eink, typography, updateTypography } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const fontFamilies: FontFamily[] = [
    'Literata',
    'Bookerly',
    'Georgia',
    'Merriweather',
    'System',
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalContainer, { backgroundColor: theme.surfaceDark, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <GeometricSeal size={24} opacity={0.8} />
              <View>
                <Text style={styles.heuristicHeaderTag}>HEURISTIC • TYPOGRAPHY</Text>
                <Text style={styles.modalTitle}>Yazı Tipi & Sayfalama</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#F4F1D0" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Font Family */}
            <Text style={styles.sectionTitle}>YAZI TİPİ AİLESİ</Text>
            <View style={styles.fontFamilyRow}>
              {fontFamilies.map((font) => {
                const isSelected = typography.fontFamily === font;
                return (
                  <TouchableOpacity
                    key={font}
                    onPress={() => updateTypography({ fontFamily: font })}
                    style={[
                      styles.fontCard,
                      {
                        backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                        borderColor: isSelected ? '#F4F1D0' : 'transparent',
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.fontCardText}>{font}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Font Size */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Yazı Boyutu (Punto)</Text>
                <Text style={styles.settingSub}>{typography.fontSize} pt</Text>
              </View>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() =>
                    updateTypography({ fontSize: Math.max(14, typography.fontSize - 1) })
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>A-</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{typography.fontSize}</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateTypography({ fontSize: Math.min(32, typography.fontSize + 1) })
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Line Height Ratio */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Satır Aralığı (Line Height)</Text>
                <Text style={styles.settingSub}>{typography.lineHeightRatio}x katı</Text>
              </View>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() =>
                    updateTypography({
                      lineHeightRatio: Math.max(1.3, +(typography.lineHeightRatio - 0.05).toFixed(2)),
                    })
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{typography.lineHeightRatio}x</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateTypography({
                      lineHeightRatio: Math.min(2.0, +(typography.lineHeightRatio + 0.05).toFixed(2)),
                    })
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Horizontal Margin */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Kenar Boşluğu (Margin)</Text>
                <Text style={styles.settingSub}>{typography.horizontalMargin} px</Text>
              </View>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() =>
                    updateTypography({
                      horizontalMargin: Math.max(12, typography.horizontalMargin - 4),
                    })
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{typography.horizontalMargin}</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateTypography({
                      horizontalMargin: Math.min(48, typography.horizontalMargin + 4),
                    })
                  }
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Text Alignment */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Metin Hizalama</Text>
              <View style={styles.alignmentRow}>
                <TouchableOpacity
                  onPress={() => updateTypography({ textAlign: 'left' })}
                  style={[
                    styles.alignBtn,
                    {
                      backgroundColor:
                        typography.textAlign === 'left' ? theme.surfaceSlate : '#354057',
                      borderColor: typography.textAlign === 'left' ? '#F4F1D0' : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="format-align-left"
                    size={20}
                    color="#F4F1D0"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateTypography({ textAlign: 'justify' })}
                  style={[
                    styles.alignBtn,
                    {
                      backgroundColor:
                        typography.textAlign === 'justify' ? theme.surfaceSlate : '#354057',
                      borderColor: typography.textAlign === 'justify' ? '#F4F1D0' : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="format-align-justify"
                    size={20}
                    color="#F4F1D0"
                  />
                </TouchableOpacity>
              </View>
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
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingBottom: 24,
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
    fontSize: 15,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 1.1,
    color: 'rgba(244, 241, 208, 0.6)',
    marginBottom: 8,
  },
  fontFamilyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  fontCard: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  fontCardText: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 241, 208, 0.15)',
  },
  settingLabel: {
    fontSize: 13,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  settingSub: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.6)',
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#354057',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F1D0',
  },
  stepValue: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  alignmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  alignBtn: {
    padding: 8,
    borderRadius: 6,
  },
});
