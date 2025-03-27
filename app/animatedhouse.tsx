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
import SunnyDayEffect from "../components/weather/SunnyDayEffect";
import SnowDayEffect from "../components/weather/SnowDayEffect";

// Time of day enum
enum TimeOfDay {
  DAY = "day",
  NIGHT = "night",
}

// Weather condition enum
enum WeatherType {
  SUNNY = "sunny",
  CLOUDY = "cloudy",
  RAINY = "rainy",
  SNOWY = "snowy",
}

// Floor gradient colors for different conditions
const dayFloorGradient = ["#bccdd2", "#dae2e4"] as const;
const nightFloorGradient = ["#373f47", "#515b63"] as const; // Darker version of day gradient
const snowyFloorGradient = ["#c3d1df", "#e6ebf0"] as const; // Blueish snow floor

// Type definition for the gradient colors
type FloorGradientType =
  | typeof dayFloorGradient
  | typeof nightFloorGradient
  | typeof snowyFloorGradient;

export default function AnimatedHouse() {
  // State to track current time of day
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.DAY);

  // State to track weather condition (currently manually set)
  const [weatherCondition, setWeatherCondition] = useState<WeatherType>(
    WeatherType.SNOWY
  );

  // Animation value for crossfade
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Two sets of colors for crossfade effect
  const [visibleFloorGradient, setVisibleFloorGradient] =
    useState<FloorGradientType>(dayFloorGradient);
  const [hiddenFloorGradient, setHiddenFloorGradient] =
    useState<FloorGradientType>(nightFloorGradient);

  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Calculate house size based only on width to maintain aspect ratio
  const imageWidth = screenWidth * 0.9; // 90% of screen width

  // Function to check if it's day or night based on current time
  const checkTimeOfDay = () => {
    const currentHour = new Date().getHours();
    // Day is between 6am and 6pm
    const isDay = currentHour >= 6 && currentHour < 18;
    const newTimeOfDay = isDay ? TimeOfDay.DAY : TimeOfDay.NIGHT;

    // Only update if there's a change
    if (newTimeOfDay !== timeOfDay) {
      setTimeOfDay(newTimeOfDay);
      updateFloorGradient(newTimeOfDay, weatherCondition);
    }
  };

  // Function to update weather (would connect to a weather API in a real app)
  const updateWeather = () => {
    // For demo purposes, let's use snowy weather
    setWeatherCondition(WeatherType.SNOWY);
    // Update gradient when weather changes
    updateFloorGradient(timeOfDay, WeatherType.SNOWY);

    // In a real app, you would fetch the actual weather:
    // const fetchWeather = async () => {
    //   try {
    //     const response = await fetch('your-weather-api-endpoint');
    //     const data = await response.json();
    //     // Update weather based on API response
    //     // const newWeather = mapApiWeatherToEnum(data.condition);
    //     // setWeatherCondition(newWeather);
    //     // updateFloorGradient(timeOfDay, newWeather);
    //   } catch (error) {
    //     console.error('Error fetching weather:', error);
    //   }
    // };
    // fetchWeather();
  };

  // Handle floor gradient updates based on time of day and weather
  const updateFloorGradient = (time: TimeOfDay, weather: WeatherType) => {
    let newGradient: FloorGradientType;

    // If it's snowing, use the snowy floor gradient regardless of time
    if (weather === WeatherType.SNOWY) {
      newGradient = snowyFloorGradient;
    } else {
      // Otherwise use day/night based on time
      newGradient =
        time === TimeOfDay.DAY ? dayFloorGradient : nightFloorGradient;
    }

    // Set the hidden gradient to the new target
    setHiddenFloorGradient(newGradient);

    // Perform crossfade
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 700,
      useNativeDriver: false,
    }).start(() => {
      // Swap gradients and reset animation
      setVisibleFloorGradient(newGradient);
      fadeAnim.setValue(1);
    });
  };

  // Check time of day and weather on component mount and set up interval
  useEffect(() => {
    // Set initial states
    checkTimeOfDay();
    updateWeather();

    // Set up interval to check every minute
    const timeIntervalId = setInterval(checkTimeOfDay, 60000);

    // Set up interval to check weather every hour (in a real app)
    // const weatherIntervalId = setInterval(updateWeather, 3600000);

    // Clean up intervals on unmount
    return () => {
      clearInterval(timeIntervalId);
      // clearInterval(weatherIntervalId);
    };
  }, []);

  // Render the appropriate weather effect based on time and conditions
  const renderWeatherEffect = () => {
    if (timeOfDay === TimeOfDay.DAY) {
      switch (weatherCondition) {
        case WeatherType.SUNNY:
          return <SunnyDayEffect />;
        case WeatherType.SNOWY:
          return <SnowDayEffect />;
        // Add other day weather effects as they're implemented
        default:
          return null;
      }
    } else {
      // Night time effects
      switch (weatherCondition) {
        case WeatherType.SNOWY:
          return <SnowDayEffect />;
        // Implement and return other night effects when they're created
        default:
          return null;
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Background color instead of full gradient */}
      <View
        style={[
          styles.background,
          {
            backgroundColor:
              weatherCondition === WeatherType.SNOWY
                ? "#7e96ba"
                : timeOfDay === TimeOfDay.DAY
                ? "#87CEEB"
                : "#0C1221",
          },
        ]}
      />

      {/* Floor gradient layers for crossfade effect */}
      <View style={styles.floor}>
        {/* Hidden gradient (will become visible during transition) */}
        <LinearGradient
          colors={hiddenFloorGradient}
          style={styles.floorGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Visible floor gradient that fades out during transition */}
      <Animated.View style={[styles.floor, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={visibleFloorGradient}
          style={styles.floorGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* The house image */}
      <View style={styles.content}>
        <Image
          source={require("../assets/images/Plain2dHouse.webp")}
          style={[
            styles.houseImage,
            {
              width: imageWidth,
              position: "absolute",
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Weather effects */}
      {renderWeatherEffect()}

      <Stack.Screen
        options={{
          title: "Animated House",
          headerShown: true,
        }}
      />

      {/* Time and weather indicator */}
      <View style={styles.timeIndicator}>
        <Text style={styles.timeText}>
          Time: {timeOfDay} | Weather: {weatherCondition}
        </Text>
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
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "60%", // Bottom 60% of screen
    bottom: 0,
  },
  floorGradient: {
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
