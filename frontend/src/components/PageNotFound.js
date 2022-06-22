import React from "react";

const PageNotFound = ({ state }) => (
  <h4 className="mt-3">
    {state.isAuthenticated ? "Page Not Found." : ""}
  </h4>
);

export default PageNotFound;
