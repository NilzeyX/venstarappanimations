import React, { useRef, useState, useEffect, memo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from "react-native";

// Platform-specific settings
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSimulator = Platform.OS === "ios" && !Platform.isPad;

// Snow effect settings - increased count and size
const SNOWFLAKE_COUNT = isSimulator ? 100 : 150;
const UPDATE_INTERVAL = 50; // Faster updates for smoother animation

// Safe dimensions
const safeHeight = Math.max(SCREEN_HEIGHT, 800);
const safeWidth = Math.max(SCREEN_WIDTH, 400);

// Function to convert animated value to number safely
const getAnimatedValue = (animatedValue: Animated.Value): number => {
  // TypeScript doesn't know about the internal structure of Animated.Value
  // Use type assertion to bypass TypeScript's type checking
  const value = (animatedValue as any)._value;
  return typeof value === "number" ? value : 0;
};

// Memoized snowflake component to prevent re-renders
const Snowflake = memo(
  ({
    size,
    x,
    y,
    opacity,
    isElliptical,
    rotation,
    blurAmount,
  }: {
    size: number;
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    isElliptical: boolean;
    rotation: Animated.Value;
    blurAmount: number;
  }) => {
    const width = isElliptical ? size * 1.5 : size;
    const height = isElliptical ? size * 0.7 : size;

    return (
      <Animated.View
        style={[
          styles.snowflake,
          {
            width: width * 1.2,
            height: height * 1.2,
            transform: [
              { translateX: Animated.subtract(x, width * 0.1) },
              { translateY: Animated.subtract(y, height * 0.1) },
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
            opacity: opacity,
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 100,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            shadowColor: "#fff",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: blurAmount,
          }}
        />
      </Animated.View>
    );
  }
);

// Snowflake type definition
interface SnowflakeData {
  id: number;
  position: Animated.ValueXY;
  size: number;
  opacity: Animated.Value;
  rotation: Animated.Value;
  speed: number;
  isElliptical: boolean;
  blurAmount: number;
  active: boolean;
  animationRef: { current: Animated.CompositeAnimation | null };
}

const SnowDayEffect: React.FC = () => {
  const [activeFlakes, setActiveFlakes] = useState(SNOWFLAKE_COUNT);

  // Create snowflakes with animation reference
  const snowflakes = useRef<SnowflakeData[]>(
    Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
      id: i,
      position: new Animated.ValueXY({
        x: Math.random() * safeWidth,
        y: Math.random() * safeHeight * -1,
      }),
      size: Math.max(2, Math.min(7, Math.random() * 5 + 2)),
      opacity: new Animated.Value(
        Math.max(0.3, Math.min(0.6, Math.random() * 0.3 + 0.3))
      ),
      rotation: new Animated.Value(Math.random() * 360),
      speed: Math.max(1, Math.min(3.5, Math.random() * 2.5 + 1)),
      isElliptical: Math.random() < 0.3,
      blurAmount: Math.random() * 3 + 2,
      active: true,
      animationRef: { current: null },
    }))
  ).current;

  // Function to create a new flake
  const resetFlake = (flake: SnowflakeData) => {
    flake.position.setValue({
      x: Math.random() * safeWidth,
      y: -10 - Math.random() * 50, // Stagger entry points
    });
    flake.opacity.setValue(
      Math.max(0.3, Math.min(0.6, Math.random() * 0.3 + 0.3))
    );
    flake.active = true;
  };

  // Animate a single snowflake
  const animateFlake = (flake: SnowflakeData) => {
    if (!flake.active) return;

    // Calculate fade out position (40% from bottom)
    const fadeOutY = safeHeight * 0.6;

    // Store current position and calculate target position for wobble
    const baseX = getAnimatedValue(flake.position.x);
    const targetX = baseX + (Math.random() * 20 - 10);

    // Create wobble animation
    const wobbleAnimation = Animated.sequence([
      Animated.timing(flake.position.x, {
        toValue: targetX,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }),
      Animated.timing(flake.position.x, {
        toValue: baseX,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }),
    ]);

    // Fall animation to reach the fade-out point
    const fallAnimation = Animated.timing(flake.position.y, {
      toValue: fadeOutY,
      duration:
        ((fadeOutY - getAnimatedValue(flake.position.y)) / flake.speed) * 50,
      useNativeDriver: true,
      easing: Easing.linear,
    });

    // Run fall and wobble in parallel
    flake.animationRef.current = Animated.parallel([
      fallAnimation,
      wobbleAnimation,
    ]);

    flake.animationRef.current.start(() => {
      // When flake reaches fade-out point, start fade out animation
      Animated.timing(flake.opacity, {
        toValue: 0,
        duration: 1500, // 1.5 seconds fade out
        useNativeDriver: true,
        easing: Easing.linear,
      }).start();

      // After 1.6 seconds (slightly longer than fade), reset the flake
      setTimeout(() => {
        if (flake.active) {
          resetFlake(flake);
          // Start new animation cycle
          animateFlake(flake);
        }
      }, 1600);
    });
  };

  useEffect(() => {
    // Start animations for all flakes
    snowflakes.forEach(animateFlake);

    // Cleanup on unmount
    return () => {
      snowflakes.forEach((flake) => {
        flake.active = false;
        if (flake.animationRef.current) {
          flake.animationRef.current.stop();
          flake.animationRef.current = null;
        }
      });
    };
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          size={flake.size}
          x={flake.position.x}
          y={flake.position.y}
          opacity={flake.opacity}
          isElliptical={flake.isElliptical}
          rotation={flake.rotation}
          blurAmount={flake.blurAmount}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 10,
  },
  snowflake: {
    position: "absolute",
    overflow: "visible",
    backgroundColor: "transparent", // No background on container
  },
});

export default memo(SnowDayEffect);
