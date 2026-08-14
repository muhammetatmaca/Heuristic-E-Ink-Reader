import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PageCurlFlipProps {
  currentContent: React.ReactNode;
  nextContent: React.ReactNode;
  prevContent: React.ReactNode;
  onNextPage: () => void;
  onPrevPage: () => void;
  onTap: () => void;
}

export const PageCurlFlip: React.FC<PageCurlFlipProps> = ({
  currentContent,
  nextContent,
  prevContent,
  onNextPage,
  onPrevPage,
  onTap,
}) => {
  // dragX: 0 = resting, negative = forward (next), positive = backward (prev)
  const dragX = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dy) < 45,

      onPanResponderMove: (_, gs) => {
        if (isAnimating.current) return;
        dragX.setValue(gs.dx);
      },

      onPanResponderRelease: (_, gs) => {
        if (isAnimating.current) return;

        // Simple tap → toggle HUD
        if (Math.abs(gs.dx) < 10 && Math.abs(gs.dy) < 10) {
          dragX.setValue(0);
          onTap();
          return;
        }

        // Swipe left → next page
        if (gs.dx < -50 || gs.vx < -0.4) {
          isAnimating.current = true;
          Animated.timing(dragX, {
            toValue: -SCREEN_WIDTH,
            duration: 260,
            useNativeDriver: false,
          }).start(() => {
            onNextPage();
            dragX.setValue(0);
            isAnimating.current = false;
          });

        // Swipe right → prev page
        } else if (gs.dx > 50 || gs.vx > 0.4) {
          isAnimating.current = true;
          Animated.timing(dragX, {
            toValue: SCREEN_WIDTH,
            duration: 260,
            useNativeDriver: false,
          }).start(() => {
            onPrevPage();
            dragX.setValue(0);
            isAnimating.current = false;
          });

        // Snap back
        } else {
          Animated.spring(dragX, {
            toValue: 0,
            tension: 200,
            friction: 20,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Current page: slides left (forward) or right (backward)
  const currentTranslateX = dragX;

  // Current page left edge: shadow gets darker as it lifts off
  const leftShadowOpacity = dragX.interpolate({
    inputRange: [-SCREEN_WIDTH, -20, 0, 20, SCREEN_WIDTH],
    outputRange: [0, 0.7, 0, 0.7, 0],
    extrapolate: 'clamp',
  });

  // Current page shrinks ever so slightly as it lifts (paper flex feel)
  const currentScale = dragX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.97, 1, 0.97],
    extrapolate: 'clamp',
  });

  // Previous page slides in from the left when swiping right
  const prevTranslateX = dragX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [-SCREEN_WIDTH, 0],
    extrapolate: 'clamp',
  });

  // Next page underneath scales up slightly for a "reveal" feel
  const nextScale = dragX.interpolate({
    inputRange: [-SCREEN_WIDTH, -20, 0],
    outputRange: [1, 0.99, 0.97],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>

      {/* ── LAYER 1 (BOTTOM): Next page — always 100% solid beneath ── */}
      <Animated.View
        style={[styles.fillLayer, { zIndex: 1, transform: [{ scale: nextScale }] }]}
        pointerEvents="none"
      >
        {nextContent}
      </Animated.View>

      {/* ── LAYER 2: Prev page slides in from left on backward swipe ── */}
      <Animated.View
        style={[
          styles.fillLayer,
          { zIndex: 3, transform: [{ translateX: prevTranslateX }] },
        ]}
        pointerEvents="none"
      >
        {prevContent}
      </Animated.View>

      {/* ── LAYER 3 (TOP): Current page peels away ── */}
      <Animated.View
        style={[
          styles.fillLayer,
          {
            zIndex: 5,
            transform: [
              { translateX: currentTranslateX },
              { scale: currentScale },
            ],
          },
        ]}
      >
        {currentContent}

        {/* Crease shadow gradient on left edge as page peels off */}
        <Animated.View
          pointerEvents="none"
          style={[styles.leftCreaseShadow, { opacity: leftShadowOpacity }]}
        />
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  fillLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  leftCreaseShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
