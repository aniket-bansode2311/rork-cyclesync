export interface DataCollectionSettings {
  periods: boolean;
  symptoms: boolean;
  mood: boolean;
  fertility: boolean;
  pregnancy: boolean;
  menopause: boolean;
  birthControl: boolean;
  nutrition: boolean;
  fitness: boolean;
  sleep: boolean;
  waterIntake: boolean;
  journal: boolean;
}

export interface ConsentPurposes {
  personalizedInsights: boolean;
  anonymizedResearch: boolean;
  productImprovement: boolean;
  healthRecommendations: boolean;
  cycleTracking: boolean;
  symptomAnalysis: boolean;
}

export interface PrivacySettings {
  anonymousMode: boolean;
  userId: string;
  dataEncryption: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  dataCollection: DataCollectionSettings;
  consentPurposes: ConsentPurposes;
  lastUpdated: Date;
}

export interface UserData {
  periods: any[];
  symptoms: any[];
  fertility: any[];
  pregnancy: any[];
  menopause: any[];
  birthControl: any[];
  wellness: any[];
  settings: any;
}

export interface PrivacyContextType {
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  updateDataCollectionSettings: (settings: Partial<DataCollectionSettings>) => Promise<void>;
  updateConsentPurposes: (purposes: Partial<ConsentPurposes>) => Promise<void>;
  exportUserData: () => Promise<string>;
  deleteAllUserData: () => Promise<void>;
  isLoading: boolean;
}

export const DEFAULT_DATA_COLLECTION: DataCollectionSettings = {
  periods: true,
  symptoms: true,
  mood: true,
  fertility: true,
  pregnancy: true,
  menopause: true,
  birthControl: true,
  nutrition: true,
  fitness: true,
  sleep: true,
  waterIntake: true,
  journal: true,
};

export const DEFAULT_CONSENT_PURPOSES: ConsentPurposes = {
  personalizedInsights: true,
  anonymizedResearch: false,
  productImprovement: false,
  healthRecommendations: true,
  cycleTracking: true,
  symptomAnalysis: true,
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  anonymousMode: false,
  userId: '',
  dataEncryption: true,
  analyticsEnabled: false,
  crashReportingEnabled: false,
  dataCollection: DEFAULT_DATA_COLLECTION,
  consentPurposes: DEFAULT_CONSENT_PURPOSES,
  lastUpdated: new Date(),
};