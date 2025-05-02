import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Image, Animated } from "react-native";
import logo from "../assets/images/logo.png";

export default function SplashScreen() {
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnimation]);
  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.imageContainer, { opacity: fadeAnimation }]}
      >
        <Image style={styles.image} source={logo} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3d3f",
  },
  imageContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width:150,
    resizeMode: "contain",
  },
});