import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, useThemeMode } from '../context/ThemeContext';
import { Text } from './ui/Text';
import { IconButton } from './ui/IconButton';

interface InAppBrowserProps {
  url: string;
  onClose: () => void;
  platform?: 'youtube' | 'instagram' | 'tiktok' | 'website';
  title?: string;
}

const READER_MODE_SCRIPT = `
  // Remove unnecessary elements
  const elementsToRemove = document.querySelectorAll(
    'header, footer, nav, .ad, .advertisement, .social-share, .newsletter, .sidebar, .comments'
  );
  elementsToRemove.forEach(el => el.remove());

  // Focus on main content
  const article = document.querySelector('article, .recipe, .post, .content');
  if (article) {
    document.body.innerHTML = article.outerHTML;
  }

  // Apply clean styling
  document.body.style.maxWidth = '800px';
  document.body.style.margin = '0 auto';
  document.body.style.padding = '20px';
  document.body.style.fontSize = '16px';
  document.body.style.lineHeight = '1.6';
`;

export const InAppBrowser: React.FC<InAppBrowserProps> = ({
  url,
  onClose,
  platform = 'website',
  title,
}) => {
  const webViewRef = useRef<WebView>(null);
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [readerMode, setReaderMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      await Share.share({
        message: title ? `${title}\n${url}` : url,
        url: url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const toggleReaderMode = () => {
    if (!webViewRef.current) return;
    
    const script = readerMode
      ? 'window.location.reload();'
      : READER_MODE_SCRIPT;
    
    webViewRef.current.injectJavaScript(script);
    setReaderMode(!readerMode);
  };

  const renderPlatformBadge = () => {
    let iconName: string;
    let color: string;

    switch (platform) {
      case 'youtube':
        iconName = 'youtube';
        color = '#FF0000';
        break;
      case 'instagram':
        iconName = 'instagram';
        color = '#E4405F';
        break;
      case 'tiktok':
        iconName = 'music-note';
        color = '#000000';
        break;
      default:
        iconName = 'web';
        color = colors.text.primary;
    }

    return (
      <View style={styles.platformBadge}>
        <MaterialCommunityIcons name={iconName as any} size={16} color={color} />
        <Text variant="caption" style={{ color: colors.text.primary, marginLeft: 4 }}>
          {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <View style={styles.headerLeft}>
          <IconButton
            icon={<MaterialCommunityIcons name="close" size={24} color={colors.text.primary} />}
            onPress={onClose}
          />
          {renderPlatformBadge()}
        </View>
        <View style={styles.headerRight}>
          {platform === 'website' && (
            <IconButton
              icon={
                <MaterialCommunityIcons
                  name={readerMode ? 'book-open' : 'book-open-outline'}
                  size={24}
                  color={colors.text.primary}
                />
              }
              onPress={toggleReaderMode}
            />
          )}
          <IconButton
            icon={<MaterialCommunityIcons name="share-variant" size={24} color={colors.text.primary} />}
            onPress={handleShare}
          />
        </View>
      </View>

      <View style={styles.navigationBar}>
        <IconButton
          icon={<MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />}
          onPress={() => webViewRef.current?.goBack()}
          disabled={!canGoBack}
          style={{ opacity: canGoBack ? 1 : 0.5 }}
        />
        <IconButton
          icon={<MaterialCommunityIcons name="arrow-right" size={24} color={colors.text.primary} />}
          onPress={() => webViewRef.current?.goForward()}
          disabled={!canGoForward}
          style={{ opacity: canGoForward ? 1 : 0.5 }}
        />
        <IconButton
          icon={<MaterialCommunityIcons name="refresh" size={24} color={colors.text.primary} />}
          onPress={() => webViewRef.current?.reload()}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.status.error} />
          <Text variant="body1" style={[styles.errorText, { color: colors.status.error }]}>
            {error}
          </Text>
          <IconButton
            icon={<MaterialCommunityIcons name="refresh" size={24} color={colors.primary.default} />}
            onPress={() => webViewRef.current?.reload()}
          />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(nativeEvent.description || 'Failed to load content');
          }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.default }]}>
              <ActivityIndicator size="large" color={colors.primary.default} />
            </View>
          )}
          decelerationRate="normal"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={Platform.OS !== 'ios'}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  navigationBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 16,
  },
}); 