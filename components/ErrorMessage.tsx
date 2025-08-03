import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

import colors from "@/constants/colors";

interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss 
}) => {
  if (!message) return null;
  
  return (
    <View style={styles.container} testID="error-message">
      <AlertCircle size={18} color={colors.error} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEEEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  text: {
    color: colors.error,
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
});