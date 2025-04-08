import { registerPlugin } from '@capacitor/core';

import type { HttpPluginPlugin } from './definitions';

const HttpPlugin = registerPlugin<HttpPluginPlugin>('HttpPlugin', {
  web: () => import('./web').then(m => new m.HttpPluginWeb()),
});

export * from './definitions';
export { HttpPlugin };
