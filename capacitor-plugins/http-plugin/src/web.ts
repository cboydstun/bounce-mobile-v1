import { WebPlugin } from '@capacitor/core';

import type { HttpPluginPlugin, HttpOptions, HttpResponse } from './definitions';

export class HttpPluginWeb extends WebPlugin implements HttpPluginPlugin {
  async request(options: HttpOptions): Promise<HttpResponse> {
    const { url, method = 'GET', headers = {}, data } = options;
    
    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'omit',
      mode: 'cors'
    };
    
    if (data) {
      if (method === 'GET') {
        // For GET requests, add query parameters
        const urlObj = new URL(url);
        Object.entries(data).forEach(([key, value]) => {
          urlObj.searchParams.append(key, String(value));
        });
        options.url = urlObj.toString();
      } else {
        // For other methods, add body
        fetchOptions.body = JSON.stringify(data);
      }
    }
    
    const response = await fetch(url, fetchOptions);
    const responseData = await this.getResponseData(response);
    
    const responseHeaders: { [key: string]: string } = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    return {
      status: response.status,
      headers: responseHeaders,
      data: responseData
    };
  }
  
  async get(options: HttpOptions): Promise<HttpResponse> {
    return this.request({
      ...options,
      method: 'GET'
    });
  }
  
  async post(options: HttpOptions): Promise<HttpResponse> {
    return this.request({
      ...options,
      method: 'POST'
    });
  }
  
  private async getResponseData(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    } else if (contentType.includes('text/')) {
      return response.text();
    } else {
      // For binary data or other types, return as text
      return response.text();
    }
  }
}
