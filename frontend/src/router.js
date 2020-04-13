import React from "react";
import Home from "./Home";
import Evac, {NewTeam, TeamList, NewTeamMember} from "./evac/Evac";
import Animals from "./animals/Animals"
import AnimalForm from "./animals/AnimalForms"
import AnimalTable from "./animals/AnimalTables"

const routes = {
  "/": () => <Home />,
  "/evac": () => <Evac />,
  "/evac/evacteam/new": () => <NewTeam />,
  "/evac/evacteam/list": () => <TeamList />,
  "/evac/teammember/new": () => <NewTeamMember />,
  "/animals": () => <Animals />,
  "/animals/list": () => <AnimalTable />,
  "/animals/add": () => <AnimalForm />,
};

export default routes;
