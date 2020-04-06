import React from "react";
import Home from "./Home";
import EvacHome, {NewTeam, TeamList, NewTeamMember} from "./evac/Evac";

const routes = {
  "/": () => <Home />,
  "/evac": () => <EvacHome />,
  "/evac/evacteam/new": () => <NewTeam />,
  "/evac/evacteam/list": () => <TeamList />,
  "/evac/teammember/new": () => <NewTeamMember />,
};

export default routes;
