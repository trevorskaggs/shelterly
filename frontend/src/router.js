import React from "react";
import Home from "./Home";
import Evac, { NewTeam, TeamList } from "./evac/Evac";
import Hotline, { NewOwner, NewReporter } from "./hotline/Hotline";
import { Login } from "./accounts/Accounts"

const routes = {
  "/": () => <Home />,
  "/evac": () => <Evac />,
  "/evac/evacteam/new": () => <NewTeam />,
  "/evac/evacteam/list": () => <TeamList />,
  "/hotline": () => <Hotline />,
  "/hotline/owner/new": () => <NewOwner />,
  "/hotline/reporter/new": () => <NewReporter />,
  "/login": () => <Login />,
};

export default routes;
