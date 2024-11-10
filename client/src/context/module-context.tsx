"use client";


import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModuleContextProps {
  modules: {
    name: string;
    args: string[];
  }[],
  setModules: React.Dispatch<React.SetStateAction<{
    name: string;
    args: string[];
  }[]>>
}

const ModuleContext = createContext<ModuleContextProps | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modules, setModules] = useState<{
    name: string;
    args: string[];
  }[]>([]);

  return (
    <ModuleContext.Provider value={{ modules, setModules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModuleContext = (): ModuleContextProps => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModuleContext must be used within a ModuleProvider');
  }
  return context;
};