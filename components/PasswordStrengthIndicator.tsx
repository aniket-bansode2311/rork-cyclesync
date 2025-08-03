import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import colors from "@/constants/colors";
import { getPasswordStrength } from "@/utils/validation";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password 
}) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  
  const getStrengthText = () => {
    if (strength === 0) return "Enter password";
    if (strength < 0.3) return "Weak";
    if (strength < 0.6) return "Medium";
    if (strength < 0.8) return "Strong";
    return "Very strong";
  };
  
  const getStrengthColor = () => {
    if (strength === 0) return colors.gray[300];
    if (strength < 0.3) return colors.error;
    if (strength < 0.6) return colors.warning;
    if (strength < 0.8) return colors.success;
    return colors.success;
  };
  
  const strengthText = getStrengthText();
  const strengthColor = getStrengthColor();
  
  return (
    <View style={styles.container} testID="password-strength">
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.strengthBar, 
            { width: `${strength * 100}%`, backgroundColor: strengthColor }
          ]} 
        />
      </View>
      <Text style={[styles.strengthText, { color: strengthColor }]}>
        {strengthText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  barContainer: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  strengthBar: {
    height: "100%",
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },
});