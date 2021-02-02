import React from "react";
import { Redirect } from "raviger";
import Home from "./Home";
import AnimalForm from "./animals/AnimalForm";
import AnimalDetails from "./animals/AnimalDetails";
import AnimalSearch from "./animals/AnimalSearch";
import Deploy from "./dispatch/DispatchMap";
import DispatchSummary from "./dispatch/DispatchSummary";
import DispatchResolutionForm from "./dispatch/DispatchResolutionForm";
import DispatchTeamMemberForm from "./dispatch/DispatchTeamMemberForm";
import Dispatch from "./dispatch/Dispatch";
import DispatchAssignmentSearch from "./dispatch/DispatchAssignmentSearch"
import StepperWorkflow, { initialWorkflowData } from "./components/StepperWorkflow";
import Hotline from "./hotline/Hotline";
import ServiceRequestDetails from "./hotline/ServiceRequestDetails";
import ServiceRequestForm from "./hotline/ServiceRequestForm";
import ServiceRequestSearch from "./hotline/ServiceRequestSearch";
import PersonDetails from "./people/PersonDetails";
import PersonForm from "./people/PersonForm";
import PersonSearch from "./people/PersonSearch";
import OwnerContactForm from "./people/OwnerContactForm";
import Intake from "./intake/Intake";
import Shelter, { NewShelter, UpdateShelter } from "./shelter/Shelter";
import { ShelterAssignment } from "./shelter/ShelterAssignment";
import { ShelterDetails } from "./shelter/ShelterDetails"
import { NewBuilding, UpdateBuilding, BuildingDetails } from "./shelter/Building";
import { NewRoom, UpdateRoom, RoomDetails } from "./shelter/Room";
import { Login } from "./accounts/Accounts";
import VisitNoteForm from "./dispatch/VisitNoteForm";

export const publicRoutes = {
  "/login": () => <Login />,
}

const routes = {
  "/": () => <Home />,
  "/animals/edit/:id": ({id}) => <AnimalForm id={id} state={initialWorkflowData} />,
  "/animals/new": () => <AnimalForm state={initialWorkflowData} />,
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
  "/hotline/ownercontact/new": () => <OwnerContactForm />,
  "/hotline/ownercontact/:id": ({id}) => <OwnerContactForm id={id} />,
  "/hotline/servicerequest/edit/:id": ({id}) => <ServiceRequestForm id={id} state={initialWorkflowData} />,
  "/hotline/servicerequest/search": () => <ServiceRequestSearch />,
  "/hotline/servicerequest/:id": ({id}) => <ServiceRequestDetails id={id} />,
  "/hotline/workflow/*": () => <StepperWorkflow />,
  "/intake": () => <Intake />,
  "/intake/owner/search": () => <PersonSearch />,
  "/intake/workflow/*": () => <StepperWorkflow />,
  "/people/owner/edit/:id": ({id}) => <PersonForm id={id} state={initialWorkflowData} />,
  "/people/owner/new": () => <PersonForm state={initialWorkflowData} />,
  "/people/owner/:id": ({id}) => <PersonDetails id={id} />,
  "/people/reporter/edit/:id": ({id}) => <PersonForm id={id} state={initialWorkflowData} />,
  "/people/reporter/new": () => <PersonForm state={initialWorkflowData} />,
  "/people/reporter/:id": ({id}) => <PersonDetails id={id}/>,
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
