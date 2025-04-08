import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonItem,
  IonLabel,
  IonList,
  IonButtons,
  IonMenuButton,
  IonAlert,
} from '@ionic/react';
import { 
  peopleOutline, 
  checkmarkCircleOutline, 
  timeOutline, 
  calendarOutline,
  arrowForward,
} from 'ionicons/icons';
import { RefresherEventDetail } from '@ionic/core';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import ContactStatusBadge from '../components/ContactStatusBadge';
import { ConfirmationStatus } from '../types/contact';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    contacts,
    loading,
    error,
    pagination,
    getUpcomingContacts,
    getContactsByStatus,
    updateContactStatus,
    refetch,
  } = useContacts({ }, 5); // Limit to 5 contacts for the dashboard
  
  // Handle refresh
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await refetch(1);
    } finally {
      event.detail.complete();
    }
  };

  // Format date for display
  const formatDate = (date: Date | string): string => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle status change
  const handleStatusChange = async (id: string, status: ConfirmationStatus) => {
    await updateContactStatus(id, status);
  };

  // Calculate summary data
  const totalContacts = pagination.totalCount;
  const pendingContacts = contacts.filter(c => c.confirmed === 'Pending').length;
  const confirmedContacts = contacts.filter(c => c.confirmed === 'Confirmed').length;
  const upcomingContacts = getUpcomingContacts();
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        
        <IonGrid>
          <IonRow>
            <IonCol>
              <h1>Welcome, {user?.name || 'User'}</h1>
              <p className="ion-padding-bottom">
                Here's an overview of your bounce house contacts.
              </p>
            </IonCol>
          </IonRow>
          
          {/* Summary Cards */}
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>
                    <IonIcon icon={peopleOutline} /> Total Contacts
                  </IonCardSubtitle>
                  <IonCardTitle className="ion-text-center">{totalContacts}</IonCardTitle>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>
                    <IonIcon icon={timeOutline} /> Pending
                  </IonCardSubtitle>
                  <IonCardTitle className="ion-text-center">{pendingContacts}</IonCardTitle>
                </IonCardHeader>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>
                    <IonIcon icon={checkmarkCircleOutline} /> Confirmed
                  </IonCardSubtitle>
                  <IonCardTitle className="ion-text-center">{confirmedContacts}</IonCardTitle>
                </IonCardHeader>
              </IonCard>
            </IonCol>
          </IonRow>
          
          {/* Upcoming Events */}
          <IonRow className="ion-margin-top">
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={calendarOutline} /> Upcoming Events (Next 7 Days)
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {upcomingContacts.length === 0 ? (
                    <p className="ion-text-center">No upcoming events in the next 7 days.</p>
                  ) : (
                    <IonList>
                      {upcomingContacts.map(contact => (
                        <IonItem key={contact._id}>
                          <IonLabel>
                            <h2>{contact.bouncer}</h2>
                            <p>{formatDate(contact.partyDate)}</p>
                          </IonLabel>
                          <ContactStatusBadge slot="end" status={contact.confirmed} />
                        </IonItem>
                      ))}
                    </IonList>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          
          {/* Recent Contacts */}
          <IonRow className="ion-margin-top">
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Recent Contacts</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {contacts.length === 0 ? (
                    <p className="ion-text-center">No contacts found.</p>
                  ) : (
                    <IonList>
                      {contacts.map(contact => (
                        <IonItem key={contact._id}>
                          <IonLabel>
                            <h2>{contact.bouncer}</h2>
                            <p>
                              {formatDate(contact.partyDate)}
                              {contact.partyZipCode && ` • ${contact.partyZipCode}`}
                            </p>
                          </IonLabel>
                          <div slot="end" className="ion-text-right">
                            <ContactStatusBadge status={contact.confirmed} />
                            {contact.confirmed === 'Pending' && (
                              <IonButton
                                size="small"
                                fill="clear"
                                onClick={() => handleStatusChange(contact._id, 'Confirmed')}
                              >
                                Confirm
                              </IonButton>
                            )}
                          </div>
                        </IonItem>
                      ))}
                    </IonList>
                  )}
                  
                  <div className="ion-text-center ion-padding-top">
                    <IonButton routerLink="/contacts" fill="clear">
                      View All Contacts
                      <IonIcon slot="end" icon={arrowForward} />
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        
        {/* Loading indicator */}
        <IonLoading isOpen={loading} message="Loading data..." />
        
        {/* Error alert */}
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => {}}
          header="Error"
          message={error || 'An error occurred'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
