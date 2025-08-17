
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        testBlue:"#14171A"
      },
      screens: {
        // xs: "475px", // Custom breakpoint for extra small screens
        xxl: "1440px", // Override or add larger breakpoints
      }
    },
  },
  plugins: [],
}

export default config
