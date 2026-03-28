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
import { Mail, Lock, User } from "lucide-react-native";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/utils/validation";

export default function SignupScreen() {
  const { signup, error, isLoading, clearError } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });
  
  const emailError = touched.email ? validateEmail(email)?.message : undefined;
  const passwordError = touched.password ? validatePassword(password)?.message : undefined;
  
  const handleSignup = async () => {
    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });
    
    // Validate form
    if (emailError || passwordError || !email || !password) {
      return;
    }
    
    // Clear any previous errors
    clearError();
    
    // Attempt signup
    await signup({ email, password, name });
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
              <Text style={styles.subtitle}>Create your account</Text>
            </View>
            
            {error && <ErrorMessage message={error} onDismiss={clearError} />}
            
            <View style={styles.form}>
              <Input
                label="Name (Optional)"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                leftIcon={<User size={20} color={colors.gray[500]} />}
                testID="name-input"
              />
              
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
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                error={passwordError}
                touched={touched.password}
                isPassword
                leftIcon={<Lock size={20} color={colors.gray[500]} />}
                testID="password-input"
              />
              
              <PasswordStrengthIndicator password={password} />
              
              <Text style={styles.passwordRequirements}>
                Password must be at least 8 characters and include uppercase, lowercase, 
                number, and special character.
              </Text>
              
              <Button
                title="Create Account"
                onPress={handleSignup}
                isLoading={isLoading}
                fullWidth
                style={styles.signupButton}
                testID="signup-button"
              />
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Log In</Text>
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
  passwordRequirements: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 24,
  },
  signupButton: {
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
  loginLink: {
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
});