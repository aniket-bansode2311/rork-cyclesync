import React from "react";
import { StyleSheet, Text, View } from "react-native";

import colors from "@/constants/colors";

interface LogoProps {
  size?: "small" | "medium" | "large";
}

export const Logo: React.FC<LogoProps> = ({ size = "medium" }) => {
  const getFontSize = () => {
    switch (size) {
      case "small":
        return 24;
      case "large":
        return 42;
      case "medium":
      default:
        return 32;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize: getFontSize() }]}>
        Cycle<Text style={styles.highlight}>Sync</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "700",
    color: colors.black,
  },
  highlight: {
    color: colors.primary,
  },
});