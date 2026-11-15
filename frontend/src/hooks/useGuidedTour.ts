import { useEffect, useRef, useCallback } from 'react';
import { driver, Driver, PopoverDOM } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TOURS, TourDefinition } from '../components/tutorial/tourDefinitions';

const SESSION_STORAGE_KEY = 'horizon_tour_session_v1';

interface TourSessionState {
  skipAllTours: boolean;
  tours: Record<string, 'not_started' | 'completed' | 'skipped'>;
}

function getSessionState(): TourSessionState {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return { skipAllTours: false, tours: {} };
    return JSON.parse(raw) as TourSessionState;
  } catch {
    return { skipAllTours: false, tours: {} };
  }
}

function saveSessionState(state: TourSessionState): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save tour state to sessionStorage', e);
  }
}

export const useGuidedTour = () => {
  const driverInstance = useRef<Driver | null>(null);
  const activeTourIdRef = useRef<string | null>(null);

  const shouldAutoStart = useCallback((tourId: string): boolean => {
    const state = getSessionState();
    if (state.skipAllTours) return false;
    const tourStatus = state.tours[tourId];
    return !tourStatus || tourStatus === 'not_started';
  }, []);

  const markTourCompleted = useCallback((tourId: string): void => {
    const state = getSessionState();
    state.tours[tourId] = 'completed';
    saveSessionState(state);
  }, []);

  const markTourSkipped = useCallback((tourId: string): void => {
    const state = getSessionState();
    state.tours[tourId] = 'skipped';
    saveSessionState(state);
  }, []);

  const setSkipAllTours = useCallback((skip: boolean): void => {
    const state = getSessionState();
    state.skipAllTours = skip;
    saveSessionState(state);
  }, []);

  const isSkipAllTours = useCallback((): boolean => {
    return getSessionState().skipAllTours;
  }, []);

  const isTourCompleted = useCallback((tourId: string): boolean => {
    const state = getSessionState();
    return state.tours[tourId] === 'completed';
  }, []);

  const startTour = useCallback((tourId: string, isManual = false) => {
    const tourDef: TourDefinition | undefined = TOURS[tourId];
    if (!tourDef) {
      console.warn(`Tour '${tourId}' not found in registry`);
      return;
    }

    // If automatic start but user previously skipped or completed, do not launch
    if (!isManual && !shouldAutoStart(tourId)) {
      return;
    }

    if (driverInstance.current) {
      driverInstance.current.destroy();
    }

    activeTourIdRef.current = tourId;

    const d = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(5, 8, 16, 0.88)',
      popoverClass: 'horizon-driver-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      allowClose: true,
      steps: tourDef.steps,
      onPopoverRender: (popover: PopoverDOM) => {
        // Ensure custom action buttons are injected into footer if not present
        if (!popover.footer) return;

        // 1. Check for Skip Tour button
        let skipBtn = popover.footer.querySelector<HTMLButtonElement>('.driver-popover-skip-btn');
        if (!skipBtn) {
          skipBtn = document.createElement('button');
          skipBtn.className = 'driver-popover-skip-btn';
          skipBtn.type = 'button';
          skipBtn.innerText = 'Skip Tour';
          skipBtn.title = 'Dismiss this tutorial and do not show again this session';
          skipBtn.style.cssText = `
            background: transparent;
            color: #8E8A85;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 11px;
            font-family: inherit;
            cursor: pointer;
            margin-right: auto;
            transition: all 0.2s ease;
          `;
          skipBtn.onmouseenter = () => {
            skipBtn!.style.color = '#F3EFE8';
            skipBtn!.style.borderColor = 'rgba(255, 255, 255, 0.35)';
          };
          skipBtn.onmouseleave = () => {
            skipBtn!.style.color = '#8E8A85';
            skipBtn!.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          };
          skipBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (activeTourIdRef.current) {
              markTourSkipped(activeTourIdRef.current);
            }
            d.destroy();
          };
          // Insert skip button before the navigation buttons
          popover.footer.insertBefore(skipBtn, popover.footer.firstChild);
        }

        // 2. Check for "Skip all automatic tours" link
        let skipAllContainer = popover.wrapper.querySelector<HTMLDivElement>('.driver-skip-all-container');
        if (!skipAllContainer) {
          skipAllContainer = document.createElement('div');
          skipAllContainer.className = 'driver-skip-all-container';
          skipAllContainer.style.cssText = `
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10px;
            color: #8E8A85;
          `;

          const skipAllLink = document.createElement('button');
          skipAllLink.type = 'button';
          skipAllLink.innerText = 'Skip all automatic tours for this session';
          skipAllLink.style.cssText = `
            background: none;
            border: none;
            color: #8E8A85;
            text-decoration: underline;
            cursor: pointer;
            padding: 0;
            font-size: 10.5px;
            font-family: inherit;
          `;
          skipAllLink.onmouseenter = () => {
            skipAllLink.style.color = '#F4A272';
          };
          skipAllLink.onmouseleave = () => {
            skipAllLink.style.color = '#8E8A85';
          };
          skipAllLink.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setSkipAllTours(true);
            if (activeTourIdRef.current) {
              markTourSkipped(activeTourIdRef.current);
            }
            d.destroy();
          };

          skipAllContainer.appendChild(skipAllLink);
          popover.wrapper.appendChild(skipAllContainer);
        }
      },
      onDestroyStarted: () => {
        // If driver completed on the last step, mark completed
        if (d.isLastStep()) {
          if (activeTourIdRef.current) {
            markTourCompleted(activeTourIdRef.current);
          }
        } else {
          // If closed early without explicit skip, still remember so it doesn't harass the user
          if (activeTourIdRef.current) {
            markTourSkipped(activeTourIdRef.current);
          }
        }
        activeTourIdRef.current = null;
        driverInstance.current?.destroy();
      },
    });

    driverInstance.current = d;
    d.drive();
  }, [markTourCompleted, markTourSkipped, setSkipAllTours, shouldAutoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverInstance.current) {
        driverInstance.current.destroy();
      }
    };
  }, []);

  return {
    startTour,
    isTourCompleted,
    shouldAutoStart,
    markTourCompleted,
    markTourSkipped,
    setSkipAllTours,
    isSkipAllTours,
    availableTours: Object.values(TOURS),
  };
};
