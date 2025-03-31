import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
  FlatList,
  FlatListProps,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  onRightIconPress?: () => void;
  disabled?: boolean;
}

export interface ListProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'data'> {
  items: T[];
  renderItem?: (item: T, index: number) => React.ReactElement | null;
  loading?: boolean;
  onRefresh?: () => void;
  emptyText?: string;
  headerText?: string;
  footerText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  showSeparator?: boolean;
  showChevron?: boolean;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  onRightIconPress,
  disabled,
}: ListItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.item,
        {
          paddingVertical: theme.layout.spacing.sm,
          paddingHorizontal: theme.layout.spacing.md,
          backgroundColor: theme.colors.background.default,
        },
        pressed && !disabled && {
          backgroundColor: theme.colors.background.sage,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      {leftIcon && (
        <MaterialCommunityIcons
          name={leftIcon}
          size={24}
          color={theme.colors.text.secondary}
          style={[
            styles.leftIcon,
            { marginRight: theme.layout.spacing.sm }
          ]}
        />
      )}
      
      <View style={[
        styles.itemContent,
        { marginHorizontal: theme.layout.spacing.sm }
      ]}>
        <Text
          variant="bodyMedium"
          style={[
            styles.title,
            { marginBottom: theme.layout.spacing.xs },
            disabled && { color: theme.colors.text.secondary }
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="caption"
            color={theme.colors.text.secondary}
            style={[disabled && { opacity: 0.5 }]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {(rightIcon || onRightIconPress) && (
        <Pressable
          onPress={onRightIconPress}
          disabled={disabled || !onRightIconPress}
          style={({ pressed }) => [
            styles.rightIconContainer,
            {
              padding: theme.layout.spacing.xs,
              borderRadius: theme.layout.borderRadius.round,
            },
            pressed && !disabled && {
              backgroundColor: theme.colors.background.cream,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={rightIcon || 'chevron-right'}
            size={24}
            color={theme.colors.text.secondary}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

export function List<T>({
  items,
  renderItem: customRenderItem,
  loading = false,
  onRefresh,
  emptyText = 'No items',
  headerText,
  footerText,
  containerStyle,
  showSeparator = true,
  showChevron = false,
  ...flatListProps
}: ListProps<T>) {
  const theme = useTheme();

  const defaultRenderItem: ListRenderItem<T> = ({ item }) => {
    if (typeof item === 'string') {
      return (
        <ListItem
          title={item}
          rightIcon={showChevron ? 'chevron-right' : undefined}
        />
      );
    }
    if (customRenderItem) {
      return customRenderItem(item, items.indexOf(item));
    }
    return null;
  };

  const ItemSeparator = () => (
    showSeparator ? (
      <View style={[
        styles.separator,
        {
          height: 1,
          backgroundColor: theme.colors.border.light,
          marginLeft: theme.layout.spacing.md,
        }
      ]} />
    ) : null
  );

  const ListEmptyComponent = () => (
    <View style={[
      styles.emptyContainer,
      {
        padding: theme.layout.spacing.xl,
      }
    ]}>
      <Text
        variant="body"
        color={theme.colors.text.secondary}
        style={styles.emptyText}
      >
        {emptyText}
      </Text>
    </View>
  );

  const ListHeaderComponent = () => (
    headerText ? (
      <Text variant="heading3" style={styles.headerText}>
        {headerText}
      </Text>
    ) : null
  );

  const ListFooterComponent = () => (
    footerText ? (
      <Text
        variant="caption"
        color={theme.colors.text.secondary}
        style={styles.footerText}
      >
        {footerText}
      </Text>
    ) : null
  );

  return (
    <FlatList
      data={items}
      renderItem={defaultRenderItem}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.default}
          />
        ) : undefined
      }
      contentContainerStyle={[
        styles.contentContainer,
        items.length === 0 && styles.emptyContentContainer,
        containerStyle,
      ]}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  leftIcon: {},
  rightIconContainer: {},
  title: {},
  separator: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  headerText: {},
  footerText: {},
}); 