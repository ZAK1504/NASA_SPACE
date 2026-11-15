import { NavigateFunction } from "react-router-dom";

export interface JourneyReturnState {
  originChapter: string;
  scrollY: number;
  timestamp: number;
}

export type TransitionDirection = "enter" | "return";

export interface TransitionPayload {
  direction: TransitionDirection;
  path: string;
  onNavigate: () => void;
}

type TransitionListener = (payload: TransitionPayload) => void;

let activeListener: TransitionListener | null = null;

export function registerTransitionOverlay(listener: TransitionListener): () => void {
  activeListener = listener;
  return () => {
    if (activeListener === listener) {
      activeListener = null;
    }
  };
}

const STORAGE_KEY = "horizon_journey_state";

/** Save the current Journey chapter and scroll position before opening a dedicated workspace. */
export function saveJourneyState(chapterId: string): void {
  try {
    const state: JourneyReturnState = {
      originChapter: chapterId,
      scrollY: window.scrollY,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save journey state to sessionStorage", e);
  }
}

/** Retrieve the saved Journey return state if available. */
export function getJourneyReturnState(): JourneyReturnState | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as JourneyReturnState;
  } catch (e) {
    return null;
  }
}

/** Clear saved return state after restoring position. */
export function clearJourneyReturnState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

/** Direct navigate to workspace without cinematic animation (e.g. internal redirects). */
export function navigateToWorkspace(
  navigate: NavigateFunction,
  path: string,
  originChapter: string
): void {
  saveJourneyState(originChapter);
  navigate(path, {
    state: {
      fromJourney: true,
      originChapter,
      scrollY: window.scrollY,
    },
  });
}

/** Trigger cinematic travel from Journey to a dedicated scientific workspace. */
export function travelToWorkspace(
  navigate: NavigateFunction,
  path: string,
  originChapter: string
): void {
  saveJourneyState(originChapter);

  const performNavigation = () => {
    navigate(path, {
      state: {
        fromJourney: true,
        originChapter,
        scrollY: window.scrollY,
      },
    });
  };

  if (activeListener) {
    activeListener({
      direction: "enter",
      path,
      onNavigate: performNavigation,
    });
  } else {
    performNavigation();
  }
}

/** Direct return from workspace back to Journey. */
export function returnToJourney(
  navigate: NavigateFunction,
  defaultChapter = "home"
): void {
  const saved = getJourneyReturnState();
  const targetChapter = saved?.originChapter || defaultChapter;
  const targetScrollY = saved?.scrollY ?? 0;

  navigate(`/#${targetChapter}`, {
    state: {
      restoreJourney: true,
      targetChapter,
      targetScrollY,
    },
  });
}

/** Trigger cinematic reverse travel from workspace back to originating Journey position. */
export function travelBackToJourney(
  navigate: NavigateFunction,
  defaultChapter = "home"
): void {
  const performNavigation = () => {
    returnToJourney(navigate, defaultChapter);
  };

  if (activeListener) {
    activeListener({
      direction: "return",
      path: "/#" + (getJourneyReturnState()?.originChapter || defaultChapter),
      onNavigate: performNavigation,
    });
  } else {
    performNavigation();
  }
}
