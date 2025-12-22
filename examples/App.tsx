// ============================================================================
// VOZIA AGENT SDK - EXAMPLE APP
// Examples Hub with SDK Demonstrations
// ============================================================================

import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AgentProvider,
  CustomerServiceProvider,
  useCustomerService,
} from '@vozia/agent';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import { ExamplesHome, ExampleScreen } from './screens/ExamplesHome';
import { VoiceSDKExample } from './screens/VoiceSDKExample';
import { ChatSDKExample } from './screens/ChatSDKExample';

// ============================================================================
// THEME & CONSTANTS
// ============================================================================

const THEME = {
  primary: '#03B19D',
  secondary: '#00473F',
  background: '#0A0A0A',
  surface: '#141414',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: 'rgba(255,255,255,0.1)',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

// Sample Products for E-commerce demo
const PRODUCTS = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
    rating: 4.8,
    reviews: 2341,
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop',
    description: 'Advanced fitness tracking with GPS, heart rate monitor, and sleep analysis.',
    rating: 4.6,
    reviews: 1892,
  },
  {
    id: '3',
    name: 'Portable Speaker',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
    description: 'Waterproof Bluetooth speaker with 360-degree sound and 12-hour playback.',
    rating: 4.5,
    reviews: 3102,
  },
  {
    id: '4',
    name: 'Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
    description: 'Ergonomic aluminum laptop stand with adjustable height and cable management.',
    rating: 4.7,
    reviews: 856,
  },
];

// Local type definition
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

// Sample FAQs
const SAMPLE_FAQS: FAQItem[] = [
  {
    id: '1',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day hassle-free return policy. Items must be in original condition with all packaging.',
    category: 'Returns',
  },
  {
    id: '2',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout.',
    category: 'Shipping',
  },
  {
    id: '3',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 100 countries worldwide. International shipping typically takes 10-14 business days.',
    category: 'Shipping',
  },
];

// Customer Service Configuration
const customerServiceConfig = {
  companyName: 'TechShop',
  welcomeMessage: 'Hi there! How can we help you today?',
  enableChat: true,
  enableFAQ: true,
  enableTickets: true,
  enablePhoneCall: true,
  enableVoiceChat: false,
  phoneNumber: '+1-800-TECHSHOP',
  supportEmail: 'support@techshop.com',
  faqs: SAMPLE_FAQS,
  theme: {
    primaryColor: THEME.primary,
    borderRadius: 16,
  },
  labels: {
    headerTitle: 'TechShop Support',
    headerSubtitle: "We're here to help",
  },
  onTicketSubmit: async (ticket: any) => {
    console.log('Ticket submitted:', ticket);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  },
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  return (
    <SafeAreaProvider>
      <AgentProvider
        config={{
          apiKey: process.env.EXPO_PUBLIC_API_KEY as string,
          baseUrl: process.env.EXPO_PUBLIC_BASE_URL as string,
          agentId: process.env.EXPO_PUBLIC_AGENT_ID as string,
        }}
        features={{
          voice: true,
          tools: true,
          fileUpload: true,
          support: true,
        }}
        debug={true}
        theme={{
          primaryColor: THEME.primary,
        }}
        isDark={true}
        onReady={() => console.log('[App] Agent ready')}
        onError={(error: any) => console.error('[App] Agent error:', error)}
      >
        <AppNavigator />
      </AgentProvider>
    </SafeAreaProvider>
  );
}

// ============================================================================
// APP NAVIGATOR
// ============================================================================

function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<ExampleScreen>('home');

  const handleNavigate = useCallback((screen: ExampleScreen) => {
    setCurrentScreen(screen);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  // Render based on current screen
  switch (currentScreen) {
    case 'voice-sdk':
      return <VoiceSDKExample onBack={handleBack} />;

    case 'chat-sdk':
      return <ChatSDKExample onBack={handleBack} />;

    case 'customer-service':
      return (
        <CustomerServiceProvider
          config={customerServiceConfig}
          showButton={true}
          buttonPosition="bottom-right"
          buttonSize={56}
        >
          <CustomerServiceDemo onBack={handleBack} />
        </CustomerServiceProvider>
      );

    case 'ecommerce-demo':
      return (
        <CustomerServiceProvider
          config={customerServiceConfig}
          showButton={true}
          buttonPosition="bottom-right"
          buttonSize={56}
        >
          <EcommerceDemo onBack={handleBack} />
        </CustomerServiceProvider>
      );

    default:
      return <ExamplesHome onNavigate={handleNavigate} />;
  }
}

// ============================================================================
// CUSTOMER SERVICE DEMO
// ============================================================================

interface CustomerServiceDemoProps {
  onBack: () => void;
}

function CustomerServiceDemo({ onBack }: CustomerServiceDemoProps) {
  const insets = useSafeAreaInsets();
  const { open } = useCustomerService();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Customer Service</Text>
          <Text style={styles.headerSubtext}>SDK Example</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.demoCard}>
          <Ionicons name="headset-outline" size={48} color={THEME.primary} />
          <Text style={styles.demoTitle}>Customer Service Widget</Text>
          <Text style={styles.demoDescription}>
            Tap the floating button in the bottom right corner to open the customer service widget.
            You can also trigger it programmatically.
          </Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => open('home')}
            >
              <Ionicons name="apps-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Open Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => open('chat')}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Open Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => open('faq')}
            >
              <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Open FAQ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// E-COMMERCE DEMO
// ============================================================================

interface EcommerceDemoProps {
  onBack: () => void;
}

function EcommerceDemo({ onBack }: EcommerceDemoProps) {
  const insets = useSafeAreaInsets();
  const [cartCount, setCartCount] = useState(0);
  const { open } = useCustomerService();

  const handleAddToCart = useCallback((product: typeof PRODUCTS[0]) => {
    setCartCount((prev) => prev + 1);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.ecomHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>TechShop</Text>
          <Text style={styles.tagline}>Premium Electronics</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => open('home')}>
            <Ionicons name="help-circle-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="cart-outline" size={24} color={THEME.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Holiday Sale</Text>
        <Text style={styles.heroSubtitle}>Up to 40% off on selected items</Text>
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.ecomScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <View style={styles.productsGrid}>
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpDescription}>
            Our support team is available 24/7 to assist you.
          </Text>
          <TouchableOpacity style={styles.helpButton} onPress={() => open('home')}>
            <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
            <Text style={styles.helpButtonText}>Get Support</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// PRODUCT CARD
// ============================================================================

interface ProductCardProps {
  product: typeof PRODUCTS[0];
  onAddToCart: () => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.productRating}>
          <Ionicons name="star" size={14} color={THEME.warning} />
          <Text style={styles.ratingText}>
            {product.rating} ({product.reviews.toLocaleString()})
          </Text>
        </View>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  headerSubtext: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Demo card
  demoCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  demoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 20,
    marginBottom: 12,
  },
  demoDescription: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  demoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // E-commerce styles
  ecomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerLeft: {
    flex: 1,
    marginLeft: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  heroBanner: {
    backgroundColor: THEME.primary,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  ecomScrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 16,
    marginTop: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: THEME.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: THEME.background,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  helpSection: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
