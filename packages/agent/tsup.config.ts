import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'voice/index': 'src/voice/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // Disabled temporarily due to type version conflicts
  splitting: false,
  sourcemap: false,
  clean: true,
  external: [
    'react',
    'react-native',
    'expo',
    'expo-av',
    'expo-haptics',
    'expo-speech',
    'react-native-reanimated',
  ],
  treeshake: true,
  minify: false,
});
