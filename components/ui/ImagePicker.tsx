import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  ViewStyle,
  StyleProp,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

export interface ImagePickerProps {
  value?: string;
  onChange?: (uri: string | null) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  aspectRatio?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImagePickerComponent({
  value,
  onChange,
  placeholder = 'Add Photo',
  error,
  containerStyle,
  aspectRatio = 1,
  quality = 0.8,
  maxWidth = 1200,
  maxHeight = 1200,
}: ImagePickerProps) {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return false;
      }
    }
    return true;
  };

  const handlePress = async () => {
    if (value) {
      onChange?.(null);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [aspectRatio, 1],
        quality,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        onChange?.(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
    } finally {
      setLoading(false);
    }
  };

  const containerHeight = 200; // Base height for the container

  const getPickerStyle = ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      ...styles.picker,
      height: containerHeight,
      borderColor: error ? theme.colors.status.error : theme.colors.border.default,
      borderRadius: theme.layout.borderRadius.md,
    };

    const pressedStyle: ViewStyle | null = pressed ? { opacity: 0.8 } : null;

    return [baseStyle, pressedStyle].filter(Boolean) as StyleProp<ViewStyle>;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        onPress={handlePress}
        style={getPickerStyle}
      >
        {value ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: value }}
              style={[
                styles.image,
                { aspectRatio },
              ]}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <MaterialCommunityIcons
                name="close-circle"
                size={24}
                color="#FFFFFF"
              />
              <Text
                variant="caption"
                style={[
                  styles.overlayText,
                  { marginTop: theme.layout.spacing.xs }
                ]}
              >
                Remove Photo
              </Text>
            </View>
          </View>
        ) : (
          <View style={[
            styles.placeholder,
            { backgroundColor: theme.colors.background.sage }
          ]}>
            <MaterialCommunityIcons
              name="image-plus"
              size={32}
              color={theme.colors.text.secondary}
            />
            <Text
              variant="bodyMedium"
              color={theme.colors.text.secondary}
              style={[
                styles.placeholderText,
                { marginTop: theme.layout.spacing.sm }
              ]}
            >
              {loading ? 'Loading...' : placeholder}
            </Text>
          </View>
        )}
      </Pressable>
      {error && (
        <Text
          variant="caption"
          style={[
            styles.errorText,
            {
              color: theme.colors.status.error,
              marginTop: theme.layout.spacing.xs
            }
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  picker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  overlayText: {
    color: '#FFFFFF',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    textAlign: 'center',
  },
  errorText: {},
}); 