import React, { Fragment, useEffect, useState } from "react";
import logo from "./static/images/nvadg_logo.png"
import { useRoutes, A } from "hookrouter";
import routes from "./router";
import PageNotFound from "./components/PageNotFound";
import {loadUser} from "./accounts/Accounts";

const header_style = {
  textAlign: "center",
};

function Shelterly() {
  //   InitialState = {
  //     logged_in: localStorage.getItem('token') ? true : false,
  //     username: ''
  //   };

  // Initial login state.
  const [logged_in, setData] = useState(false);
  // const [data, setData] = useState({logged_in:false, user:{}});
  useEffect(() => {
    // setData(loadUser());
    let user = loadUser();
    user.then(function(results){
      console.log(results);
    }).catch(e => {console.log('fail')})
    // console.log(localStorage.getItem('token'));
    // setData({logged_in:test, user:test})
    setData(localStorage.getItem('token') ? true : false);
    // setData(true);
    console.log(logged_in)
    // Store.dispatch(loadUser());
  }, [logged_in]);

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
    </div>
  );
}

export default Shelterly;
