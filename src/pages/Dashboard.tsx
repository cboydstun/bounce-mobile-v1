import React, { useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonText,
} from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Welcome</IonCardSubtitle>
            <IonCardTitle>{user?.name || 'User'}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>You are now logged in to the application.</p>
            <p>Email: {user?.email}</p>
            <p>User ID: {user?.id}</p>
          </IonCardContent>
        </IonCard>

        {data && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Protected Data</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </IonCardContent>
          </IonCard>
        )}

        {error && (
          <IonText color="danger" className="ion-padding">
            <p>{error}</p>
          </IonText>
        )}

        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
