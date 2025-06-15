import React, { createContext, useContext, useState, useEffect } from "react";

// Options: "friendly", "neutral", "formal", customizable later by user profile or context
const DEFAULT_TONE = "neutral";

export const ToneContext = createContext();

export const ToneProvider = ({ children }) => {
  const [tone, setTone] = useState(DEFAULT_TONE);

  useEffect(() => {
    const localTone = localStorage.getItem("userTone");
    if (localTone) setTone(localTone);
  }, []);

  const updateTone = (newTone) => {
    setTone(newTone);
    localStorage.setItem("userTone", newTone);
  };

  return (
    <ToneContext.Provider value={{ tone, setTone: updateTone }}>
      {children}
    </ToneContext.Provider>
  );
};
