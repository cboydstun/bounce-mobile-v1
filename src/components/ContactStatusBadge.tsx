import React from 'react';
import { IonBadge } from '@ionic/react';
import { ConfirmationStatus } from '../types/contact';

interface ContactStatusBadgeProps {
  status: ConfirmationStatus;
  className?: string;
  slot?: string;
}

const ContactStatusBadge: React.FC<ContactStatusBadgeProps> = ({ status, className, slot }) => {
  // Determine badge color based on status
  const getBadgeColor = (status: ConfirmationStatus): string => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Called / Texted':
        return 'tertiary';
      case 'Declined':
        return 'danger';
      case 'Cancelled':
        return 'medium';
      default:
        return 'medium';
    }
  };

  return (
    <IonBadge 
      color={getBadgeColor(status)} 
      className={className}
      slot={slot}
    >
      {status}
    </IonBadge>
  );
};

export default ContactStatusBadge;
