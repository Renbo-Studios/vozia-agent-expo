# Vozia Agent SDK for Expo/React Native

A comprehensive, production-ready SDK for integrating Vozia AI agents into Expo and React Native applications. Features real-time chat, voice interactions, custom tools, and fully customizable UI components.

## Features

- **Chat Interface** - Real-time streaming chat with typing indicators
- **Voice Assistant** - Push-to-talk and tap-to-toggle voice input
- **Custom Tools** - Register client-side tools for enhanced interactions
- **Theming** - Full customization of colors, fonts, and styling
- **Persistence** - Conversation history with offline support
- **Support System** - Built-in ticket submission and tracking
- **TypeScript** - Complete type definitions

## Installation

```bash
# Using npm
npm install @vozia/agent

# Using yarn
yarn add @vozia/agent

# Using pnpm
pnpm add @vozia/agent
```

### Peer Dependencies

```bash
expo install expo-av expo-haptics expo-speech @react-native-async-storage/async-storage
```

## Quick Start

### 1. Wrap your app with AgentProvider

```tsx
import { AgentProvider } from '@vozia/agent';

export default function App() {
  return (
    <AgentProvider
      config={{
        orgId: 'your-org-id',
        assistantId: 'your-assistant-id',
        apiKey: 'your-api-key',
      }}
      features={{
        voice: true,
        tools: true,
      }}
    >
      <YourApp />
    </AgentProvider>
  );
}
```

### 2. Add a Chat Component

```tsx
import { AgentChat } from '@vozia/agent';

function ChatScreen() {
  return (
    <AgentChat
      showHeader={true}
      headerTitle="Assistant"
      initialMessage="Hello! How can I help you?"
      enableVoice={true}
    />
  );
}
```

### 3. Or Use the Floating Button

```tsx
import { AssistantButton } from '@vozia/agent';

function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your content */}
      <AssistantButton position="bottom-right" />
    </View>
  );
}
```

## Components

### Chat Components

| Component | Description |
|-----------|-------------|
| `AgentChat` | Full-screen chat interface |
| `AgentChatBubble` | Chat as a floating bubble/card |
| `MessageList` | Scrollable message list |
| `MessageComposer` | Input with send button |
| `MessageBubble` | Individual message bubble |
| `TypingIndicator` | Animated typing dots |

### Voice Components

| Component | Description |
|-----------|-------------|
| `VoiceAssistantScreen` | Full-screen voice interface |
| `PushToTalkButton` | Hold/tap to record button |
| `WaveformVisualizer` | Audio level visualization |
| `MicVisualizer` | Microphone with pulse effect |

### Common Components

| Component | Description |
|-----------|-------------|
| `AssistantButton` | Floating action button with modal |
| `AssistantFAB` | FAB with bottom sheet |
| `SupportScreen` | Help and ticket interface |

## Hooks

### useAgent

Main hook for SDK initialization and configuration.

```tsx
import { useAgent } from '@vozia/agent';

function MyComponent() {
  const {
    isConnected,
    isReady,
    error,
    theme,
    connect,
    disconnect,
    updateTheme,
    toggleDarkMode,
  } = useAgent();

  return <View>...</View>;
}
```

### useChat

Hook for chat functionality.

```tsx
import { useChat } from '@vozia/agent';

function CustomChat() {
  const {
    messages,
    isTyping,
    isSending,
    streamingContent,
    sendMessage,
    clearMessages,
  } = useChat({
    greeting: 'Hello!',
    persist: true,
  });

  const handleSend = async () => {
    await sendMessage('Hello, agent!');
  };

  return <View>...</View>;
}
```

### useVoice

Hook for voice functionality.

```tsx
import { useVoice } from '@vozia/agent';

function VoiceInput() {
  const {
    isRecording,
    isPlaying,
    audioLevels,
    transcription,
    startRecording,
    stopRecording,
  } = useVoice({
    config: { pushToTalk: true },
  });

  return (
    <TouchableOpacity
      onPressIn={startRecording}
      onPressOut={stopRecording}
    >
      <Text>{isRecording ? 'Recording...' : 'Hold to speak'}</Text>
    </TouchableOpacity>
  );
}
```

### useTools

Hook for registering and managing tools.

```tsx
import { useTools } from '@vozia/agent';

function ToolsExample() {
  const { registerTool, tools } = useTools();

  useEffect(() => {
    registerTool({
      name: 'get_weather',
      description: 'Get current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City name' },
        },
        required: ['location'],
      },
      handler: async ({ location }) => {
        const weather = await fetchWeather(location);
        return weather;
      },
    });
  }, []);

  return <View>...</View>;
}
```

## Theming

Customize the appearance with the theme prop:

```tsx
<AgentProvider
  config={config}
  theme={{
    // Colors
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F9FAFB',
    textColor: '#111827',
    errorColor: '#EF4444',

    // Chat bubbles
    userBubbleColor: '#6366F1',
    userBubbleTextColor: '#FFFFFF',
    agentBubbleColor: '#F3F4F6',
    agentBubbleTextColor: '#111827',
    bubbleRadius: 16,

    // Typography
    fontFamily: 'System',
    fontSizeMedium: 14,

    // Components
    buttonRadius: 12,
    inputRadius: 12,
  }}
  isDark={false}
>
```

## Configuration

### AgentConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `orgId` | string | Yes | Organization ID |
| `assistantId` | string | Yes | Assistant/Agent ID |
| `apiKey` | string | Yes | API key |
| `baseUrl` | string | No | Custom API URL |
| `userId` | string | No | End user ID |
| `userMetadata` | object | No | Additional user data |
| `jwt` | string | No | JWT for auth |

### AgentFeatures

| Feature | Default | Description |
|---------|---------|-------------|
| `voice` | true | Enable voice input/output |
| `tools` | true | Enable custom tools |
| `fileUpload` | false | Enable file uploads |
| `support` | true | Enable support features |
| `haptics` | true | Enable haptic feedback |
| `persistence` | true | Enable conversation persistence |
| `offlineMode` | true | Enable offline message queue |

## Advanced Usage

### Custom Storage Adapter

```tsx
import { StorageService } from '@vozia/agent';

const customAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
  getAllKeys: async () => Object.keys(localStorage),
  clear: async () => localStorage.clear(),
};

const storage = new StorageService({ adapter: customAdapter });
```

### Direct Client Access

```tsx
import { AgentClient, getAgent } from '@vozia/agent';

// Get the singleton instance
const client = getAgent();

// Or create a new instance
const client = new AgentClient({
  orgId: '...',
  assistantId: '...',
  apiKey: '...',
});

// Send a message
const response = await client.chat('Hello!', {
  stream: true,
  onToken: (token) => console.log(token),
});
```

### Event Handling

```tsx
const { on } = useAgent();

useEffect(() => {
  const unsubscribe = on('message', (event) => {
    console.log('New message:', event.message);
  });

  return unsubscribe;
}, []);
```

## Examples

Check the `/examples` folder for complete examples:

- `expo-basic` - Basic chat and voice example
- `expo-voice` - Voice-focused example
- `expo-support` - Support and ticketing example

## API Reference

For complete API documentation, see the [docs](/docs) folder.

## License

MIT License - see [LICENSE](LICENSE) for details.
