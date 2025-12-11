// ============================================================================
// VOZIA AGENT SDK - useChat HOOK
// ============================================================================

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAgentStore } from '../store/agentStore';
import { AgentClient } from '../core/AgentClient';
import { StorageService } from '../services/storageService';
// import { generateMessageId } from '../core/config';
import type { Message, ChatResponse, AgentError } from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface UseChatOptions {
  /** Initial session ID to restore */
  sessionId?: string;
  /** Persist messages to storage */
  persist?: boolean;
  /** Initial greeting message */
  greeting?: string;
  /** Called when a message is sent */
  onSend?: (message: string) => void;
  /** Called when a response is received */
  onResponse?: (response: ChatResponse) => void;
  /** Called on error */
  onError?: (error: AgentError) => void;
}

export interface UseChatReturn {
  // State
  messages: Message[];
  isTyping: boolean;
  isSending: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  inputText: string;
  error: string | null;
  sessionId: string | null;
  canSend: boolean;

  // Actions
  sendMessage: (message: string) => Promise<ChatResponse | void>;
  setInputText: (text: string) => void;
  clearInput: () => void;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  loadHistory: (sessionId: string) => Promise<void>;
  startNewSession: () => void;

  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => string;
  removeMessage: (id: string) => void;
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

/**
 * Hook for chat functionality with the Vozia Agent
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const storageRef = useRef<StorageService | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  // Chat store
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const isSending = useChatStore((s) => s.isSending);
  const isLoading = useChatStore((s) => s.isLoading);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const inputText = useChatStore((s) => s.inputText);
  const sendError = useChatStore((s) => s.sendError);

  // Chat actions
  const addMessageToStore = useChatStore((s) => s.addMessage);
  const removeMessageFromStore = useChatStore((s) => s.removeMessage);
  const setMessages = useChatStore((s) => s.setMessages);
  const clearMessagesStore = useChatStore((s) => s.clearMessages);
  const setInputTextStore = useChatStore((s) => s.setInputText);
  const clearInputStore = useChatStore((s) => s.clearInput);
  const setSending = useChatStore((s) => s.setSending);
  const setSendError = useChatStore((s) => s.setSendError);
  const setTyping = useChatStore((s) => s.setTyping);
  const startStreaming = useChatStore((s) => s.startStreaming);
  const appendStreamContent = useChatStore((s) => s.appendStreamContent);
  const finishStreaming = useChatStore((s) => s.finishStreaming);
  const cancelStreaming = useChatStore((s) => s.cancelStreaming);

  // Agent store
  const sessionId = useAgentStore((s) => s.currentSessionId);
  const setSessionId = useAgentStore((s) => s.setSessionId);
  const features = useAgentStore((s) => s.features);

  // Computed
  const canSend = inputText.trim().length > 0 && !isSending && !isStreaming;

  // Initialize storage service
  useEffect(() => {
    if (options.persist && features.persistence) {
      storageRef.current = new StorageService();
    }
  }, [options.persist, features.persistence]);

  // Load initial session if provided
  useEffect(() => {
    if (options.sessionId) {
      loadHistory(options.sessionId);
    }
  }, [options.sessionId]);

  // Add greeting message
  useEffect(() => {
    if (options.greeting && messages.length === 0) {
      addMessageToStore({
        role: 'assistant',
        content: options.greeting,
      });
    }
  }, [options.greeting, messages.length, addMessageToStore]);

  // Send a message
  const sendMessage = useCallback(
    async (message: string): Promise<ChatResponse | void> => {
      if (!message.trim()) return;

      const client = AgentClient.hasInstance() ? AgentClient.getInstance() : null;
      if (!client) {
        const error = 'Agent not initialized. Call useAgent().initialize() first.';
        setSendError(error);
        options.onError?.({ code: 'INITIALIZATION_ERROR', message: error });
        return;
      }

      // Store last message for retry
      lastUserMessageRef.current = message;

      // Clear any previous error
      setSendError(null);
      setSending(true);

      // Add user message
      const userMessageId = addMessageToStore({
        role: 'user',
        content: message,
      });

      options.onSend?.(message);

      try {
        // Start streaming
        startStreaming();

        const response = await client.chat(message, {
          sessionId: sessionId || undefined,
          stream: true,
          onToken: (token) => {
            console.log('[useChat] Received token:', token);
            appendStreamContent(token);
          },
          onThinking: (_thinkingMessage) => {
            // Could display thinking indicator here
          },
          onComplete: (chatResponse) => {
            // Update session ID if new
            if (chatResponse.sessionId && chatResponse.sessionId !== sessionId) {
              setSessionId(chatResponse.sessionId);
            }
          },
          onError: (error) => {
            cancelStreaming();
            setSendError(error.message);
            options.onError?.(error);
          },
        });

        // Finish streaming and create assistant message
        const assistantMessage = finishStreaming();

        // Update assistant message with metadata
        if (response.metadata || response.sources || response.toolsUsed) {
          useChatStore.getState().updateMessage(assistantMessage.id, {
            metadata: {
              sources: response.sources,
              toolsUsed: response.toolsUsed,
              iterations: response.metadata?.iterations,
              handoffRequested: response.metadata?.handoff,
            },
          });
        }

        // Persist to storage
        if (storageRef.current && response.sessionId) {
          const allMessages = useChatStore.getState().messages;
          await storageRef.current.saveConversation(response.sessionId, allMessages);
        }

        options.onResponse?.(response);
        return response;
      } catch (error) {
        cancelStreaming();
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to send message';
        setSendError(errorMessage);

        // Update user message status to error
        useChatStore.getState().updateMessageStatus(userMessageId, 'error');

        if (error && typeof error === 'object' && 'code' in error) {
          options.onError?.(error as AgentError);
        }
      } finally {
        setSending(false);
        setTyping(false);
      }
    },
    [
      sessionId,
      setSessionId,
      setSending,
      setSendError,
      setTyping,
      addMessageToStore,
      startStreaming,
      appendStreamContent,
      finishStreaming,
      cancelStreaming,
      options,
    ]
  );

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      // Remove the last error message if exists
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.status === 'error') {
        removeMessageFromStore(lastMessage.id);
      }

      await sendMessage(lastUserMessageRef.current);
    }
  }, [messages, removeMessageFromStore, sendMessage]);

  // Load conversation history
  const loadHistory = useCallback(
    async (loadSessionId: string) => {
      if (!storageRef.current) {
        // Try to create storage service
        storageRef.current = new StorageService();
      }

      const storedMessages = await storageRef.current.getConversation(loadSessionId);
      if (storedMessages.length > 0) {
        setMessages(storedMessages);
        setSessionId(loadSessionId);
      }
    },
    [setMessages, setSessionId]
  );

  // Start new session
  const startNewSession = useCallback(() => {
    clearMessagesStore();
    setSessionId(null);
    lastUserMessageRef.current = null;

    // Add greeting if configured
    if (options.greeting) {
      addMessageToStore({
        role: 'assistant',
        content: options.greeting,
      });
    }
  }, [clearMessagesStore, setSessionId, options.greeting, addMessageToStore]);

  // Add message helper
  const addMessage = useCallback(
    (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
      return addMessageToStore(message);
    },
    [addMessageToStore]
  );

  // Remove message helper
  const removeMessage = useCallback(
    (id: string) => {
      removeMessageFromStore(id);
    },
    [removeMessageFromStore]
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    clearMessagesStore();
    lastUserMessageRef.current = null;
  }, [clearMessagesStore]);

  return useMemo(
    () => ({
      // State
      messages,
      isTyping,
      isSending,
      isLoading,
      isStreaming,
      streamingContent,
      inputText,
      error: sendError,
      sessionId,
      canSend,

      // Actions
      sendMessage,
      setInputText: setInputTextStore,
      clearInput: clearInputStore,
      clearMessages,
      retryLastMessage,
      loadHistory,
      startNewSession,

      // Message actions
      addMessage,
      removeMessage,
    }),
    [
      messages,
      isTyping,
      isSending,
      isLoading,
      isStreaming,
      streamingContent,
      inputText,
      sendError,
      sessionId,
      canSend,
      sendMessage,
      setInputTextStore,
      clearInputStore,
      clearMessages,
      retryLastMessage,
      loadHistory,
      startNewSession,
      addMessage,
      removeMessage,
    ]
  );
}
