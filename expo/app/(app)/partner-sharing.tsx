import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Users, 
  Plus, 
  Share2, 
  Copy, 
  Settings, 
  UserCheck, 
  UserX,
  Clock,
  Shield
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { usePartnerSharing } from '@/hooks/usePartnerSharing';

export default function PartnerSharingScreen() {
  const {
    connections,
    activeInvitations,
    hasActiveConnection,
    isLoading,
    generateInvitation,
    revokeInvitation,
    disconnectPartner,
  } = usePartnerSharing();

  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const handleGenerateInvitation = async () => {
    try {
      setIsGeneratingInvite(true);
      const invitation = await generateInvitation();
      
      Alert.alert(
        'Invitation Created',
        `Share this code with your partner: ${invitation.code}`,
        [
          {
            text: 'Copy Code',
            onPress: () => Clipboard.setString(invitation.code),
          },
          {
            text: 'Share Link',
            onPress: () => Share.share({
              message: `Join me on CycleSync! Use this link: ${invitation.link}`,
              url: invitation.link,
            }),
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate invitation');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleRevokeInvitation = (invitationId: string) => {
    Alert.alert(
      'Revoke Invitation',
      'Are you sure you want to revoke this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => revokeInvitation(invitationId),
        },
      ]
    );
  };

  const handleDisconnectPartner = (connectionId: string, partnerName: string) => {
    Alert.alert(
      'Disconnect Partner',
      `Are you sure you want to disconnect ${partnerName}? They will no longer have access to your shared data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectPartner(connectionId),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Partner Sharing',
          headerStyle: { backgroundColor: colors.background },
        }} 
      />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Users size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Partner Sharing</Text>
        <Text style={styles.subtitle}>
          Share your cycle information with your partner in a secure and private way
        </Text>
      </View>

      {/* Connected Partners Section */}
      {connections.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Partners</Text>
          {connections.map((connection) => (
            <View key={connection.id} style={styles.connectionCard}>
              <View style={styles.connectionHeader}>
                <View style={styles.connectionInfo}>
                  <UserCheck size={20} color={colors.success} />
                  <Text style={styles.partnerName}>{connection.partnerName}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDisconnectPartner(connection.id, connection.partnerName)}
                  style={styles.disconnectButton}
                >
                  <UserX size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={styles.connectionDate}>
                Connected on {new Date(connection.connectedAt).toLocaleDateString()}
              </Text>
              <View style={styles.permissionsSummary}>
                <Shield size={14} color={colors.gray[500]} />
                <Text style={styles.permissionsText}>
                  {Object.values(connection.permissions).filter(Boolean).length} permissions enabled
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Active Invitations Section */}
      {activeInvitations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Invitations</Text>
          {activeInvitations.map((invitation) => (
            <View key={invitation.id} style={styles.invitationCard}>
              <View style={styles.invitationHeader}>
                <View style={styles.invitationInfo}>
                  <Clock size={16} color={colors.warning} />
                  <Text style={styles.invitationCode}>Code: {invitation.code}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRevokeInvitation(invitation.id)}
                  style={styles.revokeButton}
                >
                  <Text style={styles.revokeButtonText}>Revoke</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.expirationText}>
                Expires on {new Date(invitation.expiresAt).toLocaleDateString()}
              </Text>
              <View style={styles.invitationActions}>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => Clipboard.setString(invitation.code)}
                >
                  <Copy size={14} color={colors.primary} />
                  <Text style={styles.copyButtonText}>Copy Code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => Share.share({
                    message: `Join me on CycleSync! Use this link: ${invitation.link}`,
                    url: invitation.link,
                  })}
                >
                  <Share2 size={14} color={colors.primary} />
                  <Text style={styles.shareButtonText}>Share Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        {!hasActiveConnection && (
          <Button
            title="Generate Invitation"
            onPress={handleGenerateInvitation}
            isLoading={isGeneratingInvite}
            style={styles.actionButton}
            testID="generate-invitation-button"
          />
        )}

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            // Navigate to sharing permissions screen
            console.log('Navigate to sharing permissions');
          }}
        >
          <Settings size={20} color={colors.primary} />
          <Text style={styles.settingsButtonText}>Sharing Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            // Navigate to partner view screen
            console.log('Navigate to partner view');
          }}
        >
          <Users size={20} color={colors.primary} />
          <Text style={styles.settingsButtonText}>Preview Partner View</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How Partner Sharing Works</Text>
        <Text style={styles.infoText}>
          • Generate an invitation code to share with your partner{'\n'}
          • Your partner can use the code to connect to your account{'\n'}
          • You control what information is shared through permissions{'\n'}
          • All data sharing is secure and encrypted{'\n'}
          • You can disconnect your partner at any time
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
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
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 12,
  },
  connectionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginLeft: 8,
  },
  disconnectButton: {
    padding: 4,
  },
  connectionDate: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
  },
  permissionsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionsText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  invitationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invitationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invitationCode: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginLeft: 8,
  },
  revokeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.error,
    borderRadius: 6,
  },
  revokeButtonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600' as const,
  },
  expirationText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500' as const,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500' as const,
  },
  actionButton: {
    marginBottom: 12,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButtonText: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 12,
    fontWeight: '500' as const,
  },
  infoSection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
});