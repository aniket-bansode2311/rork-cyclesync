import { Link } from "expo-router";
import React, { useState } from "react";
import { 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import { Mail, Lock } from "lucide-react-native";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail } from "@/utils/validation";

export default function LoginScreen() {
  const { login, error, isLoading, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  
  const emailError = touched.email ? validateEmail(email)?.message : undefined;
  const passwordError = touched.password && !password ? "Password is required" : undefined;
  
  const handleLogin = async () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate form
    if (emailError || passwordError || !email || !password) {
      return;
    }
    
    // Clear any previous errors
    clearError();
    
    // Attempt login
    await login({ email, password });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Logo size="large" />
              <Text style={styles.subtitle}>Welcome back</Text>
            </View>
            
            {error && <ErrorMessage message={error} onDismiss={clearError} />}
            
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                error={emailError}
                touched={touched.email}
                leftIcon={<Mail size={20} color={colors.gray[500]} />}
                testID="email-input"
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                error={passwordError}
                touched={touched.password}
                isPassword
                leftIcon={<Lock size={20} color={colors.gray[500]} />}
                testID="password-input"
              />
              
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
              
              <Button
                title="Log In"
                onPress={handleLogin}
                isLoading={isLoading}
                fullWidth
                style={styles.loginButton}
                testID="login-button"
              />
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    color: colors.gray[600],
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    color: colors.gray[600],
  },
  signupLink: {
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
});