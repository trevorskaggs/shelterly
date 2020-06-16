import React from "react";
import Home from "./Home";
import Evac, { NewTeam } from "./evac/Evac";
import Hotline, { NewOwner, NewReporter, NewServiceRequest, OwnerDetail, ReporterDetail, ServiceRequestDetail, ServiceRequestList, UpdateOwner, UpdateReporter, UpdateServiceRequest } from "./hotline/Hotline";
import { Login } from "./accounts/Accounts"

const routes = {
  "/": () => <Home />,
  "/evac": ({open}) => <Evac open={open} />,
  "/hotline": ({open}) => <Hotline open={open} />,
  "/login": () => <Login />,
};

export default routes;
