import React from "react";
import Home from "./Home";
import Incident from "./Incident";
import IncidentForm from "./IncidentForm";
import LoginForm from "./accounts/LoginForm";
import PasswordReset from "./accounts/PasswordReset";
import UserForm from "./accounts/UserForm";
import UserManagement from "./accounts/UserManagement";
import AnimalForm from "./animals/AnimalForm";
import AnimalDetails from "./animals/AnimalDetails";
import AnimalSearch from "./animals/AnimalSearch";
import Deploy from "./dispatch/DispatchMap";
import DispatchSummary from "./dispatch/DispatchSummary";
import DispatchResolutionForm from "./dispatch/DispatchResolutionForm";
import DispatchTeamManagement from "./dispatch/DispatchTeamManagement";
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
import Reports from "./reports/Reports";
import Shelter from "./shelter/Shelter";
import ShelterIntakeSummary from "./shelter/ShelterIntakeSummary";
import ShelterForm from "./shelter/ShelterForm";
import ShelterIntake from "./shelter/ShelterIntake";
import ShelterRoomAssignment from "./shelter/ShelterRoomAssignment";
import ShelterDetails from "./shelter/ShelterDetails";
import BuildingForm from "./shelter/BuildingForm";
import BuildingDetails from "./shelter/BuildingDetails";
import RoomForm from "./shelter/RoomForm";
import RoomDetails from "./shelter/RoomDetails";
import VisitNoteForm from "./dispatch/VisitNoteForm";
import Organization from "./Organization";

export const publicRoutes = {
  "/login": () => <LoginForm />,
  "/reset_password": () => <PasswordReset />,
}

