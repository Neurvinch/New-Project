import React from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/lib/providers";

const config = getDefaultConfig({
  appName: "suffix-man",
  projectId: "3f84877fb445dd3a1c6a2813dcfdb3d0",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      "https://worldchain-sepolia.g.alchemy.com/v2/Ljr9rV6foCZ6EDtKt6z-d2Kiy0ahFvLs",
    ),
  },
});
const { chains } = config;

const queryClient = new QueryClient();

const theme = darkTheme({
  accentColor: "#7b3fe4",
  accentColorForeground: "white",
  fontStack: "system",
  overlayBlur: "small",
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider {...config} theme={theme}>
          <ThemeProvider defaultTheme="dark">
            <App />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
