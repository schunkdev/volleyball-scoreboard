export interface Theme {
  id: string;
  name: string;
  colors: {
    bg: string;
    bgSecondary: string;
    primary: string;
    primaryMuted: string;
    primaryContrast: string;
    secondary: string;
    secondaryMuted: string;
    secondaryContrast: string;
    surface: string;
    surfaceVariant: string;
    onSurface: string;
    onSurfaceVariant: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'stadium-dark',
    name: 'Stadium Dark',
    colors: {
      bg: '#0c0e12',
      bgSecondary: '#111318',
      primary: '#81e9ff',
      primaryMuted: 'rgba(129, 233, 255, 0.2)',
      primaryContrast: '#005561',
      secondary: '#ff7346',
      secondaryMuted: 'rgba(255, 115, 70, 0.2)',
      secondaryContrast: '#420d00',
      surface: '#1a1c22',
      surfaceVariant: '#2a2d35',
      onSurface: '#ffffff',
      onSurfaceVariant: 'rgba(255, 255, 255, 0.4)',
    }
  },
  {
    id: 'volley-tracker',
    name: 'Volley Tracker',
    colors: {
      bg: '#0f1108',
      bgSecondary: '#14170b',
      primary: '#a3e635',
      primaryMuted: 'rgba(163, 230, 53, 0.2)',
      primaryContrast: '#1a2e05',
      secondary: '#fb7185',
      secondaryMuted: 'rgba(251, 113, 133, 0.2)',
      secondaryContrast: '#4c0519',
      surface: '#1c1f12',
      surfaceVariant: '#2d331d',
      onSurface: '#f7fee7',
      onSurfaceVariant: 'rgba(247, 254, 231, 0.4)',
    }
  },
  {
    id: 'midnight-court',
    name: 'Midnight Court',
    colors: {
      bg: '#020617',
      bgSecondary: '#0f172a',
      primary: '#818cf8',
      primaryMuted: 'rgba(129, 140, 248, 0.2)',
      primaryContrast: '#1e1b4b',
      secondary: '#f472b6',
      secondaryMuted: 'rgba(244, 114, 182, 0.2)',
      secondaryContrast: '#500724',
      surface: '#1e293b',
      surfaceVariant: '#334155',
      onSurface: '#f8fafc',
      onSurfaceVariant: 'rgba(248, 250, 252, 0.4)',
    }
  }
];
