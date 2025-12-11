# @vozia/agent

The official Vozia AI Agent SDK for Expo and React Native applications.

## Installation

```bash
npm install @vozia/agent
```

### Required Peer Dependencies

```bash
expo install expo-av expo-haptics expo-speech @react-native-async-storage/async-storage
```

## Quick Start

```tsx
import { AgentProvider, AgentChat, AssistantButton } from '@vozia/agent';

export default function App() {
  return (
    <AgentProvider
      config={{
        orgId: 'your-org-id',
        assistantId: 'your-assistant-id',
        apiKey: 'your-api-key',
      }}
    >
      <AgentChat />
      <AssistantButton />
    </AgentProvider>
  );
}
```

## Documentation

See the [main README](../../README.md) for complete documentation.

## License

MIT
