module.exports = {
  name: "HearMeOut",
  slug: "hearmeout",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "hearmeout", // This is the necessary scheme for Expo linking
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.hearmeout"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon/foreground.png",
      backgroundColor: "#ffffff"
    },
    package: "com.yourcompany.hearmeout"
  },
  web: {
    favicon: "./assets/favicon.png",
    icons: [
      {
        src: "./assets/pwa/chrome-icon/chrome-icon-144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "./assets/pwa/chrome-icon/chrome-icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "./assets/pwa/chrome-icon/chrome-icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  },
  plugins: [
    "expo-router"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    fonts: ["./assets/fonts/SpaceMono-Regular.ttf"],
    eas: {
      projectId: "08f04172-fa4a-4ff5-82ef-02b81eed02f2"
    }
  },
  // Enable React Native's New Architecture
  newArchEnabled: true
}; 