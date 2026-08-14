import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  PanResponderGestureState,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PageFlip3DProps {
  currentPageContent: React.ReactNode;
  nextPageContent?: React.ReactNode;
  prevPageContent?: React.ReactNode;
  onFlipNext: () => void;
  onFlipPrev: () => void;
  onTap: () => void;
}

export const PageFlip3D: React.FC<PageFlip3DProps> = ({
  currentPageContent,
  nextPageContent,
  prevPageContent,
  onFlipNext,
  onFlipPrev,
  onTap,
}) => {
  // flipProgress:
  // > 0 (dragging to next page: 0 -> 1)
  // < 0 (dragging from previous page: -1 -> 0)
  const flipProgress = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const isTurningBack = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 40;
      },
      onPanResponderGrant: () => {
        // start
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        if (isAnimating.current) return;

        if (gestureState.dx < 0) {
          // Swiping left -> Turning forward (reveals next page underneath)
          isTurningBack.current = false;
          const progress = Math.min(1, -gestureState.dx / SCREEN_WIDTH);
          flipProgress.setValue(progress);
        } else {
          // Swiping right -> Turning backward (peels previous page in from left)
          isTurningBack.current = true;
          const progress = Math.max(-1, -gestureState.dx / SCREEN_WIDTH);
          flipProgress.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (isAnimating.current) return;

        // If simple tap with no drag -> Toggle Menu (NO page turn on tap!)
        if (Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8) {
          onTap();
          return;
        }

        // Forward turn release
        if (gestureState.dx < -50 || gestureState.vx < -0.3) {
          isAnimating.current = true;
          Animated.timing(flipProgress, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }).start(() => {
            onFlipNext();
            flipProgress.setValue(0);
            isAnimating.current = false;
          });
        }
        // Backward turn release
        else if (gestureState.dx > 50 || gestureState.vx > 0.3) {
          isAnimating.current = true;
          Animated.timing(flipProgress, {
            toValue: -1,
            duration: 260,
            useNativeDriver: true,
          }).start(() => {
            onFlipPrev();
            flipProgress.setValue(0);
            isAnimating.current = false;
          });
        }
        // Snap back to resting position
        else {
          Animated.spring(flipProgress, {
            toValue: 0,
            tension: 160,
            friction: 16,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // 1. Forward Turn Transformations (Top sheet curls and slides off to reveal next page)
  const forwardTranslateX = flipProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH * 1.05],
    extrapolate: 'clamp',
  });

  const forwardRotateY = flipProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: ['0deg', '-22deg', '-45deg'],
    extrapolate: 'clamp',
  });

  // Dynamic Shadow underneath the curled page (casts onto the next page)
  const curlDropShadowOpacity = flipProgress.interpolate({
    inputRange: [0, 0.15, 0.7, 1],
    outputRange: [0, 0.35, 0.45, 0],
    extrapolate: 'clamp',
  });

  // 2. Backward Turn Transformations (Previous page slides in from the left over the current page)
  const backwardTranslateX = flipProgress.interpolate({
    inputRange: [-1, 0],
    outputRange: [0, -SCREEN_WIDTH * 1.05],
    extrapolate: 'clamp',
  });

  const backwardRotateY = flipProgress.interpolate({
    inputRange: [-1, -0.6, 0],
    outputRange: ['0deg', '-22deg', '-45deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* LAYER 1 (BOTTOM): Next Page sitting completely solid (100% Opaque) */}
      <View style={styles.solidBaseLayer} pointerEvents="none">
        {nextPageContent || null}
      </View>

      {/* LAYER 2 (MIDDLE): Active Current Page Sheet (100% Solid Opaque Paper) */}
      <Animated.View
        style={[
          styles.solidTurningSheet,
          {
            transform: [
              { perspective: 1600 },
              { translateX: forwardTranslateX },
              { rotateY: forwardRotateY },
            ],
          },
        ]}
      >
        {currentPageContent}

        {/* Dynamic Leaf Edge Drop Shadow (casts shadow from lifted right edge) */}
        <Animated.View
          style={[
            styles.curlDropShadow,
            {
              opacity: curlDropShadowOpacity,
            },
          ]}
          pointerEvents="none"
        />

        {/* Solid Spine Crease */}
        <View style={styles.spineGutter} pointerEvents="none" />
      </Animated.View>

      {/* LAYER 3 (TOP OVERLAY FOR BACKWARD TURN): Previous Page Sheet */}
      <Animated.View
        style={[
          styles.solidPreviousSheet,
          {
            transform: [
              { perspective: 1600 },
              { translateX: backwardTranslateX },
              { rotateY: backwardRotateY },
            ],
          },
        ]}
        pointerEvents="none"
      >
        {prevPageContent || null}
        <View style={styles.curlDropShadow} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  solidBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    opacity: 1, // 100% SOLID - ZERO TRANSPARENCY
  },
  solidTurningSheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    opacity: 1, // 100% SOLID - ZERO TRANSPARENCY
    shadowColor: '#000000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  solidPreviousSheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    opacity: 1, // 100% SOLID - ZERO TRANSPARENCY
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 12,
  },
  curlDropShadow: {
    position: 'absolute',
    right: -24,
    top: 0,
    bottom: 0,
    width: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  spineGutter: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.06)',
  },
});
