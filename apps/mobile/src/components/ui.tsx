/**
 * Shared RN UI primitives for the Vroom mobile app.
 *
 * These are thin, themed wrappers over React Native core components. They read
 * design tokens from ThemeContext (backed by @vroom/theme) and keep every
 * screen visually consistent. Numeric sizing is used directly so values are
 * always valid RN style numbers (theme font sizes are px-strings tuned for web).
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TextInputProps, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../app/providers/ThemeContext';

// ---------------------------------------------------------------------------
// Screen — safe-area background wrapper
// ---------------------------------------------------------------------------

export function Screen({
  children,
  scroll = false,
  padded = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const body = (
    <View style={[{ flex: 1 }, padded && { padding: 20, gap: 16 }]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1 }, padded && { padding: 20, gap: 16 }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// AppText — typographic scale
// ---------------------------------------------------------------------------

type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption';

const TEXT_SIZES: Record<TextVariant, { size: number; weight: '400' | '600' | '700' }> = {
  display: { size: 30, weight: '700' },
  title: { size: 22, weight: '700' },
  subtitle: { size: 17, weight: '600' },
  body: { size: 15, weight: '400' },
  caption: { size: 13, weight: '400' },
};

export function AppText({
  children,
  variant = 'body',
  muted = false,
  inverse = false,
  center = false,
}: {
  children: React.ReactNode;
  variant?: TextVariant;
  muted?: boolean;
  inverse?: boolean;
  center?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const { size, weight } = TEXT_SIZES[variant];
  const color = inverse ? colors.textInverse : muted ? colors.textSecondary : colors.textPrimary;
  return (
    <Text style={{ fontSize: size, fontWeight: weight, color, textAlign: center ? 'center' : 'left' }}>
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();

  const bg: Record<ButtonVariant, string> = {
    primary: colors.brand,
    secondary: colors.surfaceElevated,
    ghost: 'transparent',
    danger: colors.statusError,
  };
  const fg: Record<ButtonVariant, string> = {
    primary: colors.brandContrast,
    secondary: colors.textPrimary,
    ghost: colors.brand,
    danger: colors.textInverse,
  };
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg[variant],
          borderColor: variant === 'ghost' ? colors.border : 'transparent',
          borderWidth: variant === 'ghost' ? StyleSheet.hairlineWidth : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <Text style={{ color: fg[variant], fontSize: 16, fontWeight: '600' }}>{label}</Text>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function Card({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}): React.JSX.Element {
  const { colors } = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    ...style,
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.9 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Field — labelled text input
// ---------------------------------------------------------------------------

export function Field({
  label,
  error,
  ...inputProps
}: { label: string; error?: string | undefined } & TextInputProps): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={{
          backgroundColor: colors.surface,
          borderColor: error ? colors.statusError : colors.border,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.textPrimary,
        }}
        {...inputProps}
      />
      {error ? (
        <Text style={{ color: colors.statusError, fontSize: 12 }}>{error}</Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ListRow
// ---------------------------------------------------------------------------

export function ListRow({
  title,
  subtitle,
  trailing,
  onPress,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
  onPress?: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, opacity: pressed && onPress ? 0.8 : 1 },
      ]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="subtitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ? <AppText variant="body" muted>{trailing}</AppText> : null}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// State views — loading / error / empty (the universal data-state contract)
// ---------------------------------------------------------------------------

export function LoadingState({ label = 'Loading…' }: { label?: string }): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.brand} size="large" />
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.center}>
      <AppText variant="subtitle" center>
        {message}
      </AppText>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  title,
  caption,
  cta,
  onCta,
}: {
  title: string;
  caption?: string;
  cta?: string;
  onCta?: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.center}>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {caption ? (
        <AppText variant="caption" muted center>
          {caption}
        </AppText>
      ) : null}
      {cta && onCta ? <Button label={cta} onPress={onCta} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});