const routes = {
  "/": () => <Organization />,
  "/reset_password": () => <PasswordReset />,
  "/:organization": ({organization}) => <Incident organization={organization} />,
  "/:organization/:incident": ({incident}) => <Home incident={incident} />,
  "/:organization/incident/edit/:id": ({id, organization}) => <IncidentForm id={id} organization={organization} />,
  "/:organization/incident/new": ({organization}) => <IncidentForm organization={organization} />,
  "/:organization/:incident/accounts/user/new": ({incident}) => <UserForm incident={incident} />,
  "/:organization/:incident/accounts/user/edit/:id": ({id, incident}) => <UserForm id={id} incident={incident} />,
  "/:organization/:incident/accounts/user_management": ({incident}) => <UserManagement incident={incident} />,
  "/:organization/:incident/animals/edit/:id": ({id, incident}) => <AnimalForm id={id} state={initialWorkflowData} incident={incident} />,
  "/:organization/:incident/animals/new": ({incident}) => <AnimalForm state={initialWorkflowData} incident={incident} />,
  "/:organization/:incident/animals/search": ({incident}) => <AnimalSearch incident={incident} />,
  "/:organization/:incident/animals/:id": ({id, incident}) => <AnimalDetails id={id} incident={incident} />,
  "/:organization/:incident/dispatch": ({incident}) => <Dispatch incident={incident} />,
  "/:organization/:incident/dispatch/dispatchteammember/new": ({incident}) => <DispatchTeamMemberForm incident={incident} />,
  "/:organization/:incident/dispatch/dispatchteammember/edit/:id": ({id, incident}) => <DispatchTeamMemberForm id={id} incident={incident} />,
  "/:organization/:incident/dispatch/dispatchassignment/search": ({incident}) => <DispatchAssignmentSearch incident={incident} />,
  "/:organization/:incident/dispatch/summary/:id": ({id, incident}) => <DispatchSummary id={id} incident={incident} />,
  "/:organization/:incident/dispatch/resolution/:id": ({id, incident}) => <DispatchResolutionForm id={id} incident={incident} />,
  "/:organization/:incident/dispatch/assignment/note/:id": ({id, incident}) => <VisitNoteForm id={id} incident={incident} />,
  "/:organization/:incident/dispatch/deploy": ({incident}) => <Deploy incident={incident} />,
  "/:organization/:incident/dispatch/preplan": ({incident}) => <Deploy incident={incident} />,
  "/:organization/:incident/dispatch/teammanagement": ({incident}) => <DispatchTeamManagement incident={incident} />,
  "/:organization/:incident/hotline": ({incident}) => <Hotline incident={incident} />,
  "/:organization/:incident/hotline/servicerequest/:id/assign": ({id, incident}) => <ServiceRequestDispatchAssignment id={id} incident={incident} />,
  "/:organization/:incident/hotline/ownercontact/new": ({incident}) => <OwnerContactForm incident={incident} />,
  "/:organization/:incident/hotline/ownercontact/:id": ({id, incident}) => <OwnerContactForm id={id} incident={incident} />,
  "/:organization/:incident/hotline/servicerequest/edit/:id": ({id, incident}) => <ServiceRequestForm id={id} state={initialWorkflowData} incident={incident} />,
  "/:organization/:incident/hotline/servicerequest/search": ({incident}) => <ServiceRequestSearch incident={incident} />,
  "/:organization/:incident/hotline/servicerequest/:id": ({id, incident}) => <ServiceRequestDetails id={id} incident={incident} />,
  "/:organization/:incident/hotline/workflow/*": ({incident}) => <StepperWorkflow incident={incident} />,
  "/:organization/:incident/intake/workflow/*": ({incident}) => <StepperWorkflow incident={incident} />,
  "/:organization/:incident/shelter/:id/intake": ({id, incident}) => <ShelterIntake id={id} incident={incident} />,
  "/:organization/:incident/people/owner/edit/:id": ({id, incident}) => <PersonForm id={id} state={initialWorkflowData} incident={incident} />,
  "/:organization/:incident/people/owner/new": ({incident}) => <PersonForm state={initialWorkflowData} incident={incident} />,
  "/:organization/:incident/people/owner/search": ({incident}) => <PersonSearch incident={incident} />,
  "/:organization/:incident/people/owner/:id": ({id, incident}) => <PersonDetails id={id} incident={incident} />,
  "/:organization/:incident/people/reporter/edit/:id": ({id, incident}) => <PersonForm id={id} incident={incident} state={initialWorkflowData} />,
  "/:organization/:incident/people/reporter/new": ({incident}) => <PersonForm state={initialWorkflowData} incident={incident} />,
  "/:organization/:incident/people/reporter/:id": ({id, incident}) => <PersonDetails id={id} incident={incident} />,
  "/:organization/:incident/reports": ({incident}) => <Reports incident={incident} />,
  "/:organization/:incident/shelter": ({incident}) => <Shelter incident={incident} />,
  "/:organization/:incident/shelter/new": ({incident}) => <ShelterForm incident={incident} />,
  "/:organization/:incident/shelter/edit/:id": ({id, incident}) => <ShelterForm id={id} incident={incident} />,
  "/:organization/:incident/shelter/:id": ({id, incident}) => <ShelterDetails id={id} incident={incident} />,
  "/:organization/:incident/shelter/intakesummary/:id": ({id, incident}) => <ShelterIntakeSummary id={id} incident={incident} />,
  "/:organization/:incident/shelter/:id/assign": ({id, incident}) => <ShelterRoomAssignment id={id} incident={incident} />,
  "/:organization/:incident/shelter/building/new": ({incident}) => <BuildingForm incident={incident} />,
  "/:organization/:incident/shelter/building/edit/:id": ({id, incident}) => <BuildingForm id={id} incident={incident} />,
  "/:organization/:incident/shelter/building/:id": ({id, incident}) => <BuildingDetails id={id} incident={incident} />,
  "/:organization/:incident/shelter/building/room/new": ({incident}) => <RoomForm incident={incident} />,
  "/:organization/:incident/shelter/room/edit/:id": ({id, incident}) => <RoomForm id={id} incident={incident} />,
  "/:organization/:incident/shelter/room/:id": ({id, incident}) => <RoomDetails id={id} incident={incident} />,
};

export default routes;
