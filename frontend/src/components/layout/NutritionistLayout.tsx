import React from 'react';
import { NutritionistSidebar } from './NutritionistSidebar';

interface NutritionistLayoutProps {
  children: React.ReactNode;
  locked?: boolean;
}

export function NutritionistLayout({ children, locked = false }: NutritionistLayoutProps) {
  return (
    <div className="flex h-screen bg-nutri-bg font-sans overflow-hidden">
      <NutritionistSidebar locked={locked} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
