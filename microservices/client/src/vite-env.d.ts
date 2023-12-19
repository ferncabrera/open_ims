/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_API_URL: string;
    readonly VITE_HOST_IP: string;
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

// ==> call them like this: const title: string = import.meta.env.VITE_APP_TITLE;