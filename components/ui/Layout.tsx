import React from 'react';
import { View, StyleSheet, useWindowDimensions, ViewStyle, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  sidebar?: React.ReactNode;
  stickyHeader?: React.ReactNode;
  stickyFooter?: React.ReactNode;
}

export function Layout({
  children,
  style,
  contentContainerStyle,
  sidebar,
  stickyHeader,
  stickyFooter,
}: LayoutProps) {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  if (isDesktop) {
    return (
      <View style={[styles.container, style]}>
        {stickyHeader && (
          <View style={[styles.header, { backgroundColor: theme.colors.background.default }]}>
            {stickyHeader}
          </View>
        )}
        <View style={styles.desktopContent}>
          {sidebar && <View style={styles.sidebar}>{sidebar}</View>}
          <ScrollView
            style={styles.mainContent}
            contentContainerStyle={[
              styles.mainContentContainer,
              { maxWidth: 1200, padding: theme.layout.spacing.lg },
              contentContainerStyle,
            ]}
          >
            {children}
          </ScrollView>
        </View>
        {stickyFooter && (
          <View style={[styles.footer, { backgroundColor: theme.colors.background.default }]}>
            {stickyFooter}
          </View>
        )}
      </View>
    );
  }

  if (isTablet) {
    return (
      <View style={[styles.container, style]}>
        {stickyHeader && (
          <View style={[styles.header, { backgroundColor: theme.colors.background.default }]}>
            {stickyHeader}
          </View>
        )}
        <View style={styles.tabletContent}>
          <ScrollView
            style={styles.mainContent}
            contentContainerStyle={[
              styles.mainContentContainer,
              { padding: theme.layout.spacing.md },
              contentContainerStyle,
            ]}
          >
            {children}
          </ScrollView>
          {sidebar && (
            <View style={[styles.tabletSidebar, { backgroundColor: theme.colors.background.cream }]}>
              {sidebar}
            </View>
          )}
        </View>
        {stickyFooter && (
          <View style={[styles.footer, { backgroundColor: theme.colors.background.default }]}>
            {stickyFooter}
          </View>
        )}
      </View>
    );
  }

  // Mobile layout
  return (
    <View style={[styles.container, style]}>
      {stickyHeader && (
        <View style={[styles.header, { backgroundColor: theme.colors.background.default }]}>
          {stickyHeader}
        </View>
      )}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={[
          styles.mainContentContainer,
          { padding: theme.layout.spacing.md },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
      {stickyFooter && (
        <View style={[styles.footer, { backgroundColor: theme.colors.background.default }]}>
          {stickyFooter}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  footer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  desktopContent: {
    flex: 1,
    flexDirection: 'row',
  },
  tabletContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabletSidebar: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0, 0, 0, 0.1)',
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
}); 