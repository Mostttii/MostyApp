import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
  Modal,
  Platform,
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface MenuItemProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  destructive?: boolean;
}

interface MenuProps {
  trigger: React.ReactNode;
  items: MenuItemProps[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  style?: StyleProp<ViewStyle>;
}

export function MenuItem({
  label,
  onPress,
  icon,
  disabled,
  destructive,
}: MenuItemProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed
            ? colors.background.sage
            : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={
            destructive
              ? colors.status.error
              : disabled
              ? colors.text.disabled
              : colors.text.secondary
          }
          style={styles.menuItemIcon}
        />
      )}
      <Text
        variant="body2"
        style={[
          styles.menuItemLabel,
          {
            color: destructive
              ? colors.status.error
              : disabled
              ? colors.text.disabled
              : colors.text.primary,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Menu({
  trigger,
  items,
  placement = 'bottom',
  offset = 8,
  style,
}: MenuProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const [visible, setVisible] = useState(false);
  const [menuLayout, setMenuLayout] = useState<LayoutRectangle | null>(null);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    if (visible && triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
      });
    }
  }, [visible]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setMenuLayout(event.nativeEvent.layout);
  };

  const getMenuPosition = () => {
    if (!triggerLayout || !menuLayout) return {};

    const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
    let position: { top?: number; left?: number; right?: number; bottom?: number } = {};

    switch (placement) {
      case 'top':
        position.bottom = windowHeight - triggerLayout.y + offset;
        position.left = triggerLayout.x;
        break;
      case 'bottom':
        position.top = triggerLayout.y + triggerLayout.height + offset;
        position.left = triggerLayout.x;
        break;
      case 'left':
        position.top = triggerLayout.y;
        position.right = windowWidth - triggerLayout.x + offset;
        break;
      case 'right':
        position.top = triggerLayout.y;
        position.left = triggerLayout.x + triggerLayout.width + offset;
        break;
    }

    return position;
  };

  return (
    <>
      <View ref={triggerRef}>
        <Pressable onPress={() => setVisible(true)}>
          {trigger}
        </Pressable>
      </View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.menu,
              {
                backgroundColor: colors.background.default,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              },
              getMenuPosition(),
              style,
            ]}
            onLayout={handleLayout}
          >
            {items.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
                onPress={() => {
                  setVisible(false);
                  item.onPress();
                }}
              />
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemLabel: {
    flex: 1,
  },
}); 