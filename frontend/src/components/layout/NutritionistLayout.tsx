import React from 'react';
import { NutritionistSidebar } from './NutritionistSidebar';

interface NutritionistLayoutProps {
  children: React.ReactNode;
}

export function NutritionistLayout({ children }: NutritionistLayoutProps) {
  return (
    <div className="flex h-screen bg-nutri-bg font-sans overflow-hidden">
      <NutritionistSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
