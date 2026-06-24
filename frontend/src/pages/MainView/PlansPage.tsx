import React from 'react';
import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import UnderConstruction from '../../components/ui/UnderConstruction';

const PlansPage: React.FC = () => {
  return (
    <NutritionistLayout>
      <div className="p-8 h-full flex flex-col justify-center">
        <UnderConstruction />
      </div>
    </NutritionistLayout>
  );
};

export default PlansPage;
