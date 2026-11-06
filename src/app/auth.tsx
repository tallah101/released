import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { Text } from '../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { useStore } from '../store';
import { colors, radius, space, type } from '../theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Prototype auth: validates the form and creates a local profile.
 * The full build swaps this for Supabase Auth (email + Apple/Google).
 */
export default function Auth() {
  const insets = useSafeAreaInsets();
  const signIn = useStore((s) => s.signIn);
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (mode === 'signup' && name.trim().length < 2) return setError('Enter your name.');
    if (!EMAIL.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setError(null);
    signIn({ name: name.trim() || email.split('@')[0], email: email.trim().toLowerCase() });
    router.replace('/home');
  };

  const field = (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={{ backgroundColor: colors.surface, color: colors.text, fontFamily: 'Inter_400Regular', height: 52, borderRadius: radius.md, paddingHorizontal: space.lg, fontSize: 16, marginBottom: space.md }}
      {...props}
    />
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.xl, paddingTop: insets.top }}>
        <Text style={{ color: colors.text, fontSize: 28, fontFamily: 'Sora_800ExtraBold', letterSpacing: 1.5 }}>
          RELEASED<Text style={{ color: colors.accent, fontFamily: 'Sora_800ExtraBold' }}>.</Text>
        </Text>
        <Text style={[type.title, { marginTop: space.xl }]}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</Text>
        <Text style={[type.caption, { marginTop: 6, marginBottom: space.xl }]}>Your watchlist and alerts, synced to your profile.</Text>
        {mode === 'signup' ? field({ placeholder: 'Name', value: name, onChangeText: setName, autoComplete: 'name' }) : null}
        {field({ placeholder: 'Email', value: email, onChangeText: setEmail, autoCapitalize: 'none', keyboardType: 'email-address', autoComplete: 'email' })}
        {field({ placeholder: 'Password', value: password, onChangeText: setPassword, secureTextEntry: true })}
        {error ? <Text style={{ color: colors.error, marginBottom: space.md }}>{error}</Text> : null}
        <Button label={mode === 'signup' ? 'Create account' : 'Sign in'} onPress={submit} />
        <Pressable onPress={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); }} style={{ marginTop: space.lg, alignItems: 'center' }}>
          <Text style={type.caption}>
            {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
            <Text style={{ color: colors.accent, fontWeight: '700' }}>{mode === 'signup' ? 'Sign in' : 'Create one'}</Text>
          </Text>
        </Pressable>
        <Text style={[type.caption, { textAlign: 'center', marginTop: space.xxl, fontSize: 11 }]}>
          Prototype: accounts are stored on this device only.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
