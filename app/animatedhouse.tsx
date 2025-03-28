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
  SUNNY_DAY = "sunny_day",
  CLEAR_NIGHT = "clear_night",
  SNOW_DAY = "snow_day",
  SNOW_NIGHT = "snow_night",
  CLOUDY_DAY = "cloudy_day",
  CLOUDY_NIGHT = "cloudy_night",
  RAINY_DAY = "rainy_day",
  RAINY_NIGHT = "rainy_night",
  PARTLY_CLOUDY_DAY = "partly_cloudy_day",
  PARTLY_CLOUDY_NIGHT = "partly_cloudy_night",
}

// Sky gradient colors for different conditions
const skySunnyDayGradient = ["#87CEEB", "#4f71a7"] as const;
const skySunnyNightGradient = ["#0C1221", "#1f2a3a"] as const;
const skyClearDayGradient = ["#87CEEB", "#4f71a7"] as const;
const skyClearNightGradient = ["#0C1221", "#1f2a3a"] as const;
const skyPartlyCloudyDayGradient = ["#7e96ba", "#4f71a7"] as const;
const skyPartlyCloudyNightGradient = ["#232936", "#1f2a3a"] as const;
const skyCloudyDayGradient = ["#6e8bb2", "#4f71a7"] as const;
const skyCloudyNightGradient = ["#1e2430", "#1f2a3a"] as const;
const skyRainyDayGradient = ["#5a7799", "#4f71a7"] as const;
const skyRainyNightGradient = ["#1a222d", "#1f2a3a"] as const;
const snowySkyGradient = ["#7e96ba", "#4f71a7"] as const;
const snowyNightSkyGradient = ["#2a3646", "#1f2a3a"] as const;

// Floor gradient colors for different conditions
const floorGradient = ["#50627b", "#4f71a7"] as const; // Standard floor gradient for all conditions
const skyGradient = ["#374a61", "#435469"] as const; // Standard sky gradient for all conditions

// Type definition for the gradient colors
type FloorGradientType = typeof floorGradient;
type SkyGradientType = typeof skyGradient;

export default function AnimatedHouse() {
  // State to track weather condition (currently manually set)
  const [weatherCondition, setWeatherCondition] = useState<WeatherType>(
    WeatherType.SNOW_DAY
  );

  // Animation value for crossfade
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Two sets of colors for crossfade effect
  const [visibleFloorGradient, setVisibleFloorGradient] =
    useState<FloorGradientType>(floorGradient);
  const [hiddenFloorGradient, setHiddenFloorGradient] =
    useState<FloorGradientType>(floorGradient);

  // Sky gradient states
  const [visibleSkyGradient, setVisibleSkyGradient] =
    useState<SkyGradientType>(skyGradient);
  const [hiddenSkyGradient, setHiddenSkyGradient] =
    useState<SkyGradientType>(skyGradient);

  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Calculate house size based only on width to maintain aspect ratio
  const imageWidth = screenWidth * 0.9; // 90% of screen width

  // Function to check time of day and update weather condition
  const checkTimeOfDay = () => {
    const currentHour = new Date().getHours();
    // Day is between 6am and 6pm
    const isDay = currentHour >= 6 && currentHour < 18;

    // Update weather condition based on time of day
    updateWeatherBasedOnTime(isDay);
  };

  // Function to update weather condition based on time
  const updateWeatherBasedOnTime = (isDay: boolean) => {
    // Get current weather type base
    const currentWeatherBase = getCurrentWeatherBase(weatherCondition);

    // Set appropriate day/night version
    let newWeather: WeatherType;

    switch (currentWeatherBase) {
      case "sunny":
        newWeather = isDay ? WeatherType.SUNNY_DAY : WeatherType.CLEAR_NIGHT;
        break;
      case "snow":
        newWeather = isDay ? WeatherType.SNOW_DAY : WeatherType.SNOW_NIGHT;
        break;
      case "cloudy":
        newWeather = isDay ? WeatherType.CLOUDY_DAY : WeatherType.CLOUDY_NIGHT;
        break;
      case "rainy":
        newWeather = isDay ? WeatherType.RAINY_DAY : WeatherType.RAINY_NIGHT;
        break;
      case "partly_cloudy":
        newWeather = isDay
          ? WeatherType.PARTLY_CLOUDY_DAY
          : WeatherType.PARTLY_CLOUDY_NIGHT;
        break;
      default:
        newWeather = isDay ? WeatherType.SUNNY_DAY : WeatherType.CLEAR_NIGHT;
    }

    if (newWeather !== weatherCondition) {
      setWeatherCondition(newWeather);
      updateGradients(newWeather);
    }
  };

  // Helper function to get the base weather type from a full weather condition
  const getCurrentWeatherBase = (weather: WeatherType): string => {
    if (
      weather === WeatherType.SUNNY_DAY ||
      weather === WeatherType.CLEAR_NIGHT
    ) {
      return "sunny";
    } else if (
      weather === WeatherType.SNOW_DAY ||
      weather === WeatherType.SNOW_NIGHT
    ) {
      return "snow";
    } else if (
      weather === WeatherType.CLOUDY_DAY ||
      weather === WeatherType.CLOUDY_NIGHT
    ) {
      return "cloudy";
    } else if (
      weather === WeatherType.RAINY_DAY ||
      weather === WeatherType.RAINY_NIGHT
    ) {
      return "rainy";
    } else if (
      weather === WeatherType.PARTLY_CLOUDY_DAY ||
      weather === WeatherType.PARTLY_CLOUDY_NIGHT
    ) {
      return "partly_cloudy";
    }
    return "snow"; // Default
  };

  // Function to update weather (would connect to a weather API in a real app)
  const updateWeather = () => {
    // For demo purposes, let's use snow weather
    const currentHour = new Date().getHours();
    const isDay = currentHour >= 6 && currentHour < 18;

    // Set to snow day or snow night based on time
    const newWeather = isDay ? WeatherType.SNOW_DAY : WeatherType.SNOW_NIGHT;

    // Update weather condition
    setWeatherCondition(newWeather);

    // Update gradients
    updateGradients(newWeather);

    // In a real app, you would fetch the actual weather:
    // const fetchWeather = async () => {
    //   try {
    //     const response = await fetch('your-weather-api-endpoint');
    //     const data = await response.json();
    //     // Update weather based on API response
    //     // const newWeather = mapApiWeatherToEnum(data.condition);
    //     // setWeatherCondition(newWeather);
    //     // updateGradients(newWeather);
    //   } catch (error) {
    //     console.error('Error fetching weather:', error);
    //   }
    // };
    // fetchWeather();
  };

  // Handle gradient updates based on weather
  const updateGradients = (weather: WeatherType) => {
    // Always use the standard floor gradient for now as requested
    const newFloorGradient = floorGradient;

    // For now, as requested, we'll use the same sky gradient for all cases
    const newSkyGradient = skyGradient;

    // Set the hidden gradients to the new targets
    setHiddenFloorGradient(newFloorGradient);
    setHiddenSkyGradient(newSkyGradient);

    // Perform crossfade
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 700,
      useNativeDriver: false,
    }).start(() => {
      // Swap gradients and reset animation
      setVisibleFloorGradient(newFloorGradient);
      setVisibleSkyGradient(newSkyGradient);
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

  // Render the appropriate weather effect based on condition
  const renderWeatherEffect = () => {
    switch (weatherCondition) {
      case WeatherType.SUNNY_DAY:
        return <SunnyDayEffect />;
      case WeatherType.CLEAR_NIGHT:
        return null; // Will need ClearNightEffect
      case WeatherType.SNOW_DAY:
        return <SnowDayEffect />;
      case WeatherType.SNOW_NIGHT:
        return <SnowDayEffect />; //needs night version
      case WeatherType.CLOUDY_DAY:
        return null; // Will need CloudyDayEffect
      case WeatherType.CLOUDY_NIGHT:
        return null; // Will need CloudyNightEffect
      case WeatherType.RAINY_DAY:
        return null; // Will need RainyDayEffect
      case WeatherType.RAINY_NIGHT:
        return null; // Will need RainyNightEffect
      case WeatherType.PARTLY_CLOUDY_DAY:
        return null; // Will need PartlyCloudyDayEffect
      case WeatherType.PARTLY_CLOUDY_NIGHT:
        return null; // Will need PartlyCloudyNightEffect
      default:
        return null;
    }
  };

  // Get the appropriate house image based on weather
  const getHouseImage = () => {
    // For now use the same house image for all conditions as requested
    return require("../assets/images/Plain2dHouse.webp");
  };

  return (
    <View style={styles.container}>
      {/* Sky gradient */}
      <View style={styles.background}>
        <LinearGradient
          colors={hiddenSkyGradient}
          style={styles.background}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Animated sky gradient */}
      <Animated.View style={[styles.background, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={visibleSkyGradient}
          style={styles.background}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Floor gradient */}
      <View style={styles.floor}>
        <LinearGradient
          colors={hiddenFloorGradient}
          style={styles.floorGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Animated floor gradient */}
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
          source={getHouseImage()}
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
        <Text style={styles.timeText}>Time: {weatherCondition}</Text>
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
