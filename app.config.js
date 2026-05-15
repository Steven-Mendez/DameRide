require('dotenv/config');

module.exports = {
  expo: {
    name: 'DameRide',
    slug: 'DameRide',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'dameride',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.stevenmendez.dameride',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'DameRide usa tu ubicación para seleccionar puntos en el mapa.',
      },
    },
    android: {
      package: 'com.stevenmendez.dameride',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'DameRide usa tu ubicación para seleccionar puntos en el mapa.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'DameRide necesita acceso a tus fotos para subir imagenes de tus vehiculos.',
          cameraPermission:
            'DameRide necesita acceso a la camara para tomar fotos de tus vehiculos.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#F8F4EB',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      '@react-native-community/datetimepicker',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
