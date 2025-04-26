// Type for React Native's allowed font weight values
type FontWeight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export const fonts = {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    weights: {
      regular: "normal" as FontWeight,
      medium: "500" as FontWeight,
      semibold: "600" as FontWeight,
      bold: "bold" as FontWeight,
    },
  };