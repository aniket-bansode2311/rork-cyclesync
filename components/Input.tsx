import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TextInputProps, 
  TouchableOpacity, 
  View 
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import colors from "@/constants/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  touched?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  touched = false,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const hasError = !!error && touched;
  
  const getContainerStyle = () => {
    return [
      styles.container,
      isFocused && styles.focused,
      hasError && styles.error,
      style,
    ];
  };
  
  const renderPasswordIcon = () => {
    if (!isPassword) return null;
    
    return (
      <TouchableOpacity 
        onPress={togglePasswordVisibility} 
        style={styles.passwordIcon}
        testID="toggle-password"
      >
        {passwordVisible ? (
          <EyeOff size={20} color={colors.gray[500]} />
        ) : (
          <Eye size={20} color={colors.gray[500]} />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={getContainerStyle()}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.gray[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !passwordVisible}
          testID="input"
          {...rest}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        {renderPasswordIcon()}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    height: 56,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: colors.black,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  passwordIcon: {
    padding: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});