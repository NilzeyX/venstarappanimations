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
const skyClearNightGradient = ["#0C1221", "#1f2a3a"] as const;
const skySnowDayGradient = ["#859db2", "#8ca5c7"] as const;
const skySnowNightGradient = ["#2a3646", "#1f2a3a"] as const;
const skyCloudyDayGradient = ["#6e8bb2", "#4f71a7"] as const;
const skyCloudyNightGradient = ["#1e2430", "#1f2a3a"] as const;
const skyRainyDayGradient = ["#5a7799", "#4f71a7"] as const;
const skyRainyNightGradient = ["#1a222d", "#1f2a3a"] as const;
const skyPartlyCloudyDayGradient = ["#7e96ba", "#4f71a7"] as const;
const skyPartlyCloudyNightGradient = ["#232936", "#1f2a3a"] as const;

// Floor gradient colors for different conditions
const floorSunnyDayGradient = ["#88a6c9", "#4f71a7"] as const;
const floorClearNightGradient = ["#1a2639", "#101825"] as const;
const floorSnowDayGradient = ["#7b96bb", "#748fbd"] as const;
const floorSnowNightGradient = ["#3a4961", "#293546"] as const;
const floorCloudyDayGradient = ["#6a8cb5", "#3c5a87"] as const;
const floorCloudyNightGradient = ["#1c2938", "#131c28"] as const;
const floorRainyDayGradient = ["#5d7ea0", "#3c5a87"] as const;
const floorRainyNightGradient = ["#192330", "#131c28"] as const;
const floorPartlyCloudyDayGradient = ["#7590b3", "#4f71a7"] as const;
const floorPartlyCloudyNightGradient = ["#232f42", "#1b2535"] as const;

// Standard gradients (used as fallbacks or defaults)
const skyGradient = ["#374a61", "#435469"] as const;
const floorGradient = ["#50627b", "#4f71a7"] as const;

// Type definition for the gradient colors
type FloorGradientType = readonly [string, string];
type SkyGradientType = readonly [string, string];

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

  // Define house dimensions based on actual aspect ratio (4930 × 10554)
  const aspectRatio = 4930 / 10554; // Width to height ratio
  const houseWidth = screenWidth * 1.5; // Making the house 50% wider than the screen
  const houseHeight = houseWidth / aspectRatio;

  // Calculate position for house to place its center point at 20% from top
  const centerYPosition = screenHeight * 0.35; // 20% from top
  const houseTopPosition = centerYPosition - houseHeight / 2;

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
    switch (weather) {
      case WeatherType.SUNNY_DAY:
      case WeatherType.CLEAR_NIGHT:
        return "sunny";
      case WeatherType.SNOW_DAY:
      case WeatherType.SNOW_NIGHT:
        return "snow";
      case WeatherType.CLOUDY_DAY:
      case WeatherType.CLOUDY_NIGHT:
        return "cloudy";
      case WeatherType.RAINY_DAY:
      case WeatherType.RAINY_NIGHT:
        return "rainy";
      case WeatherType.PARTLY_CLOUDY_DAY:
      case WeatherType.PARTLY_CLOUDY_NIGHT:
        return "partly_cloudy";
      default:
        return "sunny";
    }
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
    // Select the appropriate floor and sky gradients based on weather condition
    let newFloorGradient: FloorGradientType;
    let newSkyGradient: SkyGradientType;

    switch (weather) {
      case WeatherType.SUNNY_DAY:
        newFloorGradient = floorSunnyDayGradient;
        newSkyGradient = skySunnyDayGradient;
        break;
      case WeatherType.CLEAR_NIGHT:
        newFloorGradient = floorClearNightGradient;
        newSkyGradient = skyClearNightGradient;
        break;
      case WeatherType.SNOW_DAY:
        newFloorGradient = floorSnowDayGradient;
        newSkyGradient = skySnowDayGradient;
        break;
      case WeatherType.SNOW_NIGHT:
        newFloorGradient = floorSnowNightGradient;
        newSkyGradient = skySnowNightGradient;
        break;
      case WeatherType.CLOUDY_DAY:
        newFloorGradient = floorCloudyDayGradient;
        newSkyGradient = skyCloudyDayGradient;
        break;
      case WeatherType.CLOUDY_NIGHT:
        newFloorGradient = floorCloudyNightGradient;
        newSkyGradient = skyCloudyNightGradient;
        break;
      case WeatherType.RAINY_DAY:
        newFloorGradient = floorRainyDayGradient;
        newSkyGradient = skyRainyDayGradient;
        break;
      case WeatherType.RAINY_NIGHT:
        newFloorGradient = floorRainyNightGradient;
        newSkyGradient = skyRainyNightGradient;
        break;
      case WeatherType.PARTLY_CLOUDY_DAY:
        newFloorGradient = floorPartlyCloudyDayGradient;
        newSkyGradient = skyPartlyCloudyDayGradient;
        break;
      case WeatherType.PARTLY_CLOUDY_NIGHT:
        newFloorGradient = floorPartlyCloudyNightGradient;
        newSkyGradient = skyPartlyCloudyNightGradient;
        break;
      default:
        newFloorGradient = floorGradient;
        newSkyGradient = skyGradient;
    }

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
    switch (weatherCondition) {
      case WeatherType.SUNNY_DAY:
        return require("../assets/images/Plain2dHouse.webp");
      case WeatherType.CLEAR_NIGHT:
        return require("../assets/images/Plain2dHouse.webp");
      case WeatherType.SNOW_DAY:
        return require("../assets/images/SnowDayHouse.webp");
      case WeatherType.SNOW_NIGHT:
        return require("../assets/images/SnowNightHouse.webp");
      case WeatherType.CLOUDY_DAY:
        return require("../assets/images/Plain2dHouse.webp");
      case WeatherType.CLOUDY_NIGHT:
        return require("../assets/images/Plain2dHouse.webp");
      case WeatherType.RAINY_DAY:
        return require("../assets/images/Plain2dHouse.webp");
      case WeatherType.RAINY_NIGHT:
        return require("../assets/images/Plain2dHouse.webp");
      case WeatherType.PARTLY_CLOUDY_DAY:
        return require("../assets/images/Plain2dHouse.webp");
      case WeatherType.PARTLY_CLOUDY_NIGHT:
        return require("../assets/images/Plain2dHouse.webp");
      default:
        return require("../assets/images/Plain2dHouse.webp");
    }
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
      <View style={[styles.houseContainer]}>
        <Image
          source={getHouseImage()}
          style={styles.houseImage}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "60%", // Bottom 60% of screen
    bottom: 0,
    width: "100%",
  },
  floorGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "25%",
    zIndex: 1,
  },
  houseContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    zIndex: 5,
  },
  houseImage: {
    width: "130%",
    height: "130%",
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
    zIndex: 5,
  },
});
