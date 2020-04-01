import React, { Fragment } from "react";
import logo from "./static/images/nvadg_logo.png"
import { useRoutes, A } from "hookrouter";
import Home from "./Home";
import Evac from "./Evac";

const style = {
  textAlign: "center",
};

const routes = {
  "/": () => <Home />,
  "/evac": () => <Evac />,
};

function App() {
  const routeResult = useRoutes(routes);
  return (
      <div>
        <h1 style={style} class="col-12">
        <A href="/"><img src={logo} alt=""/></A>
        </h1>
        <hr class="mt-0 mb-4"/>
        <Fragment>
          {routeResult}
        </Fragment>
      </div>
  );
}

export default App;