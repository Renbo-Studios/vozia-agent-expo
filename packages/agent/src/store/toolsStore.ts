// ============================================================================
// VOZIA AGENT SDK - TOOLS STORE (ZUSTAND)
// ============================================================================

import { create } from 'zustand';
import type { ToolDefinition, ToolCall, ToolResult } from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface ToolsState {
  // Registered tools
  tools: Map<string, ToolDefinition>;

  // Active tool calls
  activeCalls: ToolCall[];

  // History
  callHistory: ToolResult[];

  // Status
  isExecuting: boolean;
  currentCall: ToolCall | null;
}

export interface ToolsActions {
  // Tool registration
  registerTool: (tool: ToolDefinition) => void;
  unregisterTool: (name: string) => void;
  clearTools: () => void;

  // Tool execution
  startExecution: (call: ToolCall) => void;
  completeExecution: (result: ToolResult) => void;
  failExecution: (callId: string, error: string) => void;

  // History
  clearHistory: () => void;

  // Reset
  reset: () => void;
}

export type ToolsStore = ToolsState & ToolsActions;

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const initialState: ToolsState = {
  tools: new Map(),
  activeCalls: [],
  callHistory: [],
  isExecuting: false,
  currentCall: null,
};

// Maximum history entries to keep
const MAX_HISTORY = 100;

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useToolsStore = create<ToolsStore>((set, get) => ({
  ...initialState,

  // Tool registration
  registerTool: (tool) => {
    set((state) => {
      const tools = new Map(state.tools);
      tools.set(tool.name, tool);
      return { tools };
    });
  },

  unregisterTool: (name) => {
    set((state) => {
      const tools = new Map(state.tools);
      tools.delete(name);
      return { tools };
    });
  },

  clearTools: () => {
    set({ tools: new Map() });
  },

  // Tool execution
  startExecution: (call) => {
    set((state) => ({
      activeCalls: [...state.activeCalls, call],
      isExecuting: true,
      currentCall: call,
    }));
  },

  completeExecution: (result) => {
    set((state) => {
      // Remove from active calls
      const activeCalls = state.activeCalls.filter(
        (call) => call.id !== result.callId
      );

      // Add to history (keep only last MAX_HISTORY)
      const callHistory = [...state.callHistory, result].slice(-MAX_HISTORY);

      return {
        activeCalls,
        callHistory,
        isExecuting: activeCalls.length > 0,
        currentCall: activeCalls.length > 0 ? activeCalls[0] : null,
      };
    });
  },

  failExecution: (callId, error) => {
    const { activeCalls } = get();
    const call = activeCalls.find((c) => c.id === callId);

    if (call) {
      const result: ToolResult = {
        callId,
        name: call.name,
        result: null,
        error,
        duration: Date.now() - call.timestamp.getTime(),
      };

      get().completeExecution(result);
    }
  },

  // History
  clearHistory: () => {
    set({ callHistory: [] });
  },

  // Reset
  reset: () => {
    set({
      ...initialState,
      tools: new Map(), // Create new Map instance
    });
  },
}));

// ----------------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------------

export const selectTools = (state: ToolsStore) => state.tools;
export const selectToolsArray = (state: ToolsStore) =>
  Array.from(state.tools.values());
export const selectActiveCalls = (state: ToolsStore) => state.activeCalls;
export const selectCallHistory = (state: ToolsStore) => state.callHistory;
export const selectIsExecuting = (state: ToolsStore) => state.isExecuting;
export const selectCurrentCall = (state: ToolsStore) => state.currentCall;

// Get specific tool
export const selectTool = (name: string) => (state: ToolsStore) =>
  state.tools.get(name);

// Get tool names
export const selectToolNames = (state: ToolsStore) =>
  Array.from(state.tools.keys());

// Get recent results
export const selectRecentResults = (count: number) => (state: ToolsStore) =>
  state.callHistory.slice(-count);

// Check if tool is registered
export const selectHasTool = (name: string) => (state: ToolsStore) =>
  state.tools.has(name);
