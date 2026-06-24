import React from 'react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  activeNav: string;
  onNavChange: (label: string) => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeNav, onNavChange, children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-admin-bg font-sans">
      <AdminSidebar activeNav={activeNav} onNavChange={onNavChange} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
