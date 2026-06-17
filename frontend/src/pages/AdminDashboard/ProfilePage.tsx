import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import UnderConstruction from '../../components/ui/UnderConstruction';

const ProfilePage: React.FC = () => {
  const [activeNav, setActiveNav] = useState(''); 

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Mi Perfil" />
      
      <div className="px-8 pb-8 pt-8 h-full flex flex-col justify-center">
        <UnderConstruction />
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;