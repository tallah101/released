import type { ComponentProps } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { fontForWeight } from '../theme';

/**
 * App-wide Text: maps fontWeight to the loaded Inter family (custom fonts
 * ignore fontWeight on Android), unless a fontFamily is set explicitly.
 * React 19 passes `ref` through as a normal prop.
 */
export function Text({ style, ...rest }: ComponentProps<typeof RNText>) {
  const flat = StyleSheet.flatten(style) ?? {};
  if (flat.fontFamily) return <RNText style={style} {...rest} />;
  const { fontWeight, ...others } = flat;
  return <RNText style={[others, { fontFamily: fontForWeight(fontWeight) }]} {...rest} />;
}
