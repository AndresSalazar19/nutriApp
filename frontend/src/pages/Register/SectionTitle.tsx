import React from 'react';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-nutri-dark font-semibold text-sm mb-4 border-b-2 border-nutri-medium pb-1 inline-block">
    {children}
  </h2>
);
