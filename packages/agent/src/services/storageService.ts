// ============================================================================
// VOZIA AGENT SDK - STORAGE SERVICE
// ============================================================================

import type { Message, Session, StorageAdapter } from '../types';
import { STORAGE_KEYS } from '../core/config';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface StorageConfig {
  adapter?: StorageAdapter;
  debug?: boolean;
}

interface StoredConversation {
  sessionId: string;
  messages: Message[];
  updatedAt: string;
}

interface OfflineQueueItem {
  id: string;
  message: string;
  sessionId: string;
  timestamp: string;
  attempts: number;
}

// ----------------------------------------------------------------------------
// Default AsyncStorage Adapter
// ----------------------------------------------------------------------------

/**
 * Default adapter using @react-native-async-storage/async-storage
 */
class AsyncStorageAdapter implements StorageAdapter {
  private AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null;

  private async getStorage() {
    if (!this.AsyncStorage) {
      const module = await import('@react-native-async-storage/async-storage');
      this.AsyncStorage = module.default;
    }
    return this.AsyncStorage;
  }

  async getItem(key: string): Promise<string | null> {
    const storage = await this.getStorage();
    return storage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    const storage = await this.getStorage();
    await storage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    const storage = await this.getStorage();
    await storage.removeItem(key);
  }

  async getAllKeys(): Promise<string[]> {
    const storage = await this.getStorage();
    const keys = await storage.getAllKeys();
    return keys.filter((key) => key.startsWith('@vozia/'));
  }

  async clear(): Promise<void> {
    const keys = await this.getAllKeys();
    const storage = await this.getStorage();
    await storage.multiRemove(keys);
  }
}

// ----------------------------------------------------------------------------
// In-Memory Adapter
// ----------------------------------------------------------------------------

/**
 * In-memory storage adapter (for testing or when persistence is disabled)
 */
class InMemoryAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// ----------------------------------------------------------------------------
// Storage Service
// ----------------------------------------------------------------------------

/**
 * Storage service for persisting conversations, sessions, and offline queue
 */
export class StorageService {
  private adapter: StorageAdapter;
  private debug: boolean;

  constructor(config: StorageConfig = {}) {
    this.adapter = config.adapter ?? new AsyncStorageAdapter();
    this.debug = config.debug ?? false;
  }

  // --------------------------------------------------------------------------
  // Session Storage
  // --------------------------------------------------------------------------

  /**
   * Save current session ID
   */
  async saveSessionId(sessionId: string): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    this.log('Session ID saved', { sessionId });
  }

  /**
   * Get saved session ID
   */
  async getSessionId(): Promise<string | null> {
    return this.adapter.getItem(STORAGE_KEYS.SESSION_ID);
  }

  /**
   * Clear session ID
   */
  async clearSessionId(): Promise<void> {
    await this.adapter.removeItem(STORAGE_KEYS.SESSION_ID);
  }

  // --------------------------------------------------------------------------
  // User Storage
  // --------------------------------------------------------------------------

  /**
   * Save user ID
   */
  async saveUserId(userId: string): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.USER_ID, userId);
  }

  /**
   * Get saved user ID
   */
  async getUserId(): Promise<string | null> {
    return this.adapter.getItem(STORAGE_KEYS.USER_ID);
  }

  // --------------------------------------------------------------------------
  // Conversation History
  // --------------------------------------------------------------------------

  /**
   * Save conversation history
   */
  async saveConversation(sessionId: string, messages: Message[]): Promise<void> {
    const key = STORAGE_KEYS.CONVERSATION_HISTORY(sessionId);
    const data: StoredConversation = {
      sessionId,
      messages,
      updatedAt: new Date().toISOString(),
    };
    await this.adapter.setItem(key, JSON.stringify(data));
    this.log('Conversation saved', { sessionId, messageCount: messages.length });
  }

  /**
   * Get conversation history
   */
  async getConversation(sessionId: string): Promise<Message[]> {
    const key = STORAGE_KEYS.CONVERSATION_HISTORY(sessionId);
    const data = await this.adapter.getItem(key);

    if (!data) {
      return [];
    }

    try {
      const parsed = JSON.parse(data) as StoredConversation;
      // Convert timestamp strings back to Date objects
      return parsed.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch {
      this.log('Failed to parse conversation', { sessionId }, 'warn');
      return [];
    }
  }

  /**
   * Add message to conversation
   */
  async addMessage(sessionId: string, message: Message): Promise<void> {
    const messages = await this.getConversation(sessionId);
    messages.push(message);
    await this.saveConversation(sessionId, messages);
  }

  /**
   * Clear conversation history
   */
  async clearConversation(sessionId: string): Promise<void> {
    const key = STORAGE_KEYS.CONVERSATION_HISTORY(sessionId);
    await this.adapter.removeItem(key);
  }

  /**
   * Get all conversation session IDs
   */
  async getAllConversationIds(): Promise<string[]> {
    const allKeys = await this.adapter.getAllKeys();
    const prefix = '@vozia/history/';
    return allKeys
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.replace(prefix, ''));
  }

  // --------------------------------------------------------------------------
  // Offline Queue
  // --------------------------------------------------------------------------

  /**
   * Add message to offline queue
   */
  async queueOfflineMessage(
    message: string,
    sessionId: string
  ): Promise<string> {
    const queue = await this.getOfflineQueue();
    const item: OfflineQueueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      message,
      sessionId,
      timestamp: new Date().toISOString(),
      attempts: 0,
    };
    queue.push(item);
    await this.adapter.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    this.log('Message queued offline', { id: item.id });
    return item.id;
  }

  /**
   * Get offline queue
   */
  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    const data = await this.adapter.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data) as OfflineQueueItem[];
    } catch {
      return [];
    }
  }

  /**
   * Remove item from offline queue
   */
  async removeFromOfflineQueue(id: string): Promise<void> {
    const queue = await this.getOfflineQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await this.adapter.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(filtered));
  }

  /**
   * Update offline queue item (e.g., increment attempts)
   */
  async updateOfflineQueueItem(
    id: string,
    update: Partial<OfflineQueueItem>
  ): Promise<void> {
    const queue = await this.getOfflineQueue();
    const index = queue.findIndex((item) => item.id === id);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...update };
      await this.adapter.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    }
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    await this.adapter.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  }

  /**
   * Get offline queue count
   */
  async getOfflineQueueCount(): Promise<number> {
    const queue = await this.getOfflineQueue();
    return queue.length;
  }

  // --------------------------------------------------------------------------
  // Theme Preference
  // --------------------------------------------------------------------------

  /**
   * Save theme preference
   */
  async saveThemePreference(isDark: boolean): Promise<void> {
    await this.adapter.setItem(
      STORAGE_KEYS.THEME_PREFERENCE,
      JSON.stringify({ isDark })
    );
  }

  /**
   * Get theme preference
   */
  async getThemePreference(): Promise<boolean | null> {
    const data = await this.adapter.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    if (!data) {
      return null;
    }
    try {
      const parsed = JSON.parse(data);
      return parsed.isDark ?? null;
    } catch {
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // General Methods
  // --------------------------------------------------------------------------

  /**
   * Clear all Vozia storage
   */
  async clearAll(): Promise<void> {
    await this.adapter.clear();
    this.log('All storage cleared');
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    conversationCount: number;
    offlineQueueCount: number;
    hasSession: boolean;
    hasUser: boolean;
  }> {
    const [conversationIds, queue, sessionId, userId] = await Promise.all([
      this.getAllConversationIds(),
      this.getOfflineQueue(),
      this.getSessionId(),
      this.getUserId(),
    ]);

    return {
      conversationCount: conversationIds.length,
      offlineQueueCount: queue.length,
      hasSession: !!sessionId,
      hasUser: !!userId,
    };
  }

  /**
   * Set custom storage adapter
   */
  setAdapter(adapter: StorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Create in-memory adapter (useful for testing)
   */
  static createInMemoryAdapter(): StorageAdapter {
    return new InMemoryAdapter();
  }

  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  private log(
    message: string,
    data?: Record<string, unknown>,
    level: 'log' | 'warn' | 'error' = 'log'
  ): void {
    if (!this.debug) return;

    const logMessage = `[VoziaAgent:Storage] ${message}`;
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }
}
