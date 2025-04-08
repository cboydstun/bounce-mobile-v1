import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonLoading,
} from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import { useHistory, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the redirect path or default to dashboard
  const { from } = (location.state as { from?: { pathname: string } }) || {
    from: { pathname: '/dashboard' },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login form submitted');
    console.log('Redirect path:', from?.pathname || '/dashboard');
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('Calling login function...');
      const user = await login(email, password);
      console.log('Login successful:', user);
      console.log('Redirecting to:', from?.pathname || '/dashboard');
      history.replace(from?.pathname || '/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleLogin}>
          <IonList>
            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value || '')}
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || '')}
                required
              />
            </IonItem>
          </IonList>

          {error && (
            <IonText color="danger" className="ion-padding">
              <p>{error}</p>
            </IonText>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit">
              Login
            </IonButton>
          </div>
        </form>

        <IonLoading isOpen={loading} message="Logging in..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
