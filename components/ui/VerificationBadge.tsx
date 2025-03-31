import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from './Text';
import { useTheme } from '../../context/ThemeContext';
import { VerificationStatus } from '../../types/Verification';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onPress?: () => void;
}

const statusConfig = {
  verified: {
    icon: 'check-decagram',
    color: '#4CAF50',
    label: 'Verified',
  },
  pending: {
    icon: 'clock-outline',
    color: '#FFC107',
    label: 'Pending Verification',
  },
  unverified: {
    icon: 'alert-circle-outline',
    color: '#9E9E9E',
    label: 'Unverified',
  },
  rejected: {
    icon: 'close-circle-outline',
    color: '#F44336',
    label: 'Verification Rejected',
  },
};

const sizeConfig = {
  small: {
    iconSize: 16,
    fontSize: 12,
  },
  medium: {
    iconSize: 20,
    fontSize: 14,
  },
  large: {
    iconSize: 24,
    fontSize: 16,
  },
};

export function VerificationBadge({
  status,
  size = 'medium',
  showLabel = false,
  onPress,
}: VerificationBadgeProps) {
  const theme = useTheme();
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  const Badge = () => (
    <View style={[styles.container, showLabel && styles.containerWithLabel]}>
      <MaterialCommunityIcons
        name={config.icon as any}
        size={sizeStyle.iconSize}
        color={config.color}
      />
      {showLabel && (
        <Text
          variant="caption"
          style={[styles.label, { fontSize: sizeStyle.fontSize, color: config.color }]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Badge />
      </TouchableOpacity>
    );
  }

  return <Badge />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  containerWithLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  label: {
    marginLeft: 4,
  },
}); 