import React from "react";
import Home from "./Home";
import Animals, { AnimalDetail, NewAnimal, UpdateAnimal } from "./animals/Animals"
import { AnimalSearch } from "./animals/AnimalTables"
import Evac, { NewTeam, TeamList } from "./evac/Evac";
import Hotline, { NewServiceRequest, ServiceRequestDetail, ServiceRequestList, UpdateServiceRequest } from "./hotline/Hotline";
import Intake, { IntakeSummary } from "./intake/Intake";
import { NewOwner, NewReporter, OwnerDetail, ReporterDetail,  UpdateOwner, UpdateReporter } from "./people/People";
import { Login } from "./accounts/Accounts"
import { EvacTeamTable } from "./evac/EvacTables";
import { EvacTeamForm } from "./evac/EvacForms";

const routes = {
  "/": () => <Home />,
  "/animals": () => <Animals />,
  "/animals/animal/edit/:id": ({id}) => <UpdateAnimal id={id} />,
  "/animals/animal/new": () => <NewAnimal />,
  "/animals/search": () => <AnimalSearch />,
  "/animals/animal/:id": ({id}) => <AnimalDetail id={id} />,
  "/evac": () => <Evac />,
  "/evac/evacteam/new": () => <EvacTeamForm />,
  "/evac/evacteam/list": () => <EvacTeamTable />,
  "/hotline": () => <Hotline />,
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
  "/intake": () => <Intake />,
  "/intake/owner/new": () => <NewOwner />,
  "/intake/reporter/new": () => <NewReporter />,
  "/intake/summary": () => <IntakeSummary />,
  "/login": () => <Login />,
};

export default routes;
