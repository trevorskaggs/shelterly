import React from "react";
import Home from "./Home";
import Evac, { NewTeam, TeamList } from "./evac/Evac";
import { Login } from "./accounts/Accounts"

const routes = {
  "/": () => <Home />,
  "/evac": () => <Evac />,
  "/evac/evacteam/new": () => <NewTeam />,
  "/evac/evacteam/list": () => <TeamList />,
  "/login": () => <Login />,
};

export default routes;
