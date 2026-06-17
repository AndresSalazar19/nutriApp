import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import UnderConstruction from '../../components/ui/UnderConstruction';

const SettingsPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('Configuración');

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Configuración" />
      
      <div className="px-8 pb-8 pt-8 h-full flex flex-col justify-center">
        <UnderConstruction />
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;