import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  UserPlus, 
  Key,
  Heart,
  Shield
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { usePartnerSharing } from '@/hooks/usePartnerSharing';

export default function PartnerInviteScreen() {
  const router = useRouter();
  const { connectPartner } = usePartnerSharing();
  
  const [partnerName, setPartnerName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!partnerName.trim()) {
      Alert.alert('Error', 'Please enter your partner\'s name');
      return;
    }

    if (!invitationCode.trim()) {
      Alert.alert('Error', 'Please enter the invitation code');
      return;
    }

    try {
      setIsConnecting(true);
      const success = await connectPartner(partnerName.trim(), invitationCode.trim().toUpperCase());
      
      if (success) {
        Alert.alert(
          'Connected Successfully!',
          `You are now connected with ${partnerName}. You can view their shared information and they can view yours based on your privacy settings.`,
          [
            {
              text: 'View Shared Data',
              onPress: () => router.push('/partner-view'),
            },
            {
              text: 'Manage Permissions',
              onPress: () => router.push('/sharing-permissions'),
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Connection Failed', 'Invalid invitation code or the invitation has expired.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect with partner. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Connect with Partner',
          headerStyle: { backgroundColor: colors.background },
        }} 
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <UserPlus size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Connect with Partner</Text>
        <Text style={styles.subtitle}>
          Enter the invitation code your partner shared with you to connect your accounts
        </Text>
      </View>

      {/* Connection Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Partner&apos;s Name</Text>
          <TextInput
            style={styles.input}
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder="Enter your partner&apos;s name"
            placeholderTextColor={colors.gray[400]}
            testID="partner-name-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Invitation Code</Text>
          <View style={styles.codeInputContainer}>
            <Key size={20} color={colors.gray[400]} />
            <TextInput
              style={styles.codeInput}
              value={invitationCode}
              onChangeText={setInvitationCode}
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="characters"
              maxLength={6}
              testID="invitation-code-input"
            />
          </View>
        </View>

        <Button
          title="Connect"
          onPress={handleConnect}
          isLoading={isConnecting}
          style={styles.connectButton}
          testID="connect-button"
        />
      </View>

      {/* Information Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Heart size={20} color={colors.secondary} />
            <Text style={styles.infoTitle}>What happens when you connect?</Text>
          </View>
          <Text style={styles.infoText}>
            • You&apos;ll be able to see each other&apos;s shared cycle information{"\n"}
            • Both partners control what information they share{"\n"}
            • Either partner can disconnect at any time{"\n"}
            • All shared data is encrypted and secure
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Shield size={20} color={colors.success} />
            <Text style={styles.infoTitle}>Privacy & Security</Text>
          </View>
          <Text style={styles.infoText}>
            • Only information you choose to share is visible{"\n"}
            • Your partner cannot see your full data history{"\n"}
            • You can change sharing permissions anytime{"\n"}
            • No personal data is stored on external servers
          </Text>
        </View>
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          If you don&apos;t have an invitation code, ask your partner to generate one from their 
          Partner Sharing screen. Invitation codes expire after 7 days for security.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    margin: 20,
    marginTop: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.black,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.black,
    letterSpacing: 2,
  },
  connectButton: {
    marginTop: 10,
  },
  infoSection: {
    margin: 20,
    marginTop: 0,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  helpSection: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
});