export interface HttpPluginPlugin {
  request(options: HttpOptions): Promise<HttpResponse>;
  get(options: HttpOptions): Promise<HttpResponse>;
  post(options: HttpOptions): Promise<HttpResponse>;
}

export interface HttpOptions {
  url: string;
  method?: string;
  headers?: { [key: string]: string };
  data?: any;
}

export interface HttpResponse {
  status: number;
  headers: { [key: string]: string };
  data: any;
}
