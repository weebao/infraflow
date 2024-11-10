"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const ProviderContext = createContext<{
  provider: string;
  setProvider: React.Dispatch<React.SetStateAction<string>>;
}>({
  provider: "",
  setProvider: () => {},
});

export const ProviderProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [provider, setProvider] = useState<string>("aws");

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error("useProvider must be used within a ProviderProvider");
  }
  return context;
}