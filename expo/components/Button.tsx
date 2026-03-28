import React from "react";
import { 
  ActivityIndicator, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  TouchableOpacityProps,
  View 
} from "react-native";

import colors from "@/constants/colors";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  disabled,
  ...rest
}) => {
  const getContainerStyle = () => {
    const variantStyle = variant === 'text' ? styles.textStyle : styles[variant];
    const sizeStyle = styles[`${size}Size`];
    const widthStyle = fullWidth ? styles.fullWidth : {};
    const disabledStyle = disabled || isLoading ? styles.disabled : {};
    
    return [styles.container, variantStyle, sizeStyle, widthStyle, disabledStyle, style];
  };
  
  const getTextStyle = () => {
    const baseTextStyle = styles.text;
    const variantTextStyle = styles[`${variant}Text`];
    const sizeTextStyle = styles[`${size}Text`];
    const disabledTextStyle = disabled || isLoading ? styles.disabledText : {};
    
    return [baseTextStyle, variantTextStyle, sizeTextStyle, disabledTextStyle];
  };
  
  return (
    <TouchableOpacity
      style={getContainerStyle()}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      testID="button"
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === "primary" ? colors.white : colors.primary} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fullWidth: {
    width: "100%",
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textStyle: {
    backgroundColor: colors.transparent,
  },
  // Text variants
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },
  // Sizes
  smallSize: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumSize: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeSize: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Disabled state
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});