import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  generateTestPatternMatrix,
  apply2DDither,
  calculateDitherMSE,
  TestPatternType,
} from '../utils/ditherEngine';
import { DitherAlgorithm } from '../types/eink';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';
import { GeometricSeal } from './GeometricSeal';

export const DitherVisualizer: React.FC = () => {
  const { eink, updateEinkSettings } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  const [selectedPattern, setSelectedPattern] = useState<TestPatternType>('gradient');
  const [selectedAlgo, setSelectedAlgo] = useState<DitherAlgorithm>(eink.ditherAlgorithm || 'atkinson');
  const [quantLevels, setQuantLevels] = useState<2 | 4 | 16 | 256>(16);

  const gridSize = 18; // 18x18 responsive micro-capsule canvas

  const originalMatrix = useMemo(() => {
    return generateTestPatternMatrix(selectedPattern, gridSize, gridSize);
  }, [selectedPattern]);

  const ditheredMatrix = useMemo(() => {
    return apply2DDither(originalMatrix, selectedAlgo, quantLevels);
  }, [originalMatrix, selectedAlgo, quantLevels]);

  const mseError = useMemo(() => {
    return calculateDitherMSE(originalMatrix, ditheredMatrix);
  }, [originalMatrix, ditheredMatrix]);

  const { whiteCount, blackCount } = useMemo(() => {
    let w = 0;
    let b = 0;
    ditheredMatrix.forEach((row) => {
      row.forEach((val) => {
        if (val > 128) w++;
        else b++;
      });
    });
    return { whiteCount: w, blackCount: b };
  }, [ditheredMatrix]);

  const patterns: { key: TestPatternType; label: string }[] = [
    { key: 'gradient', label: 'Degrade' },
    { key: 'sphere', label: '3D Küre' },
    { key: 'typography', label: 'Tipografi (A)' },
    { key: 'portrait', label: 'Portre' },
  ];

  const algorithms: { key: DitherAlgorithm; label: string; tag: string; desc: string }[] = [
    {
      key: 'atkinson',
      label: 'Atkinson',
      tag: 'E-Paper Standart',
      desc: 'Hatanın %75\'ini 6 komşuya dağıtır. Kumlanmayı önler, en yüksek kontrastlı temiz çizimi verir.',
    },
    {
      key: 'floyd_steinberg',
      label: 'Floyd-Steinberg',
      tag: 'Hata Yayılımı',
      desc: 'Hatanın %100\'ünü 4 komşuya yayar. Fotoğraflarda yumuşak geçiş sunar.',
    },
    {
      key: 'bayer4',
      label: 'Bayer 4x4',
      tag: 'Sıralı Matris',
      desc: '4x4 eşikleme matrisi. GPU dostudur, anında paralel hesaplanır.',
    },
    {
      key: 'blue_noise',
      label: 'Mavi Gürültü',
      tag: 'Yüksek Frekans',
      desc: 'Homojen mikro-nokta dağılımı.',
    },
    {
      key: 'none',
      label: 'Eşikleme (Kapalı)',
      tag: 'Sıfır Dither',
      desc: 'Doğrudan yuvarlama (Banding oluşturur).',
    },
  ];

  const quantizationOptions: { val: 2 | 4 | 16 | 256; label: string }[] = [
    { val: 2, label: '1-Bit (2 Ton)' },
    { val: 4, label: '2-Bit (4 Ton)' },
    { val: 16, label: '4-Bit (16 Ton)' },
    { val: 256, label: '8-Bit (256 Ton)' },
  ];

  const handleSelectAlgo = (algo: DitherAlgorithm) => {
    setSelectedAlgo(algo);
    updateEinkSettings({ ditherAlgorithm: algo });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceDark, borderColor: theme.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heuristicTag}>HEURISTIC • DITHER ENGINE</Text>
          <Text style={styles.title}>Canlı Dithering & Kuantizasyon</Text>
        </View>
        <GeometricSeal size={32} opacity={0.5} />
      </View>
      <View style={styles.dividerLine} />
      <Text style={styles.desc}>
        Algoritmaları ve bit derinliğini değiştirerek mikro-kapsül dağılımındaki fiziksel farkı anlık gözlemleyin.
      </Text>

      {/* 1. Test Pattern Selector */}
      <Text style={styles.subTitle}>TEST GÖRSELİ / DESENİ</Text>
      <View style={styles.tabRow}>
        {patterns.map((p) => {
          const isSelected = selectedPattern === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              onPress={() => setSelectedPattern(p.key)}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                  borderColor: isSelected ? '#F4F1D0' : 'transparent',
                },
              ]}
            >
              <Text style={styles.tabBtnText}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Interactive Matrix & Telemetry */}
      <View style={styles.canvasContainer}>
        <View style={styles.matrixBorder}>
          {ditheredMatrix.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.matrixRow}>
              {row.map((val, cIdx) => (
                <View
                  key={`cell-${rIdx}-${cIdx}`}
                  style={[
                    styles.matrixCell,
                    {
                      backgroundColor: `rgb(${val}, ${val}, ${val})`,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Telemetry Card */}
        <View style={styles.telemetryCard}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>MSE Hata Skoru:</Text>
            <Text style={styles.metricValue}>{mseError} (Kuantize Kaybı)</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Çözünürlük:</Text>
            <Text style={styles.metricValue}>{gridSize}x{gridSize} (324 Kapsül)</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Beyaz / Siyah:</Text>
            <Text style={styles.metricValue}>
              %{Math.round((whiteCount / 324) * 100)} / %{Math.round((blackCount / 324) * 100)}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Algorithm Selection */}
      <Text style={[styles.subTitle, { marginTop: 12 }]}>DITHERING ALGORİTMASI SEÇİMİ</Text>
      <View style={styles.algoGrid}>
        {algorithms.map((algo) => {
          const isSelected = selectedAlgo === algo.key;
          return (
            <TouchableOpacity
              key={algo.key}
              onPress={() => handleSelectAlgo(algo.key)}
              style={[
                styles.algoCard,
                {
                  backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                  borderColor: isSelected ? '#F4F1D0' : 'transparent',
                  borderWidth: isSelected ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.algoCardHeader}>
                <Text style={styles.algoName}>{algo.label}</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{algo.tag}</Text>
                </View>
              </View>
              <Text style={styles.algoDesc}>{algo.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Bit-Depth / Quantization Controls */}
      <Text style={[styles.subTitle, { marginTop: 12 }]}>DONANIMSAL BİT DERİNLİĞİ</Text>
      <View style={styles.quantRow}>
        {quantizationOptions.map((q) => {
          const isSelected = quantLevels === q.val;
          return (
            <TouchableOpacity
              key={q.val}
              onPress={() => {
                setQuantLevels(q.val);
                updateEinkSettings({ quantizationLevels: q.val });
              }}
              style={[
                styles.quantBtn,
                {
                  backgroundColor: isSelected ? theme.surfaceSlate : '#354057',
                  borderColor: isSelected ? '#F4F1D0' : 'transparent',
                  borderWidth: isSelected ? 1.5 : 1,
                },
              ]}
            >
              <Text style={styles.quantBtnText}>{q.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heuristicTag: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: 'rgba(244, 241, 208, 0.5)',
    letterSpacing: 1.2,
  },
  title: {
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
  desc: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.75)',
    lineHeight: 15,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    letterSpacing: 1.1,
    color: 'rgba(244, 241, 208, 0.6)',
    marginBottom: 6,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  canvasContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  matrixBorder: {
    borderWidth: 2,
    borderColor: 'rgba(244, 241, 208, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  matrixRow: {
    flexDirection: 'row',
  },
  matrixCell: {
    width: 7.5,
    height: 7.5,
  },
  telemetryCard: {
    flex: 1,
    gap: 5,
  },
  metricItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(244, 241, 208, 0.15)',
    paddingBottom: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.6)',
  },
  metricValue: {
    fontSize: 11,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
    marginTop: 1,
  },
  algoGrid: {
    gap: 6,
  },
  algoCard: {
    padding: 10,
    borderRadius: 8,
  },
  algoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  algoName: {
    fontSize: 12,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#F4F1D0',
  },
  algoDesc: {
    fontSize: 10,
    fontFamily: 'Roboto Mono',
    color: 'rgba(244, 241, 208, 0.7)',
    lineHeight: 14,
  },
  quantRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  quantBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  quantBtnText: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    fontWeight: '700',
    color: '#F4F1D0',
  },
});
