import React from "react";
import Home from "./Home";
import Evac, {NewTeam, TeamList, NewTeamMember} from "./evac/Evac";
import {Login} from "./accounts/Accounts"

const routes = {
  "/": () => <Home />,
  "/evac": () => <Evac />,
  "/evac/evacteam/new": () => <NewTeam />,
  "/evac/evacteam/list": () => <TeamList />,
  "/evac/teammember/new": () => <NewTeamMember />,
  "/login": () => <Login />,
};

export default routes;
