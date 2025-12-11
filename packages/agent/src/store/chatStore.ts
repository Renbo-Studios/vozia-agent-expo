// ============================================================================
// VOZIA AGENT SDK - CHAT STORE (ZUSTAND)
// ============================================================================

import { create } from 'zustand';
import type { Message, MessageStatus } from '../types';
import { generateMessageId } from '../core/config';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface ChatState {
  // Messages
  messages: Message[];

  // Status
  isTyping: boolean;
  isSending: boolean;
  isLoading: boolean;

  // Streaming
  streamingContent: string;
  isStreaming: boolean;

  // Input
  inputText: string;

  // Errors
  sendError: string | null;
}

export interface ChatActions {
  // Messages
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'> & { id?: string }) => string;
  updateMessage: (id: string, update: Partial<Message>) => void;
  updateMessageStatus: (id: string, status: MessageStatus) => void;
  removeMessage: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;

  // Typing
  setTyping: (isTyping: boolean) => void;

  // Sending
  setSending: (isSending: boolean) => void;
  setSendError: (error: string | null) => void;

  // Loading
  setLoading: (isLoading: boolean) => void;

  // Streaming
  startStreaming: () => void;
  appendStreamContent: (content: string) => void;
  finishStreaming: () => Message;
  cancelStreaming: () => void;

  // Input
  setInputText: (text: string) => void;
  clearInput: () => void;

  // Reset
  reset: () => void;
}

export type ChatStore = ChatState & ChatActions;

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  isSending: false,
  isLoading: false,
  streamingContent: '',
  isStreaming: false,
  inputText: '',
  sendError: null,
};

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  // Messages
  addMessage: (messageData) => {
    const id = messageData.id || generateMessageId();
    const message: Message = {
      id,
      role: messageData.role,
      content: messageData.content,
      timestamp: new Date(),
      status: 'sent',
      metadata: messageData.metadata,
      attachments: messageData.attachments,
    };

    set((state) => ({
      messages: [...state.messages, message],
    }));

    return id;
  },

  updateMessage: (id, update) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...update } : msg
      ),
    }));
  },

  updateMessageStatus: (id, status) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, status } : msg
      ),
    }));
  },

  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },

  setMessages: (messages) => {
    set({ messages });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  // Typing
  setTyping: (isTyping) => {
    set({ isTyping });
  },

  // Sending
  setSending: (isSending) => {
    set({ isSending });
  },

  setSendError: (error) => {
    set({ sendError: error });
  },

  // Loading
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // Streaming
  startStreaming: () => {
    set({
      isStreaming: true,
      streamingContent: '',
      isTyping: true,
    });
  },

  appendStreamContent: (content) => {
    set((state) => ({
      streamingContent: state.streamingContent + content,
    }));
  },

  finishStreaming: () => {
    const { streamingContent } = get();

    const message: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: streamingContent,
      timestamp: new Date(),
      status: 'delivered',
    };

    set((state) => ({
      messages: [...state.messages, message],
      isStreaming: false,
      streamingContent: '',
      isTyping: false,
    }));

    return message;
  },

  cancelStreaming: () => {
    set({
      isStreaming: false,
      streamingContent: '',
      isTyping: false,
    });
  },

  // Input
  setInputText: (text) => {
    set({ inputText: text });
  },

  clearInput: () => {
    set({ inputText: '' });
  },

  // Reset
  reset: () => {
    set(initialState);
  },
}));

// ----------------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------------

export const selectMessages = (state: ChatStore) => state.messages;
export const selectIsTyping = (state: ChatStore) => state.isTyping;
export const selectIsSending = (state: ChatStore) => state.isSending;
export const selectIsLoading = (state: ChatStore) => state.isLoading;
export const selectStreamingContent = (state: ChatStore) => state.streamingContent;
export const selectIsStreaming = (state: ChatStore) => state.isStreaming;
export const selectInputText = (state: ChatStore) => state.inputText;
export const selectSendError = (state: ChatStore) => state.sendError;

// Compound selectors
export const selectLastMessage = (state: ChatStore) =>
  state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;

export const selectMessageCount = (state: ChatStore) => state.messages.length;

export const selectCanSend = (state: ChatStore) =>
  state.inputText.trim().length > 0 && !state.isSending && !state.isStreaming;

export const selectDisplayContent = (state: ChatStore) =>
  state.isStreaming ? state.streamingContent : null;
