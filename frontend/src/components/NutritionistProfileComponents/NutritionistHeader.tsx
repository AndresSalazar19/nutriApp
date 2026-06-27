import React from 'react';
import { NutritionistProfileDetail } from '../../services/NutritionistService';
import { Badge } from '../ui/Badge';

interface NutritionistHeaderProps {
  profile: NutritionistProfileDetail;
}

export const NutritionistHeader: React.FC<NutritionistHeaderProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
          {profile.user?.person ? (
            <span>
              {profile.user.person.first_name?.[0]}
              {profile.user.person.last_name?.[0]}
            </span>
          ) : (
            <span>NU</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">
            {profile.user?.person
              ? `${profile.user.person.first_name} ${profile.user.person.last_name}`
              : profile.user?.email}
          </h2>
          <p className="text-sm text-gray-500">{profile.user?.email}</p>
          <div className="mt-2">
            <Badge variant={profile.status as any} />
          </div>
        </div>
      </div>
    </div>
  );
};
