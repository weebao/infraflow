"use client";


import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModuleContextProps {
  moduleName: string;
  args: any;
  setModuleName: (name: string) => void;
  setArgs: (args: any) => void;
}

const ModuleContext = createContext<ModuleContextProps | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [moduleName, setModuleName] = useState<string>('');
  const [args, setArgs] = useState<any>({});

  return (
    <ModuleContext.Provider value={{ moduleName, args, setModuleName, setArgs }}>
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