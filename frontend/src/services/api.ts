const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface AstronomicalObject {
  id: string;
  slug: string;
  name: string;
  type: string;
  ra: number;
  dec: number;
  ra_hms: string;
  dec_dms: string;
  description: string;
  tags: string[];
  proper_motion_ra?: number;
  proper_motion_dec?: number;
  parallax?: number;
  distance_ly?: number;
  spectral_type?: string;
  observation_count: number;
}

export interface ObservationRecord {
  id: string;
  obs_id: string;
  collection: string;
  ra: number;
  dec: number;
  bandpass: string;
  wavelength_min_um?: number;
  wavelength_max_um?: number;
  mjd_start?: number;
  mjd_end?: number;
  date_obs?: string;
  exposure_time_s?: number;
  access_url?: string;
  fits_url?: string;
  preview_url?: string;
  data_product_type: string;
  calib_level: number;
  pixel_scale_arcsec?: number;
  naxis1?: number;
  naxis2?: number;
  file_size_bytes?: number;
  is_real_data: boolean;
  archive_source: string;
}

export interface ObservationListResponse {
  total: number;
  page: number;
  page_size: number;
  query_target?: string;
  target_ra?: number;
  target_dec?: number;
  observations: ObservationRecord[];
  archive_status: string;
  message?: string;
}

export interface CandidateDetection {
  id: string;
  target_name: string;
  ra: number;
  dec: number;
  pixel_x_epoch1: number;
  pixel_y_epoch1: number;
  pixel_x_epoch2: number;
  pixel_y_epoch2: number;
  angular_displacement_arcsec: number;
  estimated_proper_motion_mas_yr?: number;
  flux_epoch1?: number;
  flux_epoch2?: number;
  delta_magnitude?: number;
  candidate_type: 'moving_source' | 'variable_source';
  confidence: 'high' | 'moderate' | 'low';
  explanation: string;
  scientific_limitations: string;
}

export interface ComparisonObservationSummary {
  obs_id: string;
  date_obs: string;
  bunit: string;
  file_name: string;
  metadata?: any;
}

export interface TimeMachineFrame {
  frame_index: number;
  obs_id: string;
  date_obs: string;
  date_display: string;
  bandpass: string;
  detector: number;
  file_name: string;
  image_base64: string;
  pixel_scale_arcsec: number;
  exposure_time_s: number;
  bunit: string;
}

export interface TimeMachineManifestResponse {
  target_name: string;
  ra: number;
  dec: number;
  total_frames: number;
  baseline_days: number;
  frames: TimeMachineFrame[];
  processing_notes: string[];
  total_archive_products?: number;
  archive_distinct_dates?: number;
}

export interface ComparisonResponse {
  observation_1: ComparisonObservationSummary;
  observation_2: ComparisonObservationSummary;
  common_footprint: boolean;
  overlap_area_arcmin2?: number;
  epoch1_image_base64: string;
  epoch2_image_base64: string;
  difference_image_base64?: string;
  aligned: boolean;
  reprojection_performed: boolean;
  stretch_used: string;
  min_percentile: number;
  max_percentile: number;
  candidates: CandidateDetection[];
  detection_metrics?: {
    raw_sources_epoch1: number;
    raw_sources_epoch2: number;
    associations: number;
    astrometric_stability_arcsec: number;
    astrometric_stability_pixels: number;
    residual_features: number;
    filtered_candidates: number;
  };
  processing_notes: string[];
  scientific_disclaimer: string;
}

export interface SpectralChannel {
  channel_number: number;
  detector: string;
  detector_name: string;
  wavelength_center_um: number;
  wavelength_min_um: number;
  wavelength_max_um: number;
  bandwidth_um: number;
  resolving_power_R: number;
}

export interface TargetSpectrumResponse {
  object_id: string;
  object_name: string;
  object_type: string;
  ra: number;
  dec: number;
  total_bands: number;
  covered_detectors: string[];
  total_channels_observed: number;
  channels: Array<{
    channel: number;
    detector: string;
    detector_name?: string;
    wavelength_um: number;
    observed: boolean;
    is_dichroic_gap?: boolean;
    flux_mjy_sr?: number | null;
    flux_uJy?: number | null;
    flux_err_uJy?: number | null;
    reference_model_flux_uJy?: number | null;
    gap_notes?: string | null;
  }>;
  wavelength_units: string;
  flux_units: string;
  science_explanation: string;
  dichroic_gap_channels?: number[];
  dichroic_gap_wavelength_um?: number[];
}

