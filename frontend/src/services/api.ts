import axios from 'axios';
import {
  Scheme,
  EligibilityResponse,
  Hospital,
  DistrictCount,
  State,
  ChatMessage,
  AnalyticsOverview,
  User,
  UserProfile,
  DataSource,
  IngestionLog
} from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    },
    register: async (data: { full_name: string; email: string; mobile?: string; password: string }) => {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    },
    me: async (): Promise<User> => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
  },

  // Schemes
  schemes: {
    list: async (params?: { search?: string; state?: string; category?: string; scheme_type?: string; featured_only?: boolean }): Promise<Scheme[]> => {
      const res = await apiClient.get('/schemes', { params });
      return res.data;
    },
    get: async (idOrSlug: string | number): Promise<Scheme> => {
      const res = await apiClient.get(`/schemes/${idOrSlug}`);
      return res.data;
    },
    save: async (schemeId: number) => {
      const res = await apiClient.post(`/schemes/${schemeId}/save`);
      return res.data;
    },
    removeSaved: async (schemeId: number) => {
      const res = await apiClient.delete(`/schemes/${schemeId}/save`);
      return res.data;
    },
  },

  // Eligibility Engine
  eligibility: {
    check: async (formData: any): Promise<EligibilityResponse> => {
      const res = await apiClient.post('/eligibility/check', formData);
      return res.data;
    },
  },

  // Location-Based Hospital & Scheme Navigator
  hospitals: {
    search: async (params?: {
      state?: string;
      district?: string;
      taluka?: string;
      pincode?: string;
      scheme_id?: number;
      scheme_slug?: string;
      hospital_type?: string;
      is_government?: boolean;
      has_emergency?: boolean;
      search?: string;
      q?: string;
      user_lat?: number;
      user_lng?: number;
      max_distance_km?: number;
      skip?: number;
      limit?: number;
    }): Promise<Hospital[]> => {
      const res = await apiClient.get('/hospitals', { params });
      return res.data;
    },
    get: async (hospitalId: number): Promise<Hospital> => {
      const res = await apiClient.get(`/hospitals/${hospitalId}`);
      return res.data;
    },
    getDistricts: async (state: string = 'Maharashtra'): Promise<DistrictCount[]> => {
      const res = await apiClient.get('/hospitals/districts', { params: { state } });
      return res.data;
    },
    searchQuery: async (q: string, district?: string): Promise<Hospital[]> => {
      const res = await apiClient.get('/hospitals/search', { params: { q, district } });
      return res.data;
    },
    getByScheme: async (schemeSlug: string, params?: { state?: string; district?: string; taluka?: string; user_lat?: number; user_lng?: number }): Promise<Hospital[]> => {
      const res = await apiClient.get(`/hospitals/by-scheme/${schemeSlug}`, { params });
      return res.data;
    },
  },

  // Data Sources & Ingestion
  dataSources: {
    list: async (): Promise<DataSource[]> => {
      const res = await apiClient.get('/data-sources');
      return res.data;
    },
    getStatus: async (): Promise<any[]> => {
      const res = await apiClient.get('/data-sources/status');
      return res.data;
    },
  },

  ingestion: {
    getStatus: async (): Promise<IngestionLog[]> => {
      const res = await apiClient.get('/ingestion/status');
      return res.data;
    },
    refresh: async (): Promise<{ success: boolean; message: string; hospitals_imported: number; schemes_imported: number; timestamp: string }> => {
      const res = await apiClient.post('/ingestion/refresh');
      return res.data;
    },
  },

  // Locations Hierarchy
  locations: {
    getHierarchy: async (): Promise<State[]> => {
      const res = await apiClient.get('/locations/hierarchy');
      return res.data;
    },
    getStates: async () => {
      const res = await apiClient.get('/locations/states');
      return res.data;
    },
    getDistricts: async (stateName: string) => {
      const res = await apiClient.get(`/locations/states/${encodeURIComponent(stateName)}/districts`);
      return res.data;
    },
    getTalukas: async (districtName: string) => {
      const res = await apiClient.get(`/locations/districts/${encodeURIComponent(districtName)}/talukas`);
      return res.data;
    },
  },

  // Scheme Comparison
  compare: {
    getMatrix: async (schemeIds: number[]): Promise<{ schemes: Scheme[] }> => {
      const res = await apiClient.post('/compare', { scheme_ids: schemeIds });
      return res.data;
    },
  },

  // AI Assistant Chat
  chat: {
    send: async (message: string, sessionUuid?: string): Promise<{ session_uuid: string; message: string; relevant_schemes: Scheme[]; suggested_followups: string[]; disclaimer: string }> => {
      const res = await apiClient.post('/chat', { message, session_uuid: sessionUuid });
      return res.data;
    },
  },

  // User Profile & Dashboard
  user: {
    getProfile: async (): Promise<UserProfile> => {
      const res = await apiClient.get('/user/profile');
      return res.data;
    },
    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const res = await apiClient.put('/user/profile', data);
      return res.data;
    },
    getSavedSchemes: async (): Promise<Scheme[]> => {
      const res = await apiClient.get('/user/saved-schemes');
      return res.data;
    },
    getDashboard: async () => {
      const res = await apiClient.get('/user/dashboard');
      return res.data;
    },
  },

  // Admin
  admin: {
    getAnalytics: async (): Promise<AnalyticsOverview> => {
      const res = await apiClient.get('/admin/analytics');
      return res.data;
    },
    createScheme: async (data: any) => {
      const res = await apiClient.post('/admin/schemes', data);
      return res.data;
    },
    updateScheme: async (id: number, data: any) => {
      const res = await apiClient.put(`/admin/schemes/${id}`, data);
      return res.data;
    },
    deleteScheme: async (id: number) => {
      const res = await apiClient.delete(`/admin/schemes/${id}`);
      return res.data;
    },
    createHospital: async (data: any) => {
      const res = await apiClient.post('/admin/hospitals', data);
      return res.data;
    },
    updateHospital: async (id: number, data: any) => {
      const res = await apiClient.put(`/admin/hospitals/${id}`, data);
      return res.data;
    },
    deleteHospital: async (id: number) => {
      const res = await apiClient.delete(`/admin/hospitals/${id}`);
      return res.data;
    },
    importHospitalsCSV: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/admin/hospitals/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  },
};
