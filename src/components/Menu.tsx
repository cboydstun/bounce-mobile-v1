import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonButton,
  IonLoading,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { 
  homeOutline, 
  homeSharp, 
  logInOutline, 
  logInSharp, 
  peopleOutline, 
  peopleSharp,
  calendarOutline,
  calendarSharp
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import './Menu.css';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const getAppPages = (isAuthenticated: boolean): AppPage[] => {
  const authPages: AppPage[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      iosIcon: homeOutline,
      mdIcon: homeSharp
    },
    {
      title: 'Contacts',
      url: '/contacts',
      iosIcon: peopleOutline,
      mdIcon: peopleSharp
    },
    {
      title: 'Calendar',
      url: '/calendar',
      iosIcon: calendarOutline,
      mdIcon: calendarSharp
    }
  ];

  const publicPages: AppPage[] = [
    {
      title: 'Login',
      url: '/login',
      iosIcon: logInOutline,
      mdIcon: logInSharp
    }
  ];

  return isAuthenticated ? authPages : publicPages;
};


const Menu: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const appPages = getAppPages(isAuthenticated);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Bounce Mobile</IonListHeader>
          <IonNote>{user?.email || 'Not logged in'}</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>


        {isAuthenticated && (
          <div className="ion-padding">
            <IonButton expand="block" color="danger" onClick={handleLogout}>
              Logout
            </IonButton>
          </div>
        )}

        <IonLoading isOpen={loading} message="Logging out..." />
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