export interface DiscoveryRecord {
  id: string;
  title: string;
  object_id: string;
  object_name: string;
  notes: string;
  observation_ids: string[];
  analysis_summary: string;
  candidate_type: string;
  angular_displacement_arcsec?: number;
  confidence: string;
  created_at: string;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async getObjects(query?: string, type?: string): Promise<AstronomicalObject[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type && type !== 'All') params.append('type', type);
    const res = await fetch(`${API_BASE_URL}/objects?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch astronomical objects');
    return res.json();
  },

  async getObject(id: string): Promise<AstronomicalObject> {
    const res = await fetch(`${API_BASE_URL}/objects/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Object ${id} not found`);
    return res.json();
  },

  async resolveCoordinates(query: string) {
    const res = await fetch(`${API_BASE_URL}/objects/resolve?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to resolve coordinates');
    return res.json();
  },

  async getObservations(params: {
    objectId?: string;
    ra?: number;
    dec?: number;
    radiusDeg?: number;
    limit?: number;
  }): Promise<ObservationListResponse> {
    const search = new URLSearchParams();
    if (params.objectId) search.append('object_id', params.objectId);
    if (params.ra !== undefined) search.append('ra', params.ra.toString());
    if (params.dec !== undefined) search.append('dec', params.dec.toString());
    if (params.radiusDeg) search.append('radius_deg', params.radiusDeg.toString());
    if (params.limit) search.append('limit', params.limit.toString());
    
    const res = await fetch(`${API_BASE_URL}/observations?${search.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch observations');
    return res.json();
  },

  async generatePreview(params: {
    stretch?: string;
    colormap?: string;
    lowerPercentile?: number;
    upperPercentile?: number;
    ra?: number;
    dec?: number;
    fovArcsec?: number;
    smooth?: boolean;
    objectName?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/processing/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stretch: params.stretch || 'asinh',
        colormap: params.colormap || 'inferno',
        lower_percentile: params.lowerPercentile || 0.5,
        upper_percentile: params.upperPercentile || 99.5,
        ra: params.ra,
        dec: params.dec,
        fov_arcsec: params.fovArcsec || 180.0,
        smooth: params.smooth || false,
        object_name: params.objectName,
      }),
    });
    if (!res.ok) throw new Error('Failed to render preview');
    return res.json();
  },

  async compareObservations(params: {
    obsId1: string;
    obsId2: string;
    targetName?: string;
    centerRa?: number;
    centerDec?: number;
    cutoutSizeArcsec?: number;
    stretch?: string;
    colormap?: string;
    smooth?: boolean;
  }): Promise<ComparisonResponse> {
    const res = await fetch(`${API_BASE_URL}/comparison/align`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obs_id_1: params.obsId1,
        obs_id_2: params.obsId2,
        target_name: params.targetName || 'Target',
        center_ra: params.centerRa,
        center_dec: params.centerDec,
        cutout_size_arcsec: params.cutoutSizeArcsec || 180.0,
        stretch: params.stretch || 'asinh',
        colormap: params.colormap || 'inferno',
        smooth: params.smooth || false,
      }),
    });
    if (!res.ok) throw new Error('Failed to compare observations');
    return res.json();
  },

  async getTimeMachineManifest(params: {
    ra: number;
    dec: number;
    targetName?: string;
    cutoutSizeArcsec?: number;
    stretch?: string;
    colormap?: string;
    smooth?: boolean;
  }): Promise<TimeMachineManifestResponse> {
    const res = await fetch(`${API_BASE_URL}/comparison/manifest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ra: params.ra,
        dec: params.dec,
        target_name: params.targetName || 'Target Field',
        cutout_size_arcsec: params.cutoutSizeArcsec || 180.0,
        stretch: params.stretch || 'asinh',
        colormap: params.colormap || 'inferno',
        smooth: params.smooth || false,
      }),
    });
    if (!res.ok) throw new Error('Failed to fetch Time Machine manifest');
    return res.json();
  },

  async getHipsMetadata() {
    const res = await fetch(`${API_BASE_URL}/spectra/hips/metadata`);
    if (!res.ok) throw new Error('Failed to fetch HiPS metadata');
    return res.json();
  },

  async extractSpectrum(params: { ra: number; dec: number; targetName?: string }) {
    const search = new URLSearchParams({
      ra: params.ra.toString(),
      dec: params.dec.toString(),
    });
    if (params.targetName) search.append('target_name', params.targetName);
    const res = await fetch(`${API_BASE_URL}/spectra/extract?${search.toString()}`);
    if (!res.ok) throw new Error('Failed to extract spectrum');
    return res.json();
  },

  async getSpectrum(objectId: string): Promise<TargetSpectrumResponse> {
    const res = await fetch(`${API_BASE_URL}/spectra/${encodeURIComponent(objectId)}`);
    if (!res.ok) throw new Error('Failed to fetch spectral data');
    return res.json();
  },

  async getMissions() {
    const res = await fetch(`${API_BASE_URL}/missions`);
    if (!res.ok) throw new Error('Failed to fetch missions');
    return res.json();
  },

  async getMission(id: string) {
    const res = await fetch(`${API_BASE_URL}/missions/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Mission ${id} not found`);
    return res.json();
  },

  async getDiscoveries(): Promise<DiscoveryRecord[]> {
    const res = await fetch(`${API_BASE_URL}/discoveries`);
    if (!res.ok) throw new Error('Failed to fetch discoveries');
    return res.json();
  },

  async saveDiscovery(data: {
    title: string;
    object_id: string;
    object_name: string;
    notes?: string;
    observation_ids?: string[];
    analysis_summary?: string;
    candidate_type?: string;
    angular_displacement_arcsec?: number;
    confidence?: string;
  }): Promise<DiscoveryRecord> {
    const res = await fetch(`${API_BASE_URL}/discoveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save discovery');
    return res.json();
  },

  async deleteDiscovery(id: string) {
    const res = await fetch(`${API_BASE_URL}/discoveries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete discovery');
    return res.json();
  },

  async getLightCurveTargets(): Promise<Array<{
    object_id: string;
    object_name: string;
    object_type: string;
    variability_type: string;
    period_days?: number | null;
    amplitude_mag: number;
    num_epochs: number;
  }>> {
    const res = await fetch(`${API_BASE_URL}/lightcurves`);
    if (!res.ok) throw new Error('Failed to fetch light curve targets');
    return res.json();
  },

  async getLightCurve(objectId: string): Promise<{
    object_id: string;
    object_name: string;
    object_type: string;
    period_days?: number | null;
    variability_type: string;
    primary_band: string;
    secondary_band?: string;
    amplitude_mag: number;
    scientific_summary: string;
    data_points: Array<{
      mjd: number;
      date_utc: string;
      band: string;
      flux_ujy: number;
      flux_err_ujy: number;
      mag: number;
      mag_err: number;
      phase?: number | null;
      is_outlier: boolean;
    }>;
  }> {
    const res = await fetch(`${API_BASE_URL}/lightcurves/${encodeURIComponent(objectId)}`);
    if (!res.ok) throw new Error(`Light curve not found for ${objectId}`);
    return res.json();
  },

  async getCatalogCrossmatch(objectId: string): Promise<{
    object_id: string;
    object_name: string;
    simbad?: {
      main_id: string;
      aliases: string[];
      sp_type?: string;
      radial_velocity_km_s?: number | null;
      bibcode_count?: number;
    };
    gaia_dr3?: {
      source_id: string;
      ra_deg?: number;
      dec_deg?: number;
      epoch?: string;
      pm_ra_mas_yr?: number;
      pm_dec_mas_yr?: number;
      total_pm_mas_yr?: number;
      parallax_mas?: number;
      parallax_error_mas?: number;
      distance_pc?: number;
      distance_ly?: number;
      phot_g_mean_mag?: number | null;
      phot_bp_mean_mag?: number | null;
      phot_rp_mean_mag?: number | null;
      notes?: string;
    };
    allwise?: {
      designation: string;
      w1_mag_3_4um?: number;
      w2_mag_4_6um?: number;
      w3_mag_12um?: number;
      w4_mag_22um?: number;
      notes?: string;
    };
    jpl_horizons?: {
      solar_system_match: boolean;
      notes: string;
    };
  }> {
    const res = await fetch(`${API_BASE_URL}/catalogs/${encodeURIComponent(objectId)}`);
    if (!res.ok) throw new Error(`Catalog crossmatch failed for ${objectId}`);
    return res.json();
  },

  async stackExposures(params: {
    numExposures?: number;
    method?: 'median' | 'mean';
    targetName?: string;
    stretch?: string;
    colormap?: string;
    ra?: number;
    dec?: number;
  }): Promise<{
    num_exposures_combined: number;
    method: string;
    target_name: string;
    single_exposure_image_base64: string;
    stacked_image_base64: string;
    single_bg_rms: number;
    stacked_bg_rms: number;
    theoretical_snr_gain: number;
    measured_snr_gain: number;
    scientific_notes: string[];
  }> {
    const res = await fetch(`${API_BASE_URL}/processing/stack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        num_exposures: params.numExposures || 3,
        method: params.method || 'median',
        target_name: params.targetName || 'Target',
        stretch: params.stretch || 'asinh',
        colormap: params.colormap || 'inferno',
        ra: params.ra,
        dec: params.dec,
      }),
    });
    if (!res.ok) throw new Error('Failed to run image stacking co-addition');
    return res.json();
  },
};
