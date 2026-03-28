export interface PartnerInvitation {
  id: string;
  code: string;
  link: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface PartnerConnection {
  id: string;
  partnerName: string;
  connectedAt: string;
  isActive: boolean;
  permissions: SharingPermissions;
}

export interface SharingPermissions {
  shareBasicCycle: boolean;
  shareFertileWindow: boolean;
  shareMood: boolean;
  shareSymptoms: boolean;
  sharePregnancyUpdates: boolean;
  sharePostpartumUpdates: boolean;
  shareMenopauseUpdates: boolean;
}

export interface SharedData {
  currentCycleDay?: number;
  cycleLength?: number;
  periodStartDate?: string;
  fertileWindow?: {
    start: string;
    end: string;
    peak: string;
  };
  mood?: {
    current: string;
    intensity: number;
  };
  symptoms?: string[];
  pregnancyWeek?: number;
  isPregnant?: boolean;
  isPostpartum?: boolean;
  isMenopause?: boolean;
  lastUpdated: string;
}

export interface PartnerView {
  partnerName: string;
  sharedData: SharedData;
  permissions: SharingPermissions;
  connectionStatus: 'connected' | 'pending' | 'disconnected';
}