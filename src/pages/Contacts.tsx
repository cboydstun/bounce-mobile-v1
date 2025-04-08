import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonLoading,
  IonAlert,
} from '@ionic/react';
import { RefresherEventDetail } from '@ionic/core';
import { useContacts } from '../hooks/useContacts';
import ContactsList from '../components/ContactsList';
import ContactsFilter from '../components/ContactsFilter';
import { ConfirmationStatus } from '../types/contact';

const Contacts: React.FC = () => {
  const {
    contacts,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    updateContactStatus,
    refetch,
  } = useContacts();

  // Handle refresh
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await refetch(pagination.currentPage);
    } finally {
      event.detail.complete();
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: {
    startDate?: string;
    endDate?: string;
    confirmed?: string;
  }) => {
    updateFilters(newFilters);
  };

  // Handle status change
  const handleStatusChange = async (id: string, status: ConfirmationStatus) => {
    await updateContactStatus(id, status);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Contacts</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        
        <div className="ion-padding">
          <h1>Contacts Management</h1>
          
          {/* Filters */}
          <ContactsFilter 
            onFilterChange={handleFilterChange}
            loading={loading}
          />
          
          {/* Contacts List */}
          <ContactsList
            contacts={contacts}
            loading={loading}
            pagination={pagination}
            onPageChange={goToPage}
            onStatusChange={handleStatusChange}
          />
        </div>
        
        {/* Loading indicator */}
        <IonLoading isOpen={loading} message="Loading contacts..." />
        
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

export default Contacts;
