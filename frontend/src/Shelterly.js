import React, {Fragment, useEffect, useState} from "react";
import logo from "./static/images/nvadg_logo.png"
import {navigate, useRoutes, A, Redirect} from "hookrouter";
import routes from "./router";
import PageNotFound from "./components/PageNotFound";
import {loadUser, logoutUser} from "./accounts/Accounts";

const header_style = {
  textAlign: "center",
};

function Shelterly() {
  //   InitialState = {
  //     logged_in: localStorage.getItem('token') ? true : false,
  //     username: ''
  //   };

  // Initial login state.
  const [user, setUser] = useState(false);
  // const [data, setData] = useState({logged_in:false, user:{}});
  useEffect(() => {
    let user_status = loadUser();
    user_status.then(function(results){
      console.log(results.data);
      setUser(results.data);
    })
    .catch(e => {
      console.log('fail');
      setUser(false);
    })
    // setData(localStorage.getItem('token') ? true : false);
    console.log("token "+localStorage.getItem('token'));
  }, []);

  // Redirect to login page if user is logged out.
  if (!user) {
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
  <button onClick={logoutUser}>logout {user.username}</button>
      </div>
    </div>
  );
}

export default Shelterly;
