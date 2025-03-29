import React, { useRef, useState, useEffect, memo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Image,
} from "react-native";

// Platform-specific settings
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate flake distribution
const SMALL_COUNT = 250;
const MEDIUM_COUNT = 45;
const LARGE_COUNT = 10;
const XLARGE_COUNT = 5;

// Snow effect settings - increased snowflakes by 1.5x
const SNOWFLAKE_COUNT = SMALL_COUNT + MEDIUM_COUNT + LARGE_COUNT + XLARGE_COUNT;

// Snow effect settings
const EXTRA_LARGE_SIZE = 20; // New size for largest foreground flakes
const MIN_OPACITY = 0.7;
const MAX_OPACITY = 0.9;
const BASE_BLUR = 35; // Base blur amount

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

// Cloud component
const Cloud = memo(
  ({
    x,
    y,
    imageSource,
    xPercent,
    yPercent,
    scale = 1,
  }: {
    x: Animated.Value;
    y: Animated.Value;
    imageSource: any;
    xPercent: number;
    yPercent: number;
    scale?: number;
  }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Create animated values for cloud movement
    const moveX = useRef(new Animated.Value(0)).current;
    const moveY = useRef(new Animated.Value(0)).current;

    // Function to create random cloud movement
    const animateCloud = () => {
      // Random movement range (smaller = more subtle)
      const xRange = Math.random() * 15 + 5; // 5-20 pixels
      const yRange = Math.random() * 8 + 2; // 2-10 pixels

      // Random duration (longer = slower movement)
      const duration = Math.random() * 4000 + 6000; // 6-10 seconds

      // Create horizontal movement
      Animated.sequence([
        Animated.timing(moveX, {
          toValue: xRange,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(moveX, {
          toValue: -xRange,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => animateCloud()); // Loop animation

      // Create vertical movement with slight delay
      Animated.sequence([
        Animated.timing(moveY, {
          toValue: yRange,
          duration: duration * 1.2, // Slightly slower vertical movement
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(moveY, {
          toValue: -yRange,
          duration: duration * 1.2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Start cloud animation on mount
    useEffect(() => {
      // Add random delay before starting animation
      const startDelay = Math.random() * 2000;
      setTimeout(animateCloud, startDelay);
    }, []);

    return (
      <Animated.View
        style={[
          styles.cloud,
          {
            left: (SCREEN_WIDTH * xPercent) / 100,
            top: (SCREEN_HEIGHT * yPercent) / 100,
            transform: [
              { translateX: moveX },
              { translateY: moveY },
              {
                translateX: new Animated.Value(-(dimensions.width * scale) / 2),
              },
              {
                translateY: new Animated.Value(
                  -(dimensions.height * scale) / 2
                ),
              },
              { scale: scale },
            ],
          },
        ]}
      >
        <Image
          source={imageSource}
          style={[
            styles.cloudImage,
            {
              width: 400,
              height: 200,
              opacity: 1.25, // Make clouds 25% brighter/thicker
            },
          ]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setDimensions({ width, height });
          }}
        />
      </Animated.View>
    );
  }
);

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
    // Calculate dimensions for a true radial gradient effect
    const width = isElliptical ? size * 1.3 : size;
    const height = isElliptical ? size * 0.8 : size;

    // Create an animated value for the fade effect based on Y position
    const fadeOpacity = y.interpolate({
      inputRange: [0, SCREEN_HEIGHT * 0.05, SCREEN_HEIGHT * 0.15],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    });

    // Container needs to be much larger to accommodate the full gradient spread
    const containerScale = 3;

    // Calculate blur based on size for depth effect
    let blurFactor = 0;
    if (size <= 3) {
      // Small flakes (1-3): minimal blur (background)
      blurFactor = 0.1;
    } else if (size <= 7) {
      // Medium flakes (4-7): slight blur (middle ground)
      blurFactor = 0.2;
    } else if (size <= EXTRA_LARGE_SIZE * 0.8) {
      // Large flakes (8-10): high blur (foreground)
      blurFactor = 0.8;
    } else {
      // Extra large flakes: maximum blur (extreme foreground)
      blurFactor = 1.0;
    }

    // Simplified - only apply shadow blur to larger flakes to improve performance
    const applyBlur = size >= 8;
    const effectiveBlur = applyBlur ? 5 : 0; // Fixed value for better performance

    return (
      <Animated.View
        style={[
          styles.snowflake,
          {
            width: width * containerScale,
            height: height * containerScale,
            transform: [
              {
                translateX: Animated.subtract(x, (width * containerScale) / 2),
              },
              {
                translateY: Animated.subtract(y, (height * containerScale) / 2),
              },
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
            opacity: Animated.multiply(opacity, fadeOpacity),
          },
        ]}
      >
        {/* Radial gradient simulation with multiple nested views */}
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outermost layer - very faint */}
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: 500, // Huge border radius to ensure no visible edges
              backgroundColor:
                blurFactor === 0
                  ? "rgba(255, 255, 255, 0)"
                  : "rgba(255, 255, 255, 0.03)",
              ...(applyBlur && {
                shadowColor: "#fff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: effectiveBlur,
              }),
            }}
          />

          {/* Layer 6 - 90% size, 0.06 opacity */}
          <View
            style={{
              position: "absolute",
              width: "90%",
              height: "90%",
              borderRadius: 500,
              backgroundColor:
                blurFactor === 0
                  ? "rgba(255, 255, 255, 0)"
                  : "rgba(255, 255, 255, 0.06)",
            }}
          />

          {/* Layer 5 - 75% size, 0.12 opacity */}
          <View
            style={{
              position: "absolute",
              width: "75%",
              height: "75%",
              borderRadius: 500,
              backgroundColor:
                blurFactor === 0
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.12)",
            }}
          />

          {/* Layer 4 - 60% size, 0.2 opacity */}
          <View
            style={{
              position: "absolute",
              width: "60%",
              height: "60%",
              borderRadius: 500,
              backgroundColor:
                blurFactor === 0
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(255, 255, 255, 0.2)",
            }}
          />

          {/* Layer 3 - 45% size, 0.35 opacity */}
          <View
            style={{
              position: "absolute",
              width: "45%",
              height: "45%",
              borderRadius: 500,
              backgroundColor:
                blurFactor === 0
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.35)",
              ...(applyBlur &&
                size >= EXTRA_LARGE_SIZE * 0.8 && {
                  shadowColor: "#fff",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: effectiveBlur,
                }),
            }}
          />

          {/* Layer 2 - 30% size, 0.6 opacity */}
          <View
            style={{
              position: "absolute",
              width: "30%",
              height: "30%",
              borderRadius: 500,
              backgroundColor:
                blurFactor === 0
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(255, 255, 255, 0.6)",
            }}
          />

          {/* Core - 15% size, full opacity */}
          <View
            style={{
              position: "absolute",
              width: "15%",
              height: "15%",
              borderRadius: 500,
              backgroundColor: "rgba(255, 255, 255, 1)",
              ...(applyBlur && {
                shadowColor: "#fff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: effectiveBlur * 1.2,
              }),
            }}
          />
        </View>
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
  driftDirection: "left" | "right" | "sway"; // New property for drift direction
}

// Cloud type definition
interface CloudData {
  id: number;
  position: Animated.ValueXY;
  image: number;
  xPercent: number;
  yPercent: number;
  scale: number;
}

const SnowDayEffect: React.FC = () => {
  const [activeFlakes, setActiveFlakes] = useState(SNOWFLAKE_COUNT);

  // Get cloud images
  const cloudImages = [
    require("../../assets/images/Cloud_1.webp"),
    require("../../assets/images/Cloud_2.webp"),
  ];

  // Create cloud data with exact fixed positions
  const clouds = useRef<CloudData[]>([
    // Scattered clouds across the top
    {
      id: 0,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 1, // Cloud_2
      xPercent: -15,
      yPercent: 13, // Lowered by 5%
      scale: 1.15,
    },
    {
      id: 1,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 0, // Cloud_1
      xPercent: 5,
      yPercent: 10, // Lowered by 5%
      scale: 1.2,
    },
    {
      id: 2,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 1, // Cloud_2
      xPercent: 25,
      yPercent: 17, // Lowered by 5%
      scale: 0.95,
    },
    {
      id: 3,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 0, // Cloud_1
      xPercent: 40,
      yPercent: 12, // Lowered by 5%
      scale: 1.1,
    },
    {
      id: 4,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 1, // Cloud_2
      xPercent: 55,
      yPercent: 15, // Lowered by 5%
      scale: 1.05,
    },
    {
      id: 5,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 0, // Cloud_1
      xPercent: 70,
      yPercent: 11, // Lowered by 5%
      scale: 1.15,
    },
    {
      id: 6,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 1, // Cloud_2
      xPercent: 90,
      yPercent: 20, // Lowered by 5%
      scale: 0.9,
    },
    {
      id: 7,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      image: 0, // Cloud_1
      xPercent: 105, // Slightly off-screen to the right
      yPercent: 14, // Lowered by 5%
      scale: 1.1,
    },
  ]).current;

  // Create snowflakes with animation reference
  const snowflakes = useRef<SnowflakeData[]>(
    Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => {
      // Adjust distribution to increase small flakes by 2.5x
      // while keeping absolute numbers of other sizes the same
      let size;

      if (i < SMALL_COUNT) {
        // Small flakes (1-3) - background - increased by 2.5x
        size = 1 + Math.random() * 2;
      } else if (i < SMALL_COUNT + MEDIUM_COUNT) {
        // Medium flakes (4-7) - middle ground - same count as before
        size = 4 + Math.random() * 3;
      } else if (i < SMALL_COUNT + MEDIUM_COUNT + LARGE_COUNT) {
        // Large flakes (8-10) - foreground - same count as before
        size = 8 + Math.random() * 2;
      } else {
        // Extra large flakes (~20) - extreme foreground - same count as before
        size = EXTRA_LARGE_SIZE * (0.8 + Math.random() * 0.4); // 80-120% of EXTRA_LARGE_SIZE
      }

      // Assign random drift direction
      const driftPattern = Math.random();
      let driftDirection: "left" | "right" | "sway";
      if (driftPattern < 0.33) {
        driftDirection = "left";
      } else if (driftPattern < 0.66) {
        driftDirection = "right";
      } else {
        driftDirection = "sway";
      }

      // Adjust speed based on size - LARGER flakes move FASTER (foreground)
      let speedFactor;
      if (size >= EXTRA_LARGE_SIZE * 0.8) {
        // Extra large flakes (extreme foreground) move fastest
        speedFactor = 1.4 + Math.random() * 0.4; // 1.6-2.0
      } else if (size >= 8) {
        // Large flakes (foreground) move fast
        speedFactor = 1.0 + (0.5 * (size - 8)) / 2; // Map 8-10 to 1.0-1.5
      } else if (size >= 4) {
        // Medium flakes move at medium speed
        speedFactor = 0.7 + (0.3 * (size - 4)) / 3; // Map 4-7 to 0.7-1.0
      } else {
        // Small flakes (background) move slowest
        speedFactor = 0.6 + (0.3 * (size - 1)) / 2; // Map 1-3 to 0.4-0.7
      }

      // Add random variation to speed (-0.5 to +0.5)
      const randomSpeedAdjustment = Math.random() * 1.0 - 0.5;
      const speed = 6 * speedFactor + randomSpeedAdjustment;

      // Adjust opacity - extra large flakes have 50% opacity
      const flakeOpacity =
        size >= EXTRA_LARGE_SIZE * 0.8
          ? 0.5
          : MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * Math.random();

      // Apply elliptical shape only to small and medium flakes
      const isElliptical = size < 8 ? Math.random() < 0.3 : false;

      // All flakes get a blurAmount, but it will be adjusted in the component based on size
      return {
        id: i,
        position: new Animated.ValueXY({
          x: Math.random() * safeWidth,
          y: Math.random() * safeHeight * -1,
        }),
        size,
        opacity: new Animated.Value(flakeOpacity),
        rotation: new Animated.Value(Math.random() * 360),
        speed,
        isElliptical,
        blurAmount: BASE_BLUR,
        active: true,
        animationRef: { current: null },
        driftDirection,
      };
    })
  ).current;

  // Animate a single snowflake
  const animateFlake = (flake: SnowflakeData) => {
    if (!flake.active) return;

    // Store current position
    const baseX = getAnimatedValue(flake.position.x);
    const baseY = getAnimatedValue(flake.position.y);

    // Duration for full fall animation
    const fallDuration = ((safeHeight + 20 - baseY) / flake.speed) * 50;

    // Create horizontal movement based on drift direction
    let horizontalAnimation;

    switch (flake.driftDirection) {
      case "left":
        // Drift left - calculate drift amount based on size (bigger = more drift)
        const leftDrift = Math.min(safeWidth / 4, baseX); // Ensure it doesn't go too far off-screen
        horizontalAnimation = Animated.timing(flake.position.x, {
          toValue: baseX - leftDrift * (flake.size / 7), // Size-proportional drift
          duration: fallDuration,
          useNativeDriver: true,
          easing: Easing.linear,
        });
        break;

      case "right":
        // Drift right - calculate drift amount based on size
        const rightDrift = Math.min(safeWidth / 4, safeWidth - baseX); // Ensure it doesn't go too far off-screen
        horizontalAnimation = Animated.timing(flake.position.x, {
          toValue: baseX + rightDrift * (flake.size / 7), // Size-proportional drift
          duration: fallDuration,
          useNativeDriver: true,
          easing: Easing.linear,
        });
        break;

      case "sway":
      default:
        // Original wobble animation
        const targetX = baseX + (Math.random() * 20 - 10);
        horizontalAnimation = Animated.sequence([
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
        break;
    }

    // Fall animation to go completely off-screen
    const fallAnimation = Animated.timing(flake.position.y, {
      toValue: safeHeight + 20, // Ensure it's fully off-screen
      duration: fallDuration,
      useNativeDriver: true,
      easing: Easing.linear,
    });

    // Run fall and horizontal movement in parallel
    flake.animationRef.current = Animated.parallel([
      fallAnimation,
      horizontalAnimation,
    ]);

    flake.animationRef.current.start(() => {
      // When flake reaches bottom, immediately reset and start again
      if (flake.active) {
        resetFlake(flake);
        // Start new animation cycle
        animateFlake(flake);
      }
    });
  };

  // Function to create a new flake
  const resetFlake = (flake: SnowflakeData) => {
    flake.position.setValue({
      x: Math.random() * safeWidth,
      y: -10 - Math.random() * 50, // Stagger entry points
    });

    // Maintain 50% opacity for extra large flakes
    const flakeOpacity =
      flake.size >= EXTRA_LARGE_SIZE * 0.8
        ? 0.3
        : Math.max(0.3, Math.min(0.6, Math.random() * 0.3 + 0.3));

    flake.opacity.setValue(flakeOpacity);

    // Randomly reassign drift direction to make it more dynamic
    const driftPattern = Math.random();
    if (driftPattern < 0.33) {
      flake.driftDirection = "left";
    } else if (driftPattern < 0.66) {
      flake.driftDirection = "right";
    } else {
      flake.driftDirection = "sway";
    }

    flake.active = true;
  };

  useEffect(() => {
    // Start animations for all flakes
    snowflakes.forEach(animateFlake);

    // Do not animate clouds - they should remain static

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
    <>
      {/* Container should have highest z-index since it contains clouds and snow */}
      <View style={[styles.container]} pointerEvents="none">
        <View style={[styles.snowLayer]}>
          {/* Render snowflakes */}
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
        <View style={[styles.cloudLayer]}>
          {/* Render clouds */}
          {clouds.map((cloud) => (
            <Cloud
              key={`cloud-${cloud.id}`}
              x={cloud.position.x}
              y={cloud.position.y}
              imageSource={cloudImages[cloud.image]}
              xPercent={cloud.xPercent}
              yPercent={cloud.yPercent}
              scale={cloud.scale}
            />
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 15, // Above house
  },
  snowLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 16, // Above container
  },
  cloudLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 17, // Above snow
  },
  snowflake: {
    position: "absolute",
    overflow: "visible",
    backgroundColor: "transparent",
  },
  cloud: {
    position: "absolute",
    overflow: "visible",
  },
  cloudImage: {
    resizeMode: "contain",
  },
});

export default memo(SnowDayEffect);
