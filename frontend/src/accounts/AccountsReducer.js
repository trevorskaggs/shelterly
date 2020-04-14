import React, {useReducer} from "react";
import {setAuthToken} from "./AccountsUtils";

const initialState = {
  token: null,
  isAuthenticated: null,
  isLoading: false,
  user: null,
  errors: {},
};

function auth_reducer(state, action) {

  switch (action.type) {

    case 'USER_LOADING':
      return {...state, isLoading: true};

    case 'USER_LOADED':
      return {...state, isAuthenticated: true, isLoading: false, user: action.user};

    case 'LOGIN_SUCCESSFUL':
      // localStorage.setItem("token", action.data.token);
      setAuthToken(action.data.token);
      return {...state, ...action.data, isAuthenticated: true, isLoading: false, errors: null};

    case 'AUTHENTICATION_ERROR':
    case 'LOGIN_FAILED':
    case 'LOGOUT_SUCCESSFUL':
    case 'LOGOUT_FAILED':
      // localStorage.removeItem("token");
      setAuthToken();
      return {...state, errors: action.data, token: null, user: null,
        isAuthenticated: false, isLoading: false};

    default:
      return state;
  }
}

const AuthContext = React.createContext(initialState);

function AuthProvider(props) {
  const [state, dispatch] = useReducer(auth_reducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export {AuthContext, AuthProvider}
