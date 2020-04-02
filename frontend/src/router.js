import React from "react";
import Home from "./Home";
import Evac, {NewTeam, TeamList, NewTeamMember} from "./evac/Evac";

const routes = {
    "/": () => <Home />,
    "/evac": () => <Evac />,
    "/evac/evacteam/new": () => <NewTeam />,
    "/evac/evacteam/list": () => <TeamList />,
    "/evac/teammember/new": () => <NewTeamMember />,
  };

export default routes;
