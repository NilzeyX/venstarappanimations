import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
  Animated,
} from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Time of day enum
enum TimeOfDay {
  DAY = "day",
  NIGHT = "night",
}

// Gradient colors for different times of day (as readonly tuples for TypeScript)
const dayGradientColors = ["#1e90ff", "#87CEEB", "#B0E2FF"] as const;
const nightGradientColors = ["#0C1221", "#1A2339", "#2D3A56"] as const;

// Type definition for the gradient colors
type GradientColorsType = typeof dayGradientColors | typeof nightGradientColors;

export default function AnimatedHouse() {
  // State to track current time of day
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.DAY);

  // Animation value for crossfade
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Two sets of colors for crossfade effect
  const [visibleGradient, setVisibleGradient] =
    useState<GradientColorsType>(dayGradientColors);
  const [hiddenGradient, setHiddenGradient] =
    useState<GradientColorsType>(nightGradientColors);

  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Calculate responsive dimensions while maintaining aspect ratio
  const imageWidth = screenWidth * 0.8; // 80% of screen width
  const imageHeight = screenHeight * 0.7; // 70% of screen height

  // Function to check if it's day or night based on current time
  const checkTimeOfDay = () => {
    const currentHour = new Date().getHours();
    // Day is between 6am and 6pm
    const isDay = currentHour >= 6 && currentHour < 18;
    const newTimeOfDay = isDay ? TimeOfDay.DAY : TimeOfDay.NIGHT;

    // Only update if there's a change
    if (newTimeOfDay !== timeOfDay) {
      setTimeOfDay(newTimeOfDay);
      performCrossfade(isDay);
    }
  };

  // Handle the crossfade animation between day and night
  const performCrossfade = (isDay: boolean) => {
    // Set the hidden gradient to the new target
    setHiddenGradient(isDay ? dayGradientColors : nightGradientColors);

    // Fade out current gradient
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 700, // 0.7 seconds as requested
      useNativeDriver: false,
    }).start(() => {
      // Swap gradients and reset animation
      setVisibleGradient(isDay ? dayGradientColors : nightGradientColors);
      fadeAnim.setValue(1);
    });
  };

  // Check time of day on component mount and set up interval
  useEffect(() => {
    // Set initial state based on current time
    checkTimeOfDay();

    // Set up interval to check every minute
    const intervalId = setInterval(checkTimeOfDay, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient layers for crossfade effect */}
      <View style={styles.background}>
        {/* Hidden gradient (will become visible during transition) */}
        <LinearGradient
          colors={hiddenGradient}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Visible gradient that fades out during transition */}
      <Animated.View style={[styles.background, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={visibleGradient}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Stack.Screen
        options={{
          title: "Animated House",
          headerShown: true,
        }}
      />

      <View style={styles.content}>
        <Image
          source={require("../assets/images/Plain2dHouse.webp")}
          style={[
            styles.houseImage,
            { width: imageWidth, height: imageHeight },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Time indicator */}
      <View style={styles.timeIndicator}>
        <Text style={styles.timeText}>Current: {timeOfDay}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  houseImage: {
    // Base styles, dimensions will be overridden by inline styles
  },
  timeIndicator: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
