import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { 
  PartnerInvitation, 
  PartnerConnection, 
  SharingPermissions, 
  SharedData,
  PartnerView 
} from '@/types/partnerSharing';

const STORAGE_KEYS = {
  INVITATIONS: 'partner_invitations',
  CONNECTIONS: 'partner_connections',
  PERMISSIONS: 'sharing_permissions',
  SHARED_DATA: 'shared_data',
};

const defaultPermissions: SharingPermissions = {
  shareBasicCycle: true,
  shareFertileWindow: false,
  shareMood: false,
  shareSymptoms: false,
  sharePregnancyUpdates: false,
  sharePostpartumUpdates: false,
  shareMenopauseUpdates: false,
};

export const [PartnerSharingProvider, usePartnerSharing] = createContextHook(() => {
  const [invitations, setInvitations] = useState<PartnerInvitation[]>([]);
  const [connections, setConnections] = useState<PartnerConnection[]>([]);
  const [permissions, setPermissions] = useState<SharingPermissions>(defaultPermissions);
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from storage
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      setIsLoading(true);
      
      const [storedInvitations, storedConnections, storedPermissions, storedSharedData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.INVITATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.CONNECTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SHARED_DATA),
      ]);

      if (storedInvitations) {
        setInvitations(JSON.parse(storedInvitations));
      }
      
      if (storedConnections) {
        setConnections(JSON.parse(storedConnections));
      }
      
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
      
      if (storedSharedData) {
        setSharedData(JSON.parse(storedSharedData));
      }
    } catch (error) {
      console.error('Error loading partner sharing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvitation = async (): Promise<PartnerInvitation> => {
    const invitation: PartnerInvitation = {
      id: Date.now().toString(),
      code: generateInvitationCode(),
      link: generateInvitationLink(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      isActive: true,
    };

    const updatedInvitations = [...invitations, invitation];
    setInvitations(updatedInvitations);
    await AsyncStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(updatedInvitations));
    
    return invitation;
  };

  const revokeInvitation = async (invitationId: string) => {
    const updatedInvitations = invitations.map(inv => 
      inv.id === invitationId ? { ...inv, isActive: false } : inv
    );
    setInvitations(updatedInvitations);
    await AsyncStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(updatedInvitations));
  };

  const connectPartner = async (partnerName: string, invitationCode: string): Promise<boolean> => {
    // Placeholder: In real implementation, this would validate the code with a server
    const connection: PartnerConnection = {
      id: Date.now().toString(),
      partnerName,
      connectedAt: new Date().toISOString(),
      isActive: true,
      permissions: { ...permissions },
    };

    const updatedConnections = [...connections, connection];
    setConnections(updatedConnections);
    await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(updatedConnections));
    
    return true; // Placeholder success
  };

  const disconnectPartner = async (connectionId: string) => {
    const updatedConnections = connections.filter(conn => conn.id !== connectionId);
    setConnections(updatedConnections);
    await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(updatedConnections));
  };

  const updatePermissions = async (newPermissions: SharingPermissions) => {
    setPermissions(newPermissions);
    await AsyncStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(newPermissions));
    
    // Update permissions for all connections
    const updatedConnections = connections.map(conn => ({
      ...conn,
      permissions: newPermissions,
    }));
    setConnections(updatedConnections);
    await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(updatedConnections));
  };

  const updateSharedData = async (data: SharedData) => {
    const updatedData = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    setSharedData(updatedData);
    await AsyncStorage.setItem(STORAGE_KEYS.SHARED_DATA, JSON.stringify(updatedData));
  };

  const getPartnerView = (): PartnerView | null => {
    if (connections.length === 0 || !sharedData) return null;
    
    const activeConnection = connections.find(conn => conn.isActive);
    if (!activeConnection) return null;

    return {
      partnerName: activeConnection.partnerName,
      sharedData,
      permissions: activeConnection.permissions,
      connectionStatus: 'connected',
    };
  };

  const generateInvitationCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateInvitationLink = (): string => {
    const code = generateInvitationCode();
    return `https://cyclesync.app/partner-invite/${code}`;
  };

  const hasActiveConnection = connections.some(conn => conn.isActive);
  const activeInvitations = invitations.filter(inv => inv.isActive && new Date(inv.expiresAt) > new Date());

  return {
    invitations,
    connections,
    permissions,
    sharedData,
    isLoading,
    hasActiveConnection,
    activeInvitations,
    generateInvitation,
    revokeInvitation,
    connectPartner,
    disconnectPartner,
    updatePermissions,
    updateSharedData,
    getPartnerView,
  };
});