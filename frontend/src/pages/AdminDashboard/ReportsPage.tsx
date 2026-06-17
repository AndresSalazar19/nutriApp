import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import UnderConstruction from '../../components/ui/UnderConstruction';

const ReportsPage: React.FC = () => {
  const [activeNav, setActiveNav] = useState('Reportes');

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Reportes" />
      
      <div className="px-8 pb-8 pt-8">
        <UnderConstruction />
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;