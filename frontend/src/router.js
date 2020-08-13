import React from "react";
import Home from "./Home";
import Animals, { AnimalDetail, NewAnimal, UpdateAnimal } from "./animals/Animals"
import { AnimalSearchList } from "./animals/Animals"
import Evac, { NewTeam, TeamList } from "./evac/Evac";
import Hotline, { NewOwner, NewReporter, NewServiceRequest, OwnerDetail, ReporterDetail, ServiceRequestDetail, ServiceRequestList, UpdateOwner, UpdateReporter, UpdateServiceRequest } from "./hotline/Hotline";
import { Login } from "./accounts/Accounts"
import { EvacTeamTable } from "./evac/EvacTables";
import { EvacTeamForm } from "./evac/EvacForms";

const routes = {
  "/": () => <Home />,
  "/animals": () => <Animals />,
  "/animals/animal/edit/:id": ({id}) => <UpdateAnimal id={id} />,
  "/animals/animal/new": () => <NewAnimal />,
  "/animals/search": () => <AnimalSearchList />,
  "/animals/animal/:id": ({id}) => <AnimalDetail id={id} />,
  "/evac": () => <Evac />,
  "/evac/evacteam/new": () => <EvacTeamForm />,
  "/evac/evacteam/list": () => <EvacTeamTable />,
  "/hotline": () => <Hotline />,
  "/hotline/first_responder/new": () => <NewReporter />,
  "/hotline/owner/edit/:id": ({id}) => <UpdateOwner id={id}/>,
  "/hotline/owner/new": () => <NewOwner />,
  "/hotline/owner/:id": ({id}) => <OwnerDetail id={id}/>,
  "/hotline/reporter/edit/:id": ({id}) => <UpdateReporter id={id}/>,
  "/hotline/reporter/new": () => <NewReporter />,
  "/hotline/reporter/:id": ({id}) => <ReporterDetail id={id}/>,
  "/hotline/servicerequest/edit/:id": ({id}) => <UpdateServiceRequest id={id}/>,
  "/hotline/servicerequest/list": () => <ServiceRequestList />,
  "/hotline/servicerequest/new": () => <NewServiceRequest />,
  "/hotline/servicerequest/:id": ({id}) => <ServiceRequestDetail id={id}/>,
  "/login": () => <Login />,
};

export default routes;
