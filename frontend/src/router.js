import React from "react";
import Home from "./Home";
import Evac, { NewTeam, TeamList } from "./evac/Evac";
import Hotline, { NewOwner } from "./hotline/Hotline";
import { Login } from "./accounts/Accounts"

const routes = {
  "/": () => <Home />,
  "/evac": () => <Evac />,
  "/evac/evacteam/new": () => <NewTeam />,
  "/evac/evacteam/list": () => <TeamList />,
  "/hotline": () => <Hotline />,
  "/hotline/owner/new": () => <NewOwner />,
  "/login": () => <Login />,
};

export default routes;
