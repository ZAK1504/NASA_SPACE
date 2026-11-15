/**
 * Cosmic Copilot Scientific Workspace Context Bus
 *
 * Enables scientific workspaces (Time Machine, Spectral Explorer, Discovery Lab, Light Curves)
 * to publish verified active astronomical state to Cosmic Copilot without tight coupling
 * or redundant state duplication.
 */

export interface ScientificWorkspaceContext {
  route?: string;
  target_id?: string;
  target_name?: string;
  ra?: number;
  dec?: number;
  wavelength_um?: number;
  band?: string;
  detector?: string | number;
  mode?: string;
  subtraction_mode?: string;
  obs_ids?: string[];
  epoch_dates?: string[];
  baseline_days?: number;
  measured_displacement_arcsec?: number;
  catalog_proper_motion?: string;
  photometry?: Record<string, any>;
  quality_flags?: string[];
  scientific_limitations?: string;
  detection_summary?: string;
}

let activeWorkspaceContext: ScientificWorkspaceContext = {};

/**
 * Publishes or updates the active scientific workspace context.
 */
export function setCopilotContext(ctx: Partial<ScientificWorkspaceContext>): void {
  activeWorkspaceContext = { ...activeWorkspaceContext, ...ctx };
  if (typeof window !== 'undefined') {
    (window as any).__SPHEREX_COPILOT_CONTEXT__ = activeWorkspaceContext;
  }
}

/**
 * Clears or resets the active workspace context (e.g. on unmount or target change).
 */
export function clearCopilotContext(): void {
  activeWorkspaceContext = {};
  if (typeof window !== 'undefined') {
    delete (window as any).__SPHEREX_COPILOT_CONTEXT__;
  }
}

/**
 * Retrieves the current active scientific workspace context.
 */
export function getCopilotContext(): ScientificWorkspaceContext {
  if (typeof window !== 'undefined' && (window as any).__SPHEREX_COPILOT_CONTEXT__) {
    return (window as any).__SPHEREX_COPILOT_CONTEXT__;
  }
  return activeWorkspaceContext;
}
