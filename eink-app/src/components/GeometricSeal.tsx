import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GeometricSealProps {
  size?: number;
  color?: string;
  circleColor?: string;
  squareColor?: string;
  opacity?: number;
  style?: ViewStyle;
}

/**
 * Editorial Geometric Seal (Watermark Badge) inspired by the reference design:
 * Outer circular container with nested rotated geometric squares and translucent overlays.
 */
export const GeometricSeal: React.FC<GeometricSealProps> = ({
  size = 40,
  circleColor = '#3D4C65',
  squareColor = '#F4F1D0',
  opacity = 0.6,
  style,
}) => {
  const innerSize = size * 0.7;
  const smallestSize = size * 0.45;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity,
        },
        style,
      ]}
      pointerEvents="none"
    >
      {/* Outer Circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: circleColor,
          },
        ]}
      />

      {/* Middle Rotated Square */}
      <View
        style={[
          styles.rotatedSquare,
          {
            width: innerSize,
            height: innerSize,
            backgroundColor: '#354057',
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />

      {/* Inner Accent Square */}
      <View
        style={[
          styles.innerSquare,
          {
            width: smallestSize,
            height: smallestSize,
            backgroundColor: squareColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
  },
  rotatedSquare: {
    position: 'absolute',
  },
  innerSquare: {
    position: 'absolute',
  },
});
