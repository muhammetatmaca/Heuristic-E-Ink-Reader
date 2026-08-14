import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Image } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { COLOR_THEMES } from '../constants/theme';
import { getWarmBacklightColor } from '../utils/ditherEngine';

const DECKLE_TEXTURE_IMAGE = require('../../assets/deckle-paper-texture.png');

interface EInkDisplaySurfaceProps {
  children: React.ReactNode;
  ghostingText?: string | null;
  style?: object;
}

export const EInkDisplaySurface: React.FC<EInkDisplaySurfaceProps> = ({
  children,
  ghostingText,
  style,
}) => {
  const {
    eink,
    typography,
    isFlashActive,
    manualRefreshTrigger,
    ghostingStack,
    setFlashActive,
    clearGhosting,
  } = useSettingsStore();

  const theme = COLOR_THEMES[eink.colorScheme];

  // Waveform Flash Animation Values
  const flashPhase = useRef(new Animated.Value(0)).current;
  const regalRippleAnim = useRef(new Animated.Value(0)).current;

  const triggerWaveformFlash = (mode: string = eink.refreshMode) => {
    setFlashActive(true);

    if (mode === 'gc16' || mode === 'normal') {
      const duration = 280;
      Animated.sequence([
        Animated.timing(flashPhase, {
          toValue: 1,
          duration: duration * 0.45,
          useNativeDriver: true,
        }),
        Animated.timing(flashPhase, {
          toValue: 2,
          duration: duration * 0.45,
          useNativeDriver: true,
        }),
        Animated.timing(flashPhase, {
          toValue: 0,
          duration: duration * 0.1,
          useNativeDriver: true,
        }),
      ]).start(() => {
        clearGhosting();
        setFlashActive(false);
      });
    } else if (mode === 'regal') {
      regalRippleAnim.setValue(0);
      Animated.sequence([
        Animated.timing(regalRippleAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(regalRippleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setFlashActive(false);
      });
    } else {
      setFlashActive(false);
    }
  };

  useEffect(() => {
    if (manualRefreshTrigger > 0) {
      triggerWaveformFlash('gc16');
    }
  }, [manualRefreshTrigger]);

  const warmTint = getWarmBacklightColor(eink.warmLightIntensity);

  // Black flash opacity for GC16
  const blackFlashOpacity = flashPhase.interpolate({
    inputRange: [0, 0.8, 1, 1.2, 2],
    outputRange: [0, 0.75, 0.98, 0.75, 0],
  });

  // White flash opacity for GC16
  const whiteFlashOpacity = flashPhase.interpolate({
    inputRange: [1, 1.8, 2, 2.2],
    outputRange: [0, 0.75, 0.98, 0],
  });

  // Regal Differential subtle ripple opacity
  const regalOverlayOpacity = regalRippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.15, 0],
  });

  const activeGhostingLayers = ghostingStack.length > 0
    ? ghostingStack
    : ghostingText
    ? [ghostingText]
    : [];

  const paperBaseColor =
    eink.paperType === 'book_parchment'
      ? '#F4F1D0'
      : eink.paperType === 'deckle_rough'
      ? '#F3EEDC'
      : eink.paperType === 'japanese_washi'
      ? '#FAF5E8'
      : eink.paperType === 'kraft_recycled'
      ? '#E8DFC8'
      : eink.paperType === 'cotton_rag'
      ? '#FAF7EE'
      : eink.paperType === 'newsprint'
      ? '#EAE6DB'
      : theme.background;

  const effectiveBg = theme.isDark ? theme.background : paperBaseColor;
  const isDeckleOrParchment = eink.paperType === 'deckle_rough' || eink.paperType === 'book_parchment';

  return (
    <View style={[styles.container, { backgroundColor: effectiveBg }, style]}>
      {/* 1. Real Deckle Paper Texture Background Layer */}
      {isDeckleOrParchment && !theme.isDark && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={DECKLE_TEXTURE_IMAGE}
            style={{
              width: '100%',
              height: '100%',
              opacity: Math.max(0.35, (eink.paperTextureIntensity / 100) * 0.9),
              resizeMode: 'cover',
            }}
          />
        </View>
      )}

      {/* 2. Ghosting Layer Stack */}
      {eink.ghostingEnabled && !isFlashActive && activeGhostingLayers.map((layerText, idx) => {
        const layerOpacity = (eink.ghostingOpacity / (idx + 1)) * (eink.refreshMode === 'fast_a2' ? 1.6 : 1.0);
        return (
          <View
            key={`ghost-layer-${idx}`}
            pointerEvents="none"
            style={[
              styles.ghostingLayer,
              {
                opacity: layerOpacity,
                paddingHorizontal: typography.horizontalMargin,
                transform: [{ translateY: idx * 1.5 }, { translateX: idx * 1.0 }],
              },
            ]}
          >
            <Text
              style={{
                fontSize: typography.fontSize,
                lineHeight: typography.fontSize * typography.lineHeightRatio,
                color: theme.text,
                fontFamily: typography.fontFamily === 'System' ? undefined : typography.fontFamily,
                textAlign: typography.textAlign,
              }}
            >
              {layerText}
            </Text>
          </View>
        );
      })}

      {/* 3. Main Content Surface */}
      <View style={styles.contentLayer}>{children}</View>

      {/* 4. Deckle Edge Tırtıklı & Pürüzlü Ham Kenar Gölgelendirmesi */}
      {eink.deckleEdgeRoughness > 0 && (
        <>
          {/* Sol Kenar Ham Lif Pürüzü */}
          <View
            pointerEvents="none"
            style={[
              styles.deckleSpineShadow,
              {
                opacity: (eink.deckleEdgeRoughness / 100) * 0.28,
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(70,55,30,0.18)',
              },
            ]}
          />
          {/* Sağ Tırtıklı Dış Kesim Kenarı */}
          <View
            pointerEvents="none"
            style={[
              styles.deckleOuterEdge,
              {
                opacity: (eink.deckleEdgeRoughness / 100) * 0.22,
                backgroundColor: theme.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(90,70,40,0.15)',
              },
            ]}
          />
        </>
      )}

      {/* 5. Warm Backlight / Frontlight Ambient Tint */}
      {eink.warmLightIntensity > 0 && (
        <View
          pointerEvents="none"
          style={[styles.warmTintOverlay, { backgroundColor: warmTint }]}
        />
      )}

      {/* 6. Regal Local Differential Wipe */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.waveformFlashOverlay,
          {
            backgroundColor: theme.isDark ? '#000000' : '#FFFFFF',
            opacity: regalOverlayOpacity,
          },
        ]}
      />

      {/* 7. Authentic GC16 Full Black Waveform Inversion */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.waveformFlashOverlay,
          {
            backgroundColor: '#000000',
            opacity: blackFlashOpacity,
          },
        ]}
      />

      {/* 8. Authentic GC16 Full White Waveform Inversion */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.waveformFlashOverlay,
          {
            backgroundColor: '#FFFFFF',
            opacity: whiteFlashOpacity,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },
  ghostingLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    paddingTop: 60,
    justifyContent: 'flex-start',
  },
  deckleSpineShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 14,
    zIndex: 3,
  },
  deckleOuterEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    zIndex: 3,
  },
  warmTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 4,
  },
  waveformFlashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
