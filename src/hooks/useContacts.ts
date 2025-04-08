import { useState, useEffect, useCallback } from 'react';
import { Contact, ConfirmationStatus, PaginatedResponse } from '../types/contact';
import * as contactsService from '../services/contacts.service';

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ContactsFilter {
  startDate?: string;
  endDate?: string;
  deliveryDay?: string;
  confirmed?: string;
}

export const useContacts = (initialFilters: ContactsFilter = {}, initialLimit: number = 10) => {
  const [state, setState] = useState<ContactsState>({
    contacts: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });
  
  const [filters, setFilters] = useState<ContactsFilter>(initialFilters);
  const [limit, setLimit] = useState<number>(initialLimit);
  
  // Fetch contacts with current pagination and filters
  const fetchContacts = useCallback(async (page: number = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await contactsService.fetchContacts({
        page,
        limit,
        ...filters,
      });
      
      setState({
        contacts: response.data,
        loading: false,
        error: null,
        pagination: {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalCount: response.totalCount,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage,
        },
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  }, [filters, limit]);
  
  // Initial fetch
  useEffect(() => {
    fetchContacts(1);
  }, [fetchContacts]);
  
  // Update filters and refetch
  const updateFilters = useCallback((newFilters: ContactsFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Fetch will be triggered by the useEffect that depends on filters
  }, []);
  
  // Change page
  const goToPage = useCallback((page: number) => {
    fetchContacts(page);
  }, [fetchContacts]);
  
  // Update contact status
  const updateContactStatus = useCallback(async (id: string, status: ConfirmationStatus) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await contactsService.updateContactStatus(id, status);
      
      // Refetch current page to get updated data
      await fetchContacts(state.pagination.currentPage);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  }, [fetchContacts, state.pagination.currentPage]);
  
  // Get upcoming contacts (next 7 days)
  const getUpcomingContacts = useCallback((): Contact[] => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return state.contacts.filter(contact => {
      const partyDate = new Date(contact.partyDate);
      return partyDate >= today && partyDate <= nextWeek;
    });
  }, [state.contacts]);
  
  // Get contacts by status
  const getContactsByStatus = useCallback((status: ConfirmationStatus): Contact[] => {
    return state.contacts.filter(contact => contact.confirmed === status);
  }, [state.contacts]);
  
  return {
    ...state,
    filters,
    updateFilters,
    goToPage,
    updateContactStatus,
    getUpcomingContacts,
    getContactsByStatus,
    refetch: fetchContacts,
  };
};
