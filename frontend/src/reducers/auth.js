const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  isLoading: true,
  user: null,
  errors: {},
};

export default function auth(state=initialState, action) {

  switch (action.type) {

    case 'USER_LOADING':
      return {...state, isLoading: true};

    case 'USER_LOADED':
      return {...state, isAuthenticated: true, isLoading: false, user: action.user};

    case 'LOGIN_SUCCESSFUL':
      localStorage.setItem("token", action.data.token);
      return {...state, ...action.data, isAuthenticated: true, isLoading: false, errors: null};

    case 'AUTHENTICATION_ERROR':
    case 'LOGIN_FAILED':
    case 'LOGOUT_SUCCESSFUL':
      localStorage.removeItem("token");
      return {...state, errors: action.data, token: null, user: null,
        isAuthenticated: false, isLoading: false};

    default:
      return state;
  }
}

export const loadUser = () => {
  return (dispatch, getState) => {
    dispatch({type: "USER_LOADING"});

    const token = getState().auth.token;

    let headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }
    return fetch("http://localhost:8000/accounts/api/user/", {headers, })
      .then(response => {
        if (response.status < 500) {
          return response.json().then(data => {
            return {status: response.status, data};
          })
        } else {
          console.log("Server Error!");
          throw response;
        }
      })
      .then(response => {
        if (response.status === 200) {
          dispatch({type: 'USER_LOADED', user: response.data });
          return response.data;
        } else if (response.status >= 400 && response.status < 500) {
          dispatch({type: "AUTHENTICATION_ERROR", data: response.data});
          throw response.data;
        }
      })
  }
}

// export const login = (username, password) => {
//   return (dispatch, getState) => {
//     let headers = {"Content-Type": "application/json"};
//     let body = JSON.stringify({username, password});

//     return fetch("http://localhost:8000/login", {headers, body, method: "POST"})
//       .then(response => {
//         if (response.status < 500) {
//           return response.json().then(data => {
//             return {status: response.status, data};
//           })
//         } else {
//           console.log("Server Error!");
//           throw response;
//         }
//       })
//       .then(response => {
//         if (response.status === 200) {
//           dispatch({type: 'LOGIN_SUCCESSFUL', data: response.data });
//           return response.data;
//         } else if (response.status === 403 || response.status === 401) {
//           dispatch({type: "AUTHENTICATION_ERROR", data: response.data});
//           throw response.data;
//         } else {
//           dispatch({type: "LOGIN_FAILED", data: response.data});
//           throw response.data;
//         }
//       })
//   }
// }
