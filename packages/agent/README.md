# @vozia/agent

The official Vozia AI Agent SDK for Expo and React Native applications. seamlessly integrate AI-powered chat, voice assistants, and customer service widgets into your mobile apps.

## Features

- 🤖 **AI Chat Interface** - Real-time streaming chat with typing indicators and Markdown support.
- 🎙️ **Voice Assistant** - Advanced voice capabilities with push-to-talk, interruptibility, and waveform visualizations.
- 🧩 **Customer Service Widget** - A complete, drop-in customer service solution with FAQ, Ticket support, and Chat.
- 🛠️ **Custom Tools** - Register client-side tools (functions) that the AI agent can execute.
- 🎨 **Theming** - Fully customizable UI to match your brand identity.
- 🔋 **Battery Included** - Built-in offline support, persistence, and state management.

## Installation

```bash
npm install @vozia/agent
```

### Required Peer Dependencies

You need to install the following Expo packages to enable voice, haptics, and storage features:

```bash
npx expo install expo-av expo-haptics expo-speech @react-native-async-storage/async-storage
```

## Quick Start

### 1. Basic Setup

Wrap your application (or the part where you need the agent) with `AgentProvider`.

```tsx
import { AgentProvider } from '@vozia/agent';

export default function App() {
  return (
    <AgentProvider
      config={{
        agentId: 'your-agent-id',
        apiKey: 'your-api-key',
        baseUrl: 'https://vsa.renbostudios.com', // Optional
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

### 2. Add a Chat Interface

Deeply integrate chat into your existing screens:

```tsx
import { AgentChat } from '@vozia/agent';

function ChatScreen() {
  return (
    <AgentChat
      showHeader={true}
      headerTitle="Support Agent"
      initialMessage="Hello! How can I help you today?"
    />
  );
}
```

### 3. Voice Assistant

Add voice capabilities with the `VoiceAssistantScreen` or build your own with `useVoice`.

```tsx
import { VoiceAssistantScreen } from '@vozia/agent';

function VoiceScreen() {
  return (
    <VoiceAssistantScreen
      mode="full-screen"
      visualizerType="waveform"
    />
  );
}
```

## Customer Service Widget

For a quick "drop-in" solution that includes Chat, FAQs, and Ticket management, use the `CustomerServiceProvider`.

```tsx
import { CustomerServiceProvider, CustomerServiceButton } from '@vozia/agent';

// Define your configuration
const csConfig = {
  companyName: 'My App',
  welcomeMessage: 'Hi! How can we help?',
  enableChat: true,
  enableFAQ: true,
  faqs: [
    { id: '1', question: 'How do I reset my password?', answer: 'Go to settings...' }
  ],
  theme: {
    primaryColor: '#03B19D',
  }
};

export default function Root() {
  return (
    <CustomerServiceProvider
      config={csConfig}
      showButton={true} // Shows a distinct floating button
      buttonPosition="bottom-right"
    >
      <AppContent />
    </CustomerServiceProvider>
  );
}
```

## Hooks API

For complete control over the UI, use the provided hooks.

### `useChat`

Manage chat state, messages, and streaming.

```tsx
const { 
  messages, 
  sendMessage, 
  isTyping, 
  isSending 
} = useChat();
```

### `useVoice`

Handle recording, playback, and transcription events.

```tsx
const { 
  isRecording, 
  startRecording, 
  stopRecording, 
  transcription 
} = useVoice();
```

### `useTools`

Register client-side functions that the Agent can call.

```tsx
const { registerTool } = useTools();

useEffect(() => {
  registerTool({
    name: 'get_user_info',
    description: 'Get the current user name and stats',
    parameters: { type: 'object', properties: {} },
    handler: async () => {
      return { name: 'John Doe', level: 5 };
    }
  });
}, []);
```

### `useCustomerService`

Programmatically control the Customer Service widget.

```tsx
const { open, close, navigate } = useCustomerService();

// Open specific screens
open('chat'); 
open('faq');
```

## Theming

You can customize the look and feel by passing a `theme` object to `AgentProvider` or `CustomerServiceProvider`.

```tsx
const myTheme = {
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  backgroundColor: '#FFFFFF',
  textColor: '#111827',
  userBubbleColor: '#6366F1',
  agentBubbleColor: '#F3F4F6',
  borderRadius: 12,
  fontFamily: 'System',
};
```

## License

MIT
