import React, { useEffect } from 'react';
import { scheduleHealthReminders } from '@/services/notification-service';
import WelcomeScreen from '@/features/auth/components/WelcomeScreen';

export default function IndexRoute() {
  useEffect(() => {
    scheduleHealthReminders();
  }, []);

  return <WelcomeScreen />;
}
