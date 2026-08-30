import React, { createContext, useContext, useState, useEffect } from 'react';
import { State, District, Taluka } from '../types';
import { api } from '../services/api';

interface LocationContextType {
  states: State[];
  selectedState: string;
  selectedDistrict: string;
  selectedTaluka: string;
  pincode: string;
  userLat: number | null;
  userLng: number | null;
  locationStatus: 'idle' | 'locating' | 'success' | 'error';
  locationError: string | null;
  setSelectedState: (s: string) => void;
  setSelectedDistrict: (d: string) => void;
  setSelectedTaluka: (t: string) => void;
  setPincode: (p: string) => void;
  useMyLocation: () => void;
  clearLocation: () => void;
  availableDistricts: District[];
  availableTalukas: Taluka[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kolhapur');
  const [selectedTaluka, setSelectedTaluka] = useState<string>('Karvir');
  const [pincode, setPincode] = useState<string>('');
  
  // Default coordinates center on Kolhapur/Karvir for rich initial demo
  const [userLat, setUserLat] = useState<number | null>(16.7050);
  const [userLng, setUserLng] = useState<number | null>(74.2433);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const data = await api.locations.getHierarchy();
        setStates(data);
      } catch (err) {
        console.error('Failed to load location hierarchy', err);
      }
    };
    loadHierarchy();
  }, []);

  const currentStateObj = states.find((s) => s.name.toLowerCase() === selectedState.toLowerCase());
  const availableDistricts = currentStateObj?.districts || [];
  const currentDistrictObj = availableDistricts.find((d) => d.name.toLowerCase() === selectedDistrict.toLowerCase());
  const availableTalukas = currentDistrictObj?.talukas || [];

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('locating');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationStatus('success');
      },
      (err) => {
        console.warn('Geolocation access failed or denied. Using default area center.', err);
        setLocationStatus('error');
        setLocationError('Could not obtain GPS permission. You can select your state & district manually.');
        // Fallback to district center if available
        if (currentDistrictObj?.latitude && currentDistrictObj?.longitude) {
          setUserLat(currentDistrictObj.latitude);
          setUserLng(currentDistrictObj.longitude);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const clearLocation = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedTaluka('');
    setPincode('');
    setUserLat(null);
    setUserLng(null);
    setLocationStatus('idle');
  };

  return (
    <LocationContext.Provider
      value={{
        states,
        selectedState,
        selectedDistrict,
        selectedTaluka,
        pincode,
        userLat,
        userLng,
        locationStatus,
        locationError,
        setSelectedState: (s) => {
          setSelectedState(s);
          setSelectedDistrict('');
          setSelectedTaluka('');
        },
        setSelectedDistrict: (d) => {
          setSelectedDistrict(d);
          setSelectedTaluka('');
          const found = availableDistricts.find((dist) => dist.name.toLowerCase() === d.toLowerCase());
          if (found?.latitude && found?.longitude) {
            setUserLat(found.latitude);
            setUserLng(found.longitude);
          }
        },
        setSelectedTaluka: (t) => {
          setSelectedTaluka(t);
          const found = availableTalukas.find((tal) => tal.name.toLowerCase() === t.toLowerCase());
          if (found?.latitude && found?.longitude) {
            setUserLat(found.latitude);
            setUserLng(found.longitude);
          }
        },
        setPincode,
        useMyLocation,
        clearLocation,
        availableDistricts,
        availableTalukas,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
