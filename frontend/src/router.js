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
import Shelter from "./shelter/Shelter";
import ShelterForm from "./shelter/ShelterForm";
import ShelterIntake from "./shelter/ShelterIntake";
import ShelterRoomAssignment from "./shelter/ShelterRoomAssignment";
import ShelterDetails from "./shelter/ShelterDetails";
import BuildingForm from "./shelter/BuildingForm";
import BuildingDetails from "./shelter/BuildingDetails";
import RoomForm from "./shelter/RoomForm";
import RoomDetails from "./shelter/RoomDetails";
import VisitNoteForm from "./dispatch/VisitNoteForm";
import TreatmentPlanDetails from "./vet/TreatmentPlanDetails"
import TreatmentPlanForm from "./vet/TreatmentPlanForm";
import VetRequestDetails from "./vet/VetRequestDetails";
import VetRequestForm from "./vet/VetRequestForm";
import VetRequestSearch from "./vet/VetRequestSearch";

export const publicRoutes = {
  "/login": () => <LoginForm />,
  "/reset_password": () => <PasswordReset />,
}

const routes = {
  "/": () => <Incident />,
  "/reset_password": () => <PasswordReset />,
  "/:incident": ({incident}) => <Home incident={incident} />,
  "/incident/edit/:id": ({id}) => <IncidentForm id={id} />,
  "/incident/new": () => <IncidentForm />,
  "/:incident/accounts/user/new": ({incident}) => <UserForm incident={incident} />,
  "/:incident/accounts/user/edit/:id": ({id, incident}) => <UserForm id={id} incident={incident} />,
  "/:incident/accounts/user_management": ({incident}) => <UserManagement incident={incident} />,
  "/:incident/animals/edit/:id": ({id, incident}) => <AnimalForm id={id} state={initialWorkflowData} incident={incident} />,
  "/:incident/animals/new": ({incident}) => <AnimalForm state={initialWorkflowData} incident={incident} />,
  "/:incident/animals/search": ({incident}) => <AnimalSearch incident={incident} />,
  "/:incident/animals/:id": ({id, incident}) => <AnimalDetails id={id} incident={incident} />,
  "/:incident/animals/:animalid/vetrequest/new": ({animalid, incident}) => <VetRequestForm animalid={animalid} incident={incident} />,
  "/:incident/dispatch": ({incident}) => <Dispatch incident={incident} />,
  "/:incident/dispatch/dispatchteammember/new": ({incident}) => <DispatchTeamMemberForm incident={incident} />,
  "/:incident/dispatch/dispatchassignment/search": ({incident}) => <DispatchAssignmentSearch incident={incident} />,
  "/:incident/dispatch/summary/:id": ({id, incident}) => <DispatchSummary id={id} incident={incident} />,
  "/:incident/dispatch/resolution/:id": ({id, incident}) => <DispatchResolutionForm id={id} incident={incident} />,
  "/:incident/dispatch/assignment/note/:id": ({id, incident}) => <VisitNoteForm id={id} incident={incident} />,
  "/:incident/dispatch/deploy": ({incident}) => <Deploy incident={incident} />,
  "/:incident/dispatch/preplan": ({incident}) => <Deploy incident={incident} />,
  "/:incident/dispatch/teammanagement": ({incident}) => <DispatchTeamManagement incident={incident} />,
  "/:incident/hotline": ({incident}) => <Hotline incident={incident} />,
  "/:incident/hotline/servicerequest/:id/assign": ({id, incident}) => <ServiceRequestDispatchAssignment id={id} incident={incident} />,
  "/:incident/hotline/ownercontact/new": ({incident}) => <OwnerContactForm incident={incident} />,
  "/:incident/hotline/ownercontact/:id": ({id, incident}) => <OwnerContactForm id={id} incident={incident} />,
  "/:incident/hotline/servicerequest/edit/:id": ({id, incident}) => <ServiceRequestForm id={id} state={initialWorkflowData} incident={incident} />,
  "/:incident/hotline/servicerequest/search": ({incident}) => <ServiceRequestSearch incident={incident} />,
  "/:incident/hotline/servicerequest/:id": ({id, incident}) => <ServiceRequestDetails id={id} incident={incident} />,
  "/:incident/hotline/workflow/*": ({incident}) => <StepperWorkflow incident={incident} />,
  "/:incident/intake/workflow/*": ({incident}) => <StepperWorkflow incident={incident} />,
  "/:incident/shelter/:id/intake": ({id, incident}) => <ShelterIntake id={id} incident={incident} />,
  "/:incident/people/owner/edit/:id": ({id, incident}) => <PersonForm id={id} state={initialWorkflowData} incident={incident} />,
  "/:incident/people/owner/new": ({incident}) => <PersonForm state={initialWorkflowData} incident={incident} />,
  "/:incident/people/owner/search": ({incident}) => <PersonSearch incident={incident} />,
  "/:incident/people/owner/:id": ({id, incident}) => <PersonDetails id={id} incident={incident} />,
  "/:incident/people/reporter/edit/:id": ({id, incident}) => <PersonForm id={id} incident={incident} state={initialWorkflowData} />,
  "/:incident/people/reporter/new": ({incident}) => <PersonForm state={initialWorkflowData} incident={incident} />,
  "/:incident/people/reporter/:id": ({id, incident}) => <PersonDetails id={id} incident={incident} />,
  "/:incident/shelter": ({incident}) => <Shelter incident={incident} />,
  "/:incident/shelter/new": ({incident}) => <ShelterForm incident={incident} />,
  "/:incident/shelter/edit/:id": ({id, incident}) => <ShelterForm id={id} incident={incident} />,
  "/:incident/shelter/:id": ({id, incident}) => <ShelterDetails id={id} incident={incident} />,
  "/:incident/shelter/:id/assign": ({id, incident}) => <ShelterRoomAssignment id={id} incident={incident} />,
  "/:incident/shelter/building/new": ({incident}) => <BuildingForm incident={incident} />,
  "/:incident/shelter/building/edit/:id": ({id, incident}) => <BuildingForm id={id} incident={incident} />,
  "/:incident/shelter/building/:id": ({id, incident}) => <BuildingDetails id={id} incident={incident} />,
  "/:incident/shelter/building/room/new": ({incident}) => <RoomForm incident={incident} />,
  "/:incident/shelter/room/edit/:id": ({id, incident}) => <RoomForm id={id} incident={incident} />,
  "/:incident/shelter/room/:id": ({id, incident}) => <RoomDetails id={id} incident={incident} />,
  "/:incident/vet/treatment/new": ({incident}) => <TreatmentPlanForm incident={incident} />,
  "/:incident/vet/treatment/:id": ({id, incident}) => <TreatmentPlanDetails id={id} incident={incident} />,
  "/:incident/vet/vetrequest/search": ({incident}) => <VetRequestSearch incident={incident} />,
  "/:incident/vet/vetrequest/edit/:id": ({id, incident}) => <VetRequestForm id={id} state={initialWorkflowData} incident={incident} />,
  "/:incident/vet/vetrequest/:id": ({id, incident}) => <VetRequestDetails id={id} incident={incident} />,
};

export default routes;
