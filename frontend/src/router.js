import React from "react";
import { Redirect } from "raviger";
import Home from "./Home";
import AnimalForm from "./animals/AnimalForm"
import AnimalDetails from "./animals/AnimalDetails"
import AnimalSearch from "./animals/AnimalSearch"
import Dispatch from "./dispatch/Dispatch";
import DispatchAssignmentSearch from "./dispatch/DispatchAssignmentSearch"
import HotlineWorkflow from "./hotline/HotlineWorkflow";
import Hotline, { ServiceRequestDetail, UpdateServiceRequest } from "./hotline/Hotline";
import { ServiceRequestSearch } from "./hotline/HotlineTables"
import { NewOwner, NewOwnerContact, NewReporter, OwnerDetail, ReporterDetail,  UpdateOwner, UpdateOwnerContact, UpdateReporter } from "./people/People";
import Intake, { OwnerSearch } from "./intake/Intake";
import Shelter, { NewShelter, UpdateShelter } from "./shelter/Shelter";
import { ShelterAssignment } from "./shelter/ShelterAssignment";
import { ShelterDetails } from "./shelter/ShelterDetails"
import { NewBuilding, UpdateBuilding, BuildingDetails } from "./shelter/Building";
import { NewRoom, UpdateRoom, RoomDetails } from "./shelter/Room";
import { Login } from "./accounts/Accounts";
import Deploy from "./dispatch/DispatchMap";
import DispatchSummary from "./dispatch/DispatchSummary";
import DispatchResolutionForm from "./dispatch/DispatchResolutionForm";
import DispatchTeamMemberForm from "./dispatch/DispatchTeamMemberForm";
import VisitNoteForm from "./dispatch/VisitNoteForm";
import { initialData } from "./hotline/HotlineWorkflow";

export const publicRoutes = {
  "/login": () => <Login />,
}

const routes = {
  "/": () => <Home />,
  "/animals/edit/:id": ({id}) => <AnimalForm id={id} state={initialData} />,
  "/animals/new": () => <AnimalForm state={initialData} />,
  "/animals/search": () => <AnimalSearch />,
  "/animals/:id": ({id}) => <AnimalDetails id={id} />,
  "/dispatch": () => <Dispatch />,
  "/dispatch/dispatchteammember/new": () => <DispatchTeamMemberForm />,
  "/dispatch/dispatchuationassignment/search": () => <DispatchAssignmentSearch />,
  "/dispatch/summary/:id": ({id}) => <DispatchSummary id={id} />,
  "/dispatch/resolution/:id": ({id}) => <DispatchResolutionForm id={id} />,
  "/dispatch/assignment/note/:id": ({id}) => <VisitNoteForm id={id} />,
  "/dispatch/deploy": () => <Deploy />,
  "/hotline": () => <Hotline />,

  "/hotline/first_responder/new": () => <NewReporter />,
  "/hotline/owner/edit/:id": ({id}) => <UpdateOwner id={id} />,
  "/hotline/owner/new": () => <NewOwner />,
  "/hotline/owner/:id": ({id}) => <OwnerDetail id={id} />,
  "/hotline/ownercontact/new": () => <NewOwnerContact />,
  "/hotline/ownercontact/:id": ({id}) => <UpdateOwnerContact id={id}/>,
  "/hotline/reporter/edit/:id": ({id}) => <UpdateReporter id={id} />,
  "/hotline/reporter/new": () => <NewReporter />,
  "/hotline/reporter/:id": ({id}) => <ReporterDetail id={id}/>,
  "/hotline/servicerequest/edit/:id": ({id}) => <UpdateServiceRequest id={id}/>,
  "/hotline/servicerequest/search": () => <ServiceRequestSearch />,
  "/hotline/servicerequest/:id": ({id}) => <ServiceRequestDetail id={id} />,
  "/hotline/workflow/*": () => <HotlineWorkflow />,
  "/intake": () => <Intake />,
  "/intake/owner/search": () => <OwnerSearch />,
  "/intake/workflow/*": () => <HotlineWorkflow />,
  "/shelter": () => <Shelter />,
  "/shelter/new": () => <NewShelter />,
  "/shelter/edit/:id": ({id}) => <UpdateShelter id={id} />,
  "/shelter/:id": ({id}) => <ShelterDetails id={id} />,
  "/shelter/:id/assign": ({id}) => <ShelterAssignment id={id} />,
  "/shelter/building/new": () => <NewBuilding />,
  "/shelter/building/edit/:id": ({id}) => <UpdateBuilding id={id} />,
  "/shelter/building/:id": ({id}) => <BuildingDetails id={id} />,
  "/shelter/building/room/new": () => <NewRoom />,
  "/shelter/room/edit/:id": ({id}) => <UpdateRoom id={id} />,
  "/shelter/room/:id": ({id}) => <RoomDetails id={id} />,
  "/login": () => <Redirect to='/' />
};

export default routes;
