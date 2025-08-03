import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Secure storage wrapper that uses SecureStore on native and AsyncStorage on web
class SecureStorageManager {
  private isWeb = Platform.OS === 'web';

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        // On web, use AsyncStorage with basic encryption simulation
        const encrypted = this.simpleEncrypt(value);
        await AsyncStorage.setItem(`secure_${key}`, encrypted);
      } else {
        // On native, use SecureStore
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        // On web, get from AsyncStorage and decrypt
        const encrypted = await AsyncStorage.getItem(`secure_${key}`);
        if (!encrypted) return null;
        return this.simpleDecrypt(encrypted);
      } else {
        // On native, use SecureStore
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  async deleteItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error deleting secure data:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.isWeb) {
        const allKeys = await AsyncStorage.getAllKeys();
        return allKeys.filter(key => key.startsWith('secure_')).map(key => key.replace('secure_', ''));
      } else {
        // SecureStore doesn't have getAllKeys, so we'll maintain a key index
        const keyIndex = await SecureStore.getItemAsync('__key_index__');
        return keyIndex ? JSON.parse(keyIndex) : [];
      }
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async addKeyToIndex(key: string): Promise<void> {
    if (this.isWeb) return; // Not needed for web

    try {
      const keyIndex = await SecureStore.getItemAsync('__key_index__');
      const keys = keyIndex ? JSON.parse(keyIndex) : [];
      if (!keys.includes(key)) {
        keys.push(key);
        await SecureStore.setItemAsync('__key_index__', JSON.stringify(keys));
      }
    } catch (error) {
      console.error('Error updating key index:', error);
    }
  }

  async removeKeyFromIndex(key: string): Promise<void> {
    if (this.isWeb) return; // Not needed for web

    try {
      const keyIndex = await SecureStore.getItemAsync('__key_index__');
      const keys = keyIndex ? JSON.parse(keyIndex) : [];
      const updatedKeys = keys.filter((k: string) => k !== key);
      await SecureStore.setItemAsync('__key_index__', JSON.stringify(updatedKeys));
    } catch (error) {
      console.error('Error updating key index:', error);
    }
  }

  // Simple encryption for web (not cryptographically secure, just obfuscation)
  private simpleEncrypt(text: string): string {
    return Buffer.from(text).toString('base64');
  }

  private simpleDecrypt(encrypted: string): string {
    return Buffer.from(encrypted, 'base64').toString();
  }

  // Store data with encryption flag
  async setSecureData(key: string, data: any, encrypt: boolean = true): Promise<void> {
    const jsonData = JSON.stringify(data);
    const finalData = encrypt ? this.encrypt(jsonData) : jsonData;
    await this.setItem(key, finalData);
    await this.addKeyToIndex(key);
  }

  // Get data with decryption
  async getSecureData<T>(key: string, encrypted: boolean = true): Promise<T | null> {
    const data = await this.getItem(key);
    if (!data) return null;
    
    try {
      const jsonData = encrypted ? this.decrypt(data) : data;
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error parsing secure data:', error);
      return null;
    }
  }

  // Basic encryption (in production, use proper encryption libraries)
  private encrypt(text: string): string {
    // Simple XOR encryption for demo purposes
    // In production, use proper encryption like AES
    const key = 'CycleSyncSecureKey2024';
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(encrypted).toString('base64');
  }

  private decrypt(encrypted: string): string {
    const key = 'CycleSyncSecureKey2024';
    const text = Buffer.from(encrypted, 'base64').toString();
    let decrypted = '';
    for (let i = 0; i < text.length; i++) {
      decrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  }

  // Clear all secure data
  async clearAllSecureData(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      for (const key of keys) {
        await this.deleteItem(key);
      }
      
      if (!this.isWeb) {
        await SecureStore.deleteItemAsync('__key_index__');
      }
    } catch (error) {
      console.error('Error clearing all secure data:', error);
      throw error;
    }
  }
}

export const secureStorage = new SecureStorageManager();

// Export encryption functions for backward compatibility
export const encryptData = (data: string): string => {
  const key = 'CycleSyncSecureKey2024';
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(encrypted).toString('base64');
};

export const decryptData = (encrypted: string): string => {
  const key = 'CycleSyncSecureKey2024';
  const text = Buffer.from(encrypted, 'base64').toString();
  let decrypted = '';
  for (let i = 0; i < text.length; i++) {
    decrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return decrypted;
};