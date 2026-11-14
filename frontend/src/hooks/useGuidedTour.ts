import { useEffect, useRef } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TOURS, TourDefinition } from '../components/tutorial/tourDefinitions';

export const useGuidedTour = () => {
  const driverInstance = useRef<Driver | null>(null);

  const startTour = (tourId: string) => {
    const tourDef: TourDefinition | undefined = TOURS[tourId];
    if (!tourDef) {
      console.warn(`Tour '${tourId}' not found`);
      return;
    }

    if (driverInstance.current) {
      driverInstance.current.destroy();
    }

    driverInstance.current = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(5, 8, 16, 0.85)',
      popoverClass: 'horizon-driver-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      steps: tourDef.steps,
      onDestroyStarted: () => {
        try {
          localStorage.setItem(`horizon_tour_completed_${tourId}`, 'true');
        } catch (e) {
          // ignore
        }
        driverInstance.current?.destroy();
      },
    });

    driverInstance.current.drive();
  };

  const isTourCompleted = (tourId: string): boolean => {
    try {
      return localStorage.getItem(`horizon_tour_completed_${tourId}`) === 'true';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    return () => {
      if (driverInstance.current) {
        driverInstance.current.destroy();
      }
    };
  }, []);

  return { startTour, isTourCompleted, availableTours: Object.values(TOURS) };
};
