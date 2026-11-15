import { NavigateFunction } from "react-router-dom";

export interface JourneyReturnState {
  originChapter: string;
  scrollY: number;
  timestamp: number;
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

/** Navigate from Journey to a dedicated scientific workspace with return state recorded. */
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

/** Return from a dedicated scientific workspace back to the originating Journey chapter and scroll position. */
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
