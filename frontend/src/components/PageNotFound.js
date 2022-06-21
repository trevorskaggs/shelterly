import React from "react";

const PageNotFound = ({ cookies }) => (
  <h4 className="mt-3">
    {cookies.token ? "Page Not Found." : ""}
  </h4>
);

export default PageNotFound;
