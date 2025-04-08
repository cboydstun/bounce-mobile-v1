import React, { useState } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonNote,
  IonChip,
  IonPopover,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { 
  callOutline, 
  mailOutline, 
  calendarOutline, 
  locationOutline,
  ellipsisHorizontal,
  chevronForward,
  chevronBack,
} from 'ionicons/icons';
import { Contact, ConfirmationStatus } from '../types/contact';
import ContactStatusBadge from './ContactStatusBadge';

interface ContactsListProps {
  contacts: Contact[];
  loading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
  onStatusChange: (id: string, status: ConfirmationStatus) => Promise<void>;
}

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  loading,
  pagination,
  onPageChange,
  onStatusChange,
}) => {
  const [popoverState, setPopoverState] = useState<{
    open: boolean;
    event: Event | undefined;
    contact: Contact | null;
  }>({
    open: false,
    event: undefined,
    contact: null,
  });

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
    await onStatusChange(id, status);
    setPopoverState({ open: false, event: undefined, contact: null });
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    
    // Create an array of page numbers to display
    let pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always show first page
      pages.push(1);
      
      // If current page is among the first 3 pages
      if (currentPage <= 3) {
        pages.push(2, 3, 4, '...', totalPages);
      } 
      // If current page is among the last 3 pages
      else if (currentPage >= totalPages - 2) {
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } 
      // If current page is in the middle
      else {
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return (
      <div className="ion-padding-vertical ion-text-center">
        <IonButton
          fill="clear"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <IonIcon icon={chevronBack} />
        </IonButton>
        
        {pages.map((page, index) => (
          <IonButton
            key={index}
            fill={currentPage === page ? 'solid' : 'clear'}
            disabled={page === '...'}
            onClick={() => typeof page === 'number' && onPageChange(page)}
          >
            {page}
          </IonButton>
        ))}
        
        <IonButton
          fill="clear"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <IonIcon icon={chevronForward} />
        </IonButton>
      </div>
    );
  };

  if (loading) {
    return <div className="ion-padding ion-text-center">Loading contacts...</div>;
  }

  if (contacts.length === 0) {
    return (
      <IonCard>
        <IonCardContent className="ion-text-center">
          <IonText color="medium">
            <p>No contacts found matching your criteria.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonList>
        {contacts.map((contact) => (
          <IonItem key={contact._id} className="ion-margin-bottom">
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonLabel>
                    <h2>{contact.bouncer}</h2>
                    <p>
                      <IonIcon icon={calendarOutline} /> 
                      {formatDate(contact.partyDate)}
                      {contact.partyStartTime && ` at ${contact.partyStartTime}`}
                    </p>
                    <p>
                      <IonIcon icon={locationOutline} /> 
                      {contact.city || contact.partyZipCode || 'Location not specified'}
                    </p>
                  </IonLabel>
                </IonCol>
                
                <IonCol size="12" sizeMd="4">
                  <div className="ion-padding-vertical">
                    <p>
                      <IonIcon icon={mailOutline} /> {contact.email}
                    </p>
                    {contact.phone && (
                      <p>
                        <IonIcon icon={callOutline} /> {contact.phone}
                      </p>
                    )}
                  </div>
                </IonCol>
                
                <IonCol size="12" sizeMd="2" className="ion-text-right">
                  <div className="ion-padding-vertical">
                    <ContactStatusBadge status={contact.confirmed} />
                    
                    <IonButton
                      fill="clear"
                      onClick={(e: any) => 
                        setPopoverState({
                          open: true,
                          event: e.nativeEvent,
                          contact,
                        })
                      }
                    >
                      <IonIcon icon={ellipsisHorizontal} />
                    </IonButton>
                  </div>
                </IonCol>
              </IonRow>
              
              {/* Show additional details like equipment */}
              <IonRow>
                <IonCol>
                  {contact.tablesChairs && <IonChip>Tables & Chairs</IonChip>}
                  {contact.generator && <IonChip>Generator</IonChip>}
                  {contact.popcornMachine && <IonChip>Popcorn</IonChip>}
                  {contact.cottonCandyMachine && <IonChip>Cotton Candy</IonChip>}
                  {contact.snowConeMachine && <IonChip>Snow Cone</IonChip>}
                  {contact.basketballShoot && <IonChip>Basketball</IonChip>}
                  {contact.slushyMachine && <IonChip>Slushy</IonChip>}
                  {contact.overnight && <IonChip>Overnight</IonChip>}
                </IonCol>
              </IonRow>
              
              {/* Show message if available */}
              {contact.message && (
                <IonRow>
                  <IonCol>
                    <IonNote>
                      <strong>Message:</strong> {contact.message}
                    </IonNote>
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </IonItem>
        ))}
      </IonList>
      
      {/* Pagination controls */}
      {pagination.totalPages > 1 && renderPagination()}
      
      {/* Status change popover */}
      <IonPopover
        isOpen={popoverState.open}
        event={popoverState.event}
        onDidDismiss={() => 
          setPopoverState({ open: false, event: undefined, contact: null })
        }
      >
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel className="ion-text-wrap">
                <h2>Update Status</h2>
                <p>{popoverState.contact?.bouncer}</p>
              </IonLabel>
            </IonItem>
            
            {(['Confirmed', 'Pending', 'Called / Texted', 'Declined', 'Cancelled'] as ConfirmationStatus[]).map((status) => (
              <IonItem 
                key={status} 
                button 
                onClick={() => popoverState.contact && handleStatusChange(popoverState.contact._id, status)}
                disabled={popoverState.contact?.confirmed === status}
              >
                <IonLabel>{status}</IonLabel>
                {popoverState.contact?.confirmed === status && (
                  <IonNote slot="end">Current</IonNote>
                )}
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonPopover>
    </>
  );
};

export default ContactsList;
