import React, { Fragment } from "react";
import logo from "./static/images/nvadg_logo.png"
import { useRoutes, A } from "hookrouter";
import routes from "./router";
import PageNotFound from "./components/PageNotFound";

const header_style = {
  textAlign: "center",
};

function Shelterly() {
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
