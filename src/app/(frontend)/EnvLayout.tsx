'use client'

import React from 'react'
import Script from 'next/script'

export default function EnvLayout({ children }: { children: React.ReactNode }) {
  // Create a string with environment variables to inject into client
  const envVarsScript = `
    window.ENV = {
      SERVER_URL: "${process.env.NEXT_PUBLIC_SERVER_URL || 'https://three-tomorrows-payload-production.up.railway.app'}"
    };
    console.log('Environment variables injected to client:', window.ENV);
  `;

  return (
    <>
      <Script
        id="environment-variables"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: envVarsScript }}
      />
      {children}
    </>
  );
}