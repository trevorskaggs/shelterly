import React, {Fragment, useEffect, useReducer} from "react";
import logo from "./static/images/nvadg_logo.png"
import {navigate, useRoutes, A} from "hookrouter";
import routes from "./router";
import PageNotFound from "./components/PageNotFound";
import {loadUser, logoutUser} from "./accounts/Accounts";
import auth from "./accounts/AccountsReducer";
import setAuthToken from "./accounts/setAuthToken";

const header_style = {
  textAlign: "center",
};

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  user: null,
  errors: {},
};

if (localStorage.getItem('token')) setAuthToken(localStorage.getItem('token'));

function Shelterly() {
  //   InitialState = {
  //     logged_in: localStorage.getItem('token') ? true : false,
  //     username: ''
  //   };

  // Initial login state.
  const [state, dispatch] = useReducer(auth, initialState);
  // const UserContext = React.createContext(initialState);
  // const [user, setUser] = useState(null);
  // const [logged_in, setData] = useState(false);
  useEffect(() => {
    let user_status = loadUser();
    user_status.then(function(results){
      console.log(results.data);
      dispatch({type: 'USER_LOADED', user: results.data });
      // setUser(results.data);
      // setData(true)
    })
    .catch(e => {
      console.log('error: '+e);
      dispatch({type: "AUTHENTICATION_ERROR", data: e});
    })
    // setData(localStorage.getItem('token') ? true : false);
    console.log("token "+localStorage.getItem('token'));
  }, []);

  // Redirect to login page if user is logged out.
  if (!state.user) {
    console.log('logged out');
    navigate('/login');
  }
  const routeResult = useRoutes(routes);
  return (
    <div>
      <h1 style={header_style} className="col-12">
      <A href="/"><img src={logo} alt=""/></A>
      </h1>
      <hr className="mt-0 mb-4"/>
      <Fragment>
        {routeResult || <PageNotFound />}
      </Fragment>
      <div style={{textAlign: "right"}}>
      {state.isAuthenticated ? <button onClick={logoutUser}>logout {state.user.username}</button> : ''}
      </div>
    </div>
  );
}

export default Shelterly;
