import { FontAwesome } from '@expo/vector-icons';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <FontAwesome
      name={name as any}
      size={size}
      color={color}
      style={style}
    />
  );
}
