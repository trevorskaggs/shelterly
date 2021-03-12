import React from "react";
import { Redirect } from "raviger";
import Home from "./Home";
import Login from "./accounts/LoginForm";
import PasswordReset from "./accounts/PasswordReset";
import AnimalForm from "./animals/AnimalForm";
import AnimalDetails from "./animals/AnimalDetails";
import AnimalSearch from "./animals/AnimalSearch";
import Deploy from "./dispatch/DispatchMap";
import DispatchSummary from "./dispatch/DispatchSummary";
import DispatchResolutionForm from "./dispatch/DispatchResolutionForm";
import DispatchTeamMemberForm from "./dispatch/DispatchTeamMemberForm";
import Dispatch from "./dispatch/Dispatch";
import DispatchAssignmentSearch from "./dispatch/DispatchSearch"
import StepperWorkflow, { initialWorkflowData } from "./components/StepperWorkflow";
import Hotline from "./hotline/Hotline";
import ServiceRequestDispatchAssignment from "./hotline/ServiceRequestDispatchAssignment"
import ServiceRequestDetails from "./hotline/ServiceRequestDetails";
import ServiceRequestForm from "./hotline/ServiceRequestForm";
import ServiceRequestSearch from "./hotline/ServiceRequestSearch";
import PersonDetails from "./people/PersonDetails";
import PersonForm from "./people/PersonForm";
import PersonSearch from "./people/PersonSearch";
import OwnerContactForm from "./people/OwnerContactForm";
import Shelter from "./shelter/Shelter";
import ShelterForm from "./shelter/ShelterForm";
import ShelterRoomAssignment from "./shelter/ShelterRoomAssignment";
import ShelterDetails from "./shelter/ShelterDetails";
import BuildingForm from "./shelter/BuildingForm";
import BuildingDetails from "./shelter/BuildingDetails";
import RoomForm from "./shelter/RoomForm";
import RoomDetails from "./shelter/RoomDetails";
import VisitNoteForm from "./dispatch/VisitNoteForm";

export const publicRoutes = {
  "/login": () => <Login />,
  "/reset_password": () => <PasswordReset />,
}

const routes = {
  "/": () => <Home />,
  "/animals/edit/:id": ({id}) => <AnimalForm id={id} state={initialWorkflowData} />,
  "/animals/new": () => <AnimalForm state={initialWorkflowData} />,
  "/animals/search": () => <AnimalSearch />,
  "/animals/:id": ({id}) => <AnimalDetails id={id} />,
  "/dispatch": () => <Dispatch />,
  "/dispatch/dispatchteammember/new": () => <DispatchTeamMemberForm />,
  "/dispatch/dispatchassignment/search": () => <DispatchAssignmentSearch />,
  "/dispatch/summary/:id": ({id}) => <DispatchSummary id={id} />,
  "/dispatch/resolution/:id": ({id}) => <DispatchResolutionForm id={id} />,
  "/dispatch/assignment/note/:id": ({id}) => <VisitNoteForm id={id} />,
  "/dispatch/deploy": () => <Deploy />,
  "/hotline": () => <Hotline />,
  "/hotline/servicerequest/:id/assign": ({id}) => <ServiceRequestDispatchAssignment id={id} />,
  "/hotline/ownercontact/new": () => <OwnerContactForm />,
  "/hotline/ownercontact/:id": ({id}) => <OwnerContactForm id={id} />,
  "/hotline/servicerequest/edit/:id": ({id}) => <ServiceRequestForm id={id} state={initialWorkflowData} />,
  "/hotline/servicerequest/search": () => <ServiceRequestSearch />,
  "/hotline/servicerequest/:id": ({id}) => <ServiceRequestDetails id={id} />,
  "/hotline/workflow/*": () => <StepperWorkflow />,
  "/intake/workflow/*": () => <StepperWorkflow />,
  "/people/owner/edit/:id": ({id}) => <PersonForm id={id} state={initialWorkflowData} />,
  "/people/owner/new": () => <PersonForm state={initialWorkflowData} />,
  "/people/owner/search": () => <PersonSearch />,
  "/people/owner/:id": ({id}) => <PersonDetails id={id} />,
  "/people/reporter/edit/:id": ({id}) => <PersonForm id={id} state={initialWorkflowData} />,
  "/people/reporter/new": () => <PersonForm state={initialWorkflowData} />,
  "/people/reporter/:id": ({id}) => <PersonDetails id={id}/>,
  "/shelter": () => <Shelter />,
  "/shelter/new": () => <ShelterForm />,
  "/shelter/edit/:id": ({id}) => <ShelterForm id={id} />,
  "/shelter/:id": ({id}) => <ShelterDetails id={id} />,
  "/shelter/:id/assign": ({id}) => <ShelterRoomAssignment id={id} />,
  "/shelter/building/new": () => <BuildingForm />,
  "/shelter/building/edit/:id": ({id}) => <BuildingForm id={id} />,
  "/shelter/building/:id": ({id}) => <BuildingDetails id={id} />,
  "/shelter/building/room/new": () => <RoomForm />,
  "/shelter/room/edit/:id": ({id}) => <RoomForm id={id} />,
  "/shelter/room/:id": ({id}) => <RoomDetails id={id} />,
  "/login": () => <Redirect to='/' />
};

export default routes;
