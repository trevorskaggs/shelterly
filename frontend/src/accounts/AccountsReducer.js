import React, { useCallback, useEffect, useReducer } from "react";
import { navigate, useLocationChange, usePath, useQueryParams } from 'raviger';
import { useCookies } from 'react-cookie';
import { loadUser, setAuthToken } from "./AccountsUtils";
import { publicRoutes } from "../router";

const initialState = {
  isAuthenticated: null,
  isLoading: false,
  logout: false,
  user: null,
  incident: '',
  organization: {id:'', name:''},
  errors: {},
  location:'',
  prevLocation: '',
};

function auth_reducer(state, action) {

  switch (action.type) {

    case 'USER_LOADING':
      return {...state, isLoading: true};

    case 'USER_LOADED':
      return {...state, isAuthenticated: true, isLoading: false, logout: false, user: action.user};

    case 'LOGIN_SUCCESSFUL':
      return {...state, user:action.data.user, isAuthenticated: true, isLoading: false, errors: null};

    case 'LOGOUT_SUCCESSFUL':
      return {...state, errors: action.data, user: null, incident: '', organization: {id:'', name:''},
        isAuthenticated: false, isLoading: false, logout: true};

    case 'AUTHENTICATION_ERROR':
    case 'LOGIN_FAILED':
    case 'LOGOUT_FAILED':
      return {...state, errors: action.data, user: null,
        isAuthenticated: false, isLoading: false};

    case 'PAGE_CHANGED':
      return {...state, prevLocation: state.location.path, location:action.data};

    case 'SET_INCIDENT':
      return {...state, incident: action.data};

    case 'SET_ORGANIZATION':
      return {...state, organization: action.data};

    default:
      return state;
  }
}

// Create global state using react context.
const AuthContext = React.createContext(initialState);

function AuthProvider(props) {

  // Identify any query param data.
  const [queryParams] = useQueryParams();
  const {
    next = '/',
  } = queryParams;

  const [cookies, , removeCookie] = useCookies(['token']);
  const [state, dispatch] = useReducer(auth_reducer, initialState);

  cookies.token ? setAuthToken(cookies.token, cookies.csrftoken) : setAuthToken();

  const path = usePath();
  const org_slug = path.split('/')[1];

  // Keep track of current and previous locations.
  const onChange = useCallback(path => dispatch({type: "PAGE_CHANGED", data: path}), []);
  useLocationChange(onChange);

  useEffect(() => {

    // Called when user switches back to Shelterly.
    const onFocus = () => {
      // Only recheck user auth if in a private route.
      if (!Object.keys(publicRoutes).includes(path)) {
        loadUser({dispatch, removeCookie, path});
      }
    };

    // Check for user auth on focus.
    window.addEventListener("focus", onFocus);

    // Redirect user if they attempt to access an Organization they aren't a member of.
    if (!Object.keys(publicRoutes).includes(path) && state.user && path !== '/' && !state.user.org_slugs.includes(org_slug)) {
      navigate("/");
    }

    // Redirect to next or Home if attempting to access LoginForm while logged in.
    if (state.user && path === '/login') {
      navigate(next);
    }
    // If we have a token but no user, attempt to authenticate them.
    else if (!state.user && cookies.token) {
      loadUser({dispatch, removeCookie, path});
    }
    // Redirect to login page if no authenticated user object is present.
    else if (!Object.keys(publicRoutes).includes(path) && !state.user && !cookies.token) {
      if (state.logout) {
        navigate('/login');
      }
      else {
        navigate('/login?next=' + path);
      }
    }
    return () => {
      window.removeEventListener("focus", onFocus);
  };
  }, [path, state.user, cookies.token, removeCookie, next]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export {AuthContext, AuthProvider}
