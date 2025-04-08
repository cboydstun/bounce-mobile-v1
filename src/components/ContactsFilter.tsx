import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonDatetime,
  IonPopover,
} from '@ionic/react';
import { ConfirmationStatus } from '../types/contact';

interface ContactsFilterProps {
  onFilterChange: (filters: {
    startDate?: string;
    endDate?: string;
    confirmed?: string;
  }) => void;
  loading: boolean;
}

const ContactsFilter: React.FC<ContactsFilterProps> = ({
  onFilterChange,
  loading,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Format date for display
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format date for API
  const formatDateForApi = (isoDate: string): string => {
    if (!isoDate) return '';
    return isoDate.split('T')[0]; // Extract YYYY-MM-DD part
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      startDate: startDate ? formatDateForApi(startDate) : undefined,
      endDate: endDate ? formatDateForApi(endDate) : undefined,
      confirmed: status || undefined,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('');
    
    onFilterChange({});
  };

  return (
    <IonCard>
      <IonCardContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonItem>
                <IonLabel position="stacked">Start Date</IonLabel>
                <IonInput
                  value={startDate ? formatDateForDisplay(startDate) : ''}
                  readonly
                  onClick={() => setShowStartDatePicker(true)}
                  placeholder="Select start date"
                />
                <IonPopover
                  isOpen={showStartDatePicker}
                  onDidDismiss={() => setShowStartDatePicker(false)}
                >
                  <IonDatetime
                    value={startDate}
                    onIonChange={(e) => {
                      setStartDate(e.detail.value as string);
                      setShowStartDatePicker(false);
                    }}
                  />
                </IonPopover>
              </IonItem>
            </IonCol>
            
            <IonCol size="12" sizeMd="4">
              <IonItem>
                <IonLabel position="stacked">End Date</IonLabel>
                <IonInput
                  value={endDate ? formatDateForDisplay(endDate) : ''}
                  readonly
                  onClick={() => setShowEndDatePicker(true)}
                  placeholder="Select end date"
                />
                <IonPopover
                  isOpen={showEndDatePicker}
                  onDidDismiss={() => setShowEndDatePicker(false)}
                >
                  <IonDatetime
                    value={endDate}
                    onIonChange={(e) => {
                      setEndDate(e.detail.value as string);
                      setShowEndDatePicker(false);
                    }}
                  />
                </IonPopover>
              </IonItem>
            </IonCol>
            
            <IonCol size="12" sizeMd="4">
              <IonItem>
                <IonLabel position="stacked">Status</IonLabel>
                <IonSelect
                  value={status}
                  onIonChange={(e) => setStatus(e.detail.value)}
                  placeholder="All Statuses"
                >
                  <IonSelectOption value="">All Statuses</IonSelectOption>
                  <IonSelectOption value="Confirmed">Confirmed</IonSelectOption>
                  <IonSelectOption value="Pending">Pending</IonSelectOption>
                  <IonSelectOption value="Called / Texted">Called / Texted</IonSelectOption>
                  <IonSelectOption value="Declined">Declined</IonSelectOption>
                  <IonSelectOption value="Cancelled">Cancelled</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          
          <IonRow className="ion-margin-top">
            <IonCol>
              <IonButton
                expand="block"
                onClick={applyFilters}
                disabled={loading}
              >
                Apply Filters
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="block"
                fill="outline"
                onClick={resetFilters}
                disabled={loading}
              >
                Reset
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default ContactsFilter;
