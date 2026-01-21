import { FormEvent, useState } from 'react';
import { Loader2, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

type AuthMode = 'signin' | 'signup';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const authAction =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error: authError, data } = await authAction;

    if (authError) {
      setError(authError.message);
    } else {
      if (mode === 'signup' && !data.session) {
        setMessage('Check your email to confirm your account.');
      }

      if (data.session) {
        setMessage('You are signed in.');
        onAuthSuccess?.();
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === 'signin' ? 'Sign in' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            Access TipTransparency to submit and compare earnings.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={mode === 'signin' ? 'default' : 'outline'}
              className="w-1/2"
              onClick={() => setMode('signin')}
            >
              <LogIn className="size-4 mr-2" />
              Sign in
            </Button>
            <Button
              type="button"
              variant={mode === 'signup' ? 'default' : 'outline'}
              className="w-1/2"
              onClick={() => setMode('signup')}
            >
              <UserPlus className="size-4 mr-2" />
              Sign up
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && !error && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground text-center justify-center">
          By continuing you agree to receive emails related to your account.
        </CardFooter>
      </Card>
    </div>
  );
}
