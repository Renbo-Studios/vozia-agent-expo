// ============================================================================
// VOZIA AGENT SDK - useTools HOOK
// ============================================================================

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useToolsStore } from '../store/toolsStore';
import { useAgentStore } from '../store/agentStore';
import { AgentClient } from '../core/AgentClient';
import type { ToolDefinition, ToolCall, ToolResult, AgentError } from '../types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface UseToolsOptions {
  /** Tools to register on mount */
  tools?: ToolDefinition[];
  /** Called when a tool is executed */
  onToolCall?: (call: ToolCall) => void;
  /** Called when a tool completes */
  onToolResult?: (result: ToolResult) => void;
  /** Called on tool error */
  onToolError?: (error: AgentError, call: ToolCall) => void;
}

export interface UseToolsReturn {
  // State
  tools: ToolDefinition[];
  toolNames: string[];
  activeCalls: ToolCall[];
  callHistory: ToolResult[];
  isExecuting: boolean;
  currentCall: ToolCall | null;

  // Actions
  registerTool: (tool: ToolDefinition) => void;
  registerTools: (tools: ToolDefinition[]) => void;
  unregisterTool: (name: string) => void;
  clearTools: () => void;

  // Queries
  hasTool: (name: string) => boolean;
  getTool: (name: string) => ToolDefinition | undefined;

  // Execution
  executeTool: (call: ToolCall) => Promise<ToolResult>;

  // History
  clearHistory: () => void;
  getRecentResults: (count: number) => ToolResult[];
}

// ----------------------------------------------------------------------------
// Built-in Tools
// ----------------------------------------------------------------------------

/**
 * Get current time tool
 */
const getCurrentTimeTool: ToolDefinition = {
  name: 'get_current_time',
  description: 'Get the current date and time',
  parameters: {
    type: 'object',
    properties: {
      timezone: {
        type: 'string',
        description: 'Timezone (e.g., "America/New_York")',
      },
    },
  },
  handler: async (params) => {
    const timezone = (params.timezone as string) || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      formatted: now.toLocaleString('en-US', { timeZone: timezone }),
      timezone,
    };
  },
};

/**
 * Get device info tool
 */
const getDeviceInfoTool: ToolDefinition = {
  name: 'get_device_info',
  description: 'Get information about the user\'s device',
  parameters: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    // This will be enhanced when running in React Native
    const info: Record<string, unknown> = {
      platform: 'unknown',
    };

    // Try to get more info from expo-device if available
    try {
      const Device = await import('expo-device');
      info.brand = Device.brand;
      info.manufacturer = Device.manufacturer;
      info.modelName = Device.modelName;
      info.osName = Device.osName;
      info.osVersion = Device.osVersion;
      info.platform = Device.osName?.toLowerCase() || 'unknown';
    } catch {
      // expo-device not available
    }

    return info;
  },
};

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

/**
 * Hook for managing and executing tools with the Vozia Agent
 */
