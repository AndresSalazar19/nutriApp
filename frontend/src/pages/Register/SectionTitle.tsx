import React from 'react';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-green-600 font-semibold text-sm mb-4 border-b-2 border-green-500 pb-1 inline-block">
    {children}
  </h2>
);