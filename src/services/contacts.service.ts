import { Contact, ContactFormData, ConfirmationStatus, PaginatedResponse } from '../types/contact';
import { proxyService } from './proxy.service';

// Base URL for API requests
const API_BASE_URL = '/api/v1';

/**
 * Fetch contacts with optional pagination and filtering
 */
export const fetchContacts = async (params: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  deliveryDay?: string;
  confirmed?: string;
}): Promise<PaginatedResponse<Contact>> => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.deliveryDay) queryParams.append('deliveryDay', params.deliveryDay);
    if (params.confirmed) queryParams.append('confirmed', params.confirmed);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/contacts${queryString ? `?${queryString}` : ''}`;
    
    const response = await proxyService.get(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching contacts: ${response.status}`);
    }
    
    const result = await response.json();
    
    // The API currently returns all contacts without pagination
    // We'll implement client-side pagination until the API supports it
    // Handle both real API responses and mock responses from ProxyService
    const contacts = result.contacts || (Array.isArray(result) ? result : []);
    const totalCount = contacts.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = contacts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      data: paginatedData,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error('Error in fetchContacts:', error);
    throw error;
  }
};

/**
 * Update a contact's status
 */
export const updateContactStatus = async (
  id: string, 
  status: ConfirmationStatus
): Promise<Contact> => {
  try {
    const response = await proxyService.sendRequest(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmed: status }),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating contact: ${response.status}`);
    }
    
    const result = await response.json();
    // Handle both real API responses and mock responses from ProxyService
    return result.contact || result;
  } catch (error) {
    console.error('Error in updateContactStatus:', error);
    throw error;
  }
};

/**
 * Get contact by ID
 */
export const getContactById = async (id: string): Promise<Contact> => {
  try {
    const response = await proxyService.get(`${API_BASE_URL}/contacts/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching contact: ${response.status}`);
    }
    
    const result = await response.json();
    // Handle both real API responses and mock responses from ProxyService
    return result.contact || result;
  } catch (error) {
    console.error('Error in getContactById:', error);
    throw error;
  }
};

/**
 * Update a contact
 */
export const updateContact = async (
  id: string, 
  data: Partial<ContactFormData>
): Promise<Contact> => {
  try {
    const response = await proxyService.sendRequest(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating contact: ${response.status}`);
    }
    
    const result = await response.json();
    // Handle both real API responses and mock responses from ProxyService
    return result.contact || result;
  } catch (error) {
    console.error('Error in updateContact:', error);
    throw error;
  }
};
