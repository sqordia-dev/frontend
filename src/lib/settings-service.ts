import { apiClient } from './api-client';

export interface ThemeColor {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  rgba: string;
  preview: string;
}

export const themeColors: ThemeColor[] = [
  {
    id: 'green',
    name: 'Green',
    primary: '#22C55E',
    primaryHover: '#16A34A',
    primaryLight: '#4ADE80',
    primaryDark: '#15803D',
    rgba: 'rgba(34, 197, 94, 0.25)',
    preview: 'bg-green-500'
  },
  {
    id: 'orange',
    name: 'Orange',
    primary: '#FF6B00',
    primaryHover: '#E55F00',
    primaryLight: '#FF8C42',
    primaryDark: '#CC4A00',
    rgba: 'rgba(255, 107, 0, 0.25)',
    preview: 'bg-orange-500'
  },
  {
    id: 'blue',
    name: 'Blue',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: '#60A5FA',
    primaryDark: '#1D4ED8',
    rgba: 'rgba(59, 130, 246, 0.25)',
    preview: 'bg-blue-500'
  },
  {
    id: 'purple',
    name: 'Purple',
    primary: '#A855F7',
    primaryHover: '#9333EA',
    primaryLight: '#C084FC',
    primaryDark: '#7E22CE',
    rgba: 'rgba(168, 85, 247, 0.25)',
    preview: 'bg-purple-500'
  },
  {
    id: 'red',
    name: 'Red',
    primary: '#EF4444',
    primaryHover: '#DC2626',
    primaryLight: '#F87171',
    primaryDark: '#B91C1C',
    rgba: 'rgba(239, 68, 68, 0.25)',
    preview: 'bg-red-500'
  },
  {
    id: 'teal',
    name: 'Teal',
    primary: '#14B8A6',
    primaryHover: '#0D9488',
    primaryLight: '#2DD4BF',
    primaryDark: '#0F766E',
    rgba: 'rgba(20, 184, 166, 0.25)',
    preview: 'bg-teal-500'
  },
  {
    id: 'indigo',
    name: 'Indigo',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryLight: '#818CF8',
    primaryDark: '#4338CA',
    rgba: 'rgba(99, 102, 241, 0.25)',
    preview: 'bg-indigo-500'
  },
  {
    id: 'pink',
    name: 'Pink',
    primary: '#EC4899',
    primaryHover: '#DB2777',
    primaryLight: '#F472B6',
    primaryDark: '#BE185D',
    rgba: 'rgba(236, 72, 153, 0.25)',
    preview: 'bg-pink-500'
  }
];

export const settingsService = {
  async getThemeColor(): Promise<string> {
    try {
      // Use category endpoint to get theme settings (safer than route parameter with dots)
      const response = await apiClient.get('/api/v1/settings/category/Theme');
      
      // Handle Result wrapper response
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          const themeSettings = response.data.value;
          return themeSettings['Theme.Color'] || 'green';
        }
      }
      
      // Handle direct dictionary response
      if (response.data && typeof response.data === 'object' && response.data['Theme.Color']) {
        return response.data['Theme.Color'];
      }
      
      // Default to orange if not found
      return 'orange';
    } catch (error: any) {
      console.error('Failed to get theme color:', error);
      // If 404 or any error, return default
      return 'green';
    }
  },

  async setThemeColor(colorId: string): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/settings', {
        Key: 'Theme.Color',
        Value: colorId,
        Category: 'Theme',
        Description: 'Primary theme color for the application',
        IsPublic: true,
        SettingType: 1, // SettingType.Config = 1
        DataType: 1, // SettingDataType.String = 1
        Encrypt: false,
        IsCritical: false
      });
      
      // Check if response indicates success
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to update theme color');
        }
      }
    } catch (error: any) {
      console.error('Failed to set theme color:', error);
      // Use user-friendly message if available, otherwise fall back to standard error messages
      const errorMessage = error.userMessage 
        || error.response?.data?.error?.message 
        || error.response?.data?.errorMessage 
        || error.message 
        || 'Failed to update theme color';
      throw new Error(errorMessage);
    }
  },

  getThemeColorConfig(colorId: string): ThemeColor {
    return themeColors.find(c => c.id === colorId) || themeColors[0];
  }
};