export function useTools(options: UseToolsOptions = {}): UseToolsReturn {
  const initializedRef = useRef(false);

  // Tools store state
  const toolsMap = useToolsStore((s) => s.tools);
  const activeCalls = useToolsStore((s) => s.activeCalls);
  const callHistory = useToolsStore((s) => s.callHistory);
  const isExecuting = useToolsStore((s) => s.isExecuting);
  const currentCall = useToolsStore((s) => s.currentCall);

  // Tools store actions
  const registerToolStore = useToolsStore((s) => s.registerTool);
  const unregisterToolStore = useToolsStore((s) => s.unregisterTool);
  const clearToolsStore = useToolsStore((s) => s.clearTools);
  const startExecution = useToolsStore((s) => s.startExecution);
  const completeExecution = useToolsStore((s) => s.completeExecution);
  const clearHistoryStore = useToolsStore((s) => s.clearHistory);

  // Agent store
  const features = useAgentStore((s) => s.features);

  // Computed values
  const tools = useMemo(() => Array.from(toolsMap.values()), [toolsMap]);
  const toolNames = useMemo(() => Array.from(toolsMap.keys()), [toolsMap]);

  // Register a single tool
  const registerTool = useCallback(
    (tool: ToolDefinition) => {
      if (!features.tools) {
        console.warn('[useTools] Tools feature is disabled');
        return;
      }

      registerToolStore(tool);

      // Also register with the AgentClient if available
      if (AgentClient.hasInstance()) {
        AgentClient.getInstance().registerTool(tool);
      }
    },
    [features.tools, registerToolStore]
  );

  // Register multiple tools
  const registerTools = useCallback(
    (toolsToRegister: ToolDefinition[]) => {
      toolsToRegister.forEach(registerTool);
    },
    [registerTool]
  );

  // Unregister a tool
  const unregisterTool = useCallback(
    (name: string) => {
      unregisterToolStore(name);

      // Also unregister from AgentClient if available
      if (AgentClient.hasInstance()) {
        AgentClient.getInstance().unregisterTool(name);
      }
    },
    [unregisterToolStore]
  );

  // Clear all tools
  const clearTools = useCallback(() => {
    clearToolsStore();
  }, [clearToolsStore]);

  // Check if tool exists
  const hasTool = useCallback(
    (name: string) => toolsMap.has(name),
    [toolsMap]
  );

  // Get tool by name
  const getTool = useCallback(
    (name: string) => toolsMap.get(name),
    [toolsMap]
  );

  // Execute a tool
  const executeTool = useCallback(
    async (call: ToolCall): Promise<ToolResult> => {
      const tool = toolsMap.get(call.name);
      const startTime = Date.now();

      if (!tool) {
        const result: ToolResult = {
          callId: call.id,
          name: call.name,
          result: null,
          error: `Tool "${call.name}" not found`,
          duration: 0,
        };
        options.onToolError?.(
          { code: 'TOOL_ERROR', message: result.error! },
          call
        );
        return result;
      }

      startExecution(call);
      options.onToolCall?.(call);

      try {
        const result = await tool.handler(call.arguments);
        const duration = Date.now() - startTime;

        const toolResult: ToolResult = {
          callId: call.id,
          name: call.name,
          result,
          duration,
        };

        completeExecution(toolResult);
        options.onToolResult?.(toolResult);

        return toolResult;
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';

        const toolResult: ToolResult = {
          callId: call.id,
          name: call.name,
          result: null,
          error: errorMessage,
          duration,
        };

        completeExecution(toolResult);
        options.onToolError?.(
          { code: 'TOOL_ERROR', message: errorMessage },
          call
        );

        return toolResult;
      }
    },
    [toolsMap, startExecution, completeExecution, options]
  );

  // Clear history
  const clearHistory = useCallback(() => {
    clearHistoryStore();
  }, [clearHistoryStore]);

  // Get recent results
  const getRecentResults = useCallback(
    (count: number) => callHistory.slice(-count),
    [callHistory]
  );

  // Register initial tools and built-in tools on mount
  useEffect(() => {
    if (initializedRef.current || !features.tools) return;
    initializedRef.current = true;

    // Register built-in tools
    registerTool(getCurrentTimeTool);
    registerTool(getDeviceInfoTool);

    // Register user-provided tools
    if (options.tools) {
      registerTools(options.tools);
    }
  }, [features.tools, options.tools, registerTool, registerTools]);

  // Listen to tool call events from the agent
  useEffect(() => {
    if (!AgentClient.hasInstance()) return;

    const client = AgentClient.getInstance();
    const unsubscribe = client.on('tool_call', async (event) => {
      await executeTool(event.tool);
    });

    return unsubscribe;
  }, [executeTool]);

  return useMemo(
    () => ({
      // State
      tools,
      toolNames,
      activeCalls,
      callHistory,
      isExecuting,
      currentCall,

      // Actions
      registerTool,
      registerTools,
      unregisterTool,
      clearTools,

      // Queries
      hasTool,
      getTool,

      // Execution
      executeTool,

      // History
      clearHistory,
      getRecentResults,
    }),
    [
      tools,
      toolNames,
      activeCalls,
      callHistory,
      isExecuting,
      currentCall,
      registerTool,
      registerTools,
      unregisterTool,
      clearTools,
      hasTool,
      getTool,
      executeTool,
      clearHistory,
      getRecentResults,
    ]
  );
}

// ----------------------------------------------------------------------------
// Exports
// ----------------------------------------------------------------------------

export { getCurrentTimeTool, getDeviceInfoTool };
