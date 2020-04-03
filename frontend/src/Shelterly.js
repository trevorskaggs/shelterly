import React, { Fragment } from "react";
import logo from "./static/images/nvadg_logo.png"
import { useRoutes, A } from "hookrouter";
import routes from "./router";

const style = {
  textAlign: "center",
};

function App() {
  const routeResult = useRoutes(routes);
  return (
      <div>
        <h1 style={style} className="col-12">
        <A href="/"><img src={logo} alt=""/></A>
        </h1>
        <hr className="mt-0 mb-4"/>
        <Fragment>
          {routeResult}
        </Fragment>
      </div>
  );
}

export default App;
