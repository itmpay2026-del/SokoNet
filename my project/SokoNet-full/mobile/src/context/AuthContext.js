/**
 * Mobile Auth Context
 * Manages authentication for React Native app
 */

import React, { createContext } from 'react';

export const MobileAuthCtx = createContext();

export default function AuthContext({ children }) {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'SET_TOKEN':
          return { ...prevState, userToken: action.payload };
        case 'SET_USER':
          return { ...prevState, user: action.payload };
        case 'CLEAR':
          return { userToken: null, user: null };
      }
    },
    {
      userToken: null,
      user: null
    }
  );

  return (
    <MobileAuthCtx.Provider value={{ state, dispatch }}>
      {children}
    </MobileAuthCtx.Provider>
  );
}
