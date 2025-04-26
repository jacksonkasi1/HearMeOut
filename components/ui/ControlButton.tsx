import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';

interface ControlButtonProps {
  title: string;
  onPress: () => void;
  active?: boolean;
  emergency?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  title,
  onPress,
  active = false,
  emergency = false,
  icon,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (active && emergency) {
      // Create pulsing animation for emergency state
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animation
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [active, emergency, pulseAnim]);
  
  const getBackgroundColor = () => {
    if (emergency) return colors.danger;
    if (active) return colors.primary;
    return colors.card;
  };
  
  const getTextColor = () => {
    if (emergency || active) return colors.textDark;
    return colors.text;
  };
  
  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        {icon && <>{icon}</>}
        <Text
          style={[
            styles.title,
            {
              color: getTextColor(),
              marginTop: icon ? spacing.sm : 0,
            },
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    minWidth: 100,
  },
  title: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    textAlign: 'center',
  },
});