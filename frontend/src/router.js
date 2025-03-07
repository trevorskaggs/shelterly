import React from "react";
import Home from "./Home";
import Incident from "./Incident";
import IncidentForm from "./IncidentForm";
import LoginForm from "./accounts/LoginForm";
import PasswordReset from "./accounts/PasswordReset";
import TemporaryAccessForm from "./accounts/TemporaryAccessForm";
import TemporaryAccessRegistration from "./accounts/TemporaryAccessRegistration";
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
import TreatmentPlanDetails from "./vet/TreatmentPlanDetails";
import TreatmentPlanForm from "./vet/TreatmentPlanForm";
import TreatmentRequestForm from "./vet/TreatmentRequestForm";
import VetRequestDetails from "./vet/VetRequestDetails";
import VetRequestForm from "./vet/VetRequestForm";
import VetRequestSearch from "./vet/VetRequestSearch";
import ExamForm from "./vet/ExamForm";
import Organization from "./Organization";
import VetStepperWorkflow, { initialVetWorkflowData } from "./vet/VetStepperWorkflow";
import OrdersForm from "./vet/OrdersForm";
import MedicalNoteForm from "./vet/MedicalNoteForm";
import MedicalRecordDetails from "./vet/MedicalRecordDetails";
import DiagnosticResultForm from "./vet/DiagnosticResultForm";
import ProcedureResultForm from "./vet/ProcedureResultForm";
import DiagnosisForm from "./vet/DiagnosisForm";
import Vet from "./vet/Vet";
import MedicalPlanForm from "./vet/MedicalPlanForm";

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
  "/:organization/accounts/user/new": ({organization}) => <UserForm organization={organization} />,
  "/:organization/signup/manage": ({organization}) => <TemporaryAccessForm organization={organization} />,
  "/:organization/signup/:id": ({id, organization}) => <TemporaryAccessRegistration id={id} organization={organization} />,
  "/:organization/accounts/user/edit/:id": ({id, organization}) => <UserForm id={id} organization={organization} />,
  "/:organization/accounts/user_management": ({organization}) => <UserManagement organization={organization} />,
  "/:organization/:incident/animals/edit/:id": ({id, incident, organization}) => <AnimalForm id={id} state={initialWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/animals/new": ({incident, organization}) => <AnimalForm state={initialWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/animals/search": ({incident, organization}) => <AnimalSearch incident={incident} organization={organization} />,
  "/:organization/:incident/animals/:id": ({id, incident, organization}) => <AnimalDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/animals/:animalid/vetrequest/new": ({animalid, incident, organization}) => <VetRequestForm animalid={animalid} state={initialVetWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch": ({incident, organization}) => <Dispatch incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/dispatchteammember/new": ({incident, organization}) => <DispatchTeamMemberForm incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/dispatchteammember/edit/:id": ({id, incident, organization}) => <DispatchTeamMemberForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/dispatchassignment/search": ({incident, organization}) => <DispatchAssignmentSearch incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/summary/:id": ({id, incident, organization}) => <DispatchSummary id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/resolution/:id": ({id, incident, organization}) => <DispatchResolutionForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/assignment/note/:id": ({id, incident, organization}) => <VisitNoteForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/deploy": ({incident, organization}) => <Deploy incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/preplan": ({incident, organization}) => <Deploy incident={incident} organization={organization} />,
  "/:organization/:incident/dispatch/teammanagement": ({incident, organization}) => <DispatchTeamManagement incident={incident} organization={organization} />,
  "/:organization/:incident/hotline": ({incident, organization}) => <Hotline incident={incident} organization={organization} />,
  "/:organization/:incident/hotline/servicerequest/:id/assign": ({id, incident, organization}) => <ServiceRequestDispatchAssignment id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/hotline/ownercontact/new": ({incident, organization}) => <OwnerContactForm incident={incident} organization={organization} />,
  "/:organization/:incident/hotline/ownercontact/:id": ({id, incident, organization}) => <OwnerContactForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/hotline/servicerequest/edit/:id": ({id, incident, organization}) => <ServiceRequestForm id={id} state={initialWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/hotline/servicerequest/search": ({incident, organization}) => <ServiceRequestSearch incident={incident} organization={organization} />,
  "/:organization/:incident/hotline/servicerequest/:id": ({id, incident, organization}) => <ServiceRequestDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/hotline/workflow/*": ({incident, organization}) => <StepperWorkflow incident={incident} organization={organization} />,
  "/:organization/:incident/intake/workflow/*": ({incident, organization}) => <StepperWorkflow incident={incident} organization={organization} />,
  "/:organization/:incident/people/owner/edit/:id": ({id, incident, organization}) => <PersonForm id={id} state={initialWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/people/owner/new": ({incident, organization}) => <PersonForm state={initialWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/people/owner/search": ({incident, organization}) => <PersonSearch incident={incident} organization={organization} />,
  "/:organization/:incident/people/owner/:id": ({id, incident, organization}) => <PersonDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/people/reporter/edit/:id": ({id, incident, organization}) => <PersonForm id={id} incident={incident} organization={organization} state={initialWorkflowData} />,
  "/:organization/:incident/people/reporter/new": ({incident, organization}) => <PersonForm state={initialWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/people/reporter/:id": ({id, incident, organization}) => <PersonDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/reports": ({incident, organization}) => <Reports incident={incident} organization={organization} />,
  "/:organization/:incident/shelter": ({incident, organization}) => <Shelter incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/new": ({incident, organization}) => <ShelterForm incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/edit/:id": ({id, incident, organization}) => <ShelterForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/:id": ({id, incident, organization}) => <ShelterDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/:id/intake": ({id, incident, organization}) => <ShelterIntake id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/intakesummary/:id": ({id, incident, organization}) => <ShelterIntakeSummary id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/:id/assign": ({id, incident, organization}) => <ShelterRoomAssignment id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/building/new": ({incident, organization}) => <BuildingForm incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/building/edit/:id": ({id, incident,organization}) => <BuildingForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/building/:id": ({id, incident, organization}) => <BuildingDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/building/room/new": ({incident, organization}) => <RoomForm incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/room/edit/:id": ({id, incident, organization}) => <RoomForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/shelter/room/:id": ({id, incident, organization}) => <RoomDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet": ({incident, organization}) => <Vet incident={incident} organization={organization} />,
  "/:organization/:incident/vet/diagnosticresult/edit/:id": ({id, incident, organization}) => <DiagnosticResultForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:id": ({id, incident, organization}) => <MedicalRecordDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:id/diagnostics": ({id, incident, organization}) => <OrdersForm id={id} state={initialVetWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/exam/:id": ({id, incident, organization}) => <ExamForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:id/procedures": ({id, incident, organization}) => <OrdersForm id={id} state={initialVetWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:id/workflow": ({id, incident, organization}) => <VetStepperWorkflow id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:medrecordid/diagnosis/new": ({medrecordid, incident, organization}) => <DiagnosisForm medrecordid={medrecordid} state={initialVetWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:medrecordid/treatment/new": ({medrecordid, incident, organization}) => <TreatmentPlanForm medrecordid={medrecordid} state={initialVetWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:medrecordid/medicalnote/new": ({medrecordid, incident, organization}) => <MedicalNoteForm medrecordid={medrecordid} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medrecord/:id/medicalplan/edit": ({id, incident, organization}) => <MedicalPlanForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/medicalnote/edit/:id": ({id, incident, organization}) => <MedicalNoteForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/procedureresult/edit/:id": ({id, incident, organization}) => <ProcedureResultForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/treatment/:id": ({id, incident, organization}) => <TreatmentPlanDetails id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/treatment/edit/:id": ({id, incident, organization}) => <TreatmentPlanForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/treatmentrequest/edit/:id": ({id, incident, organization}) => <TreatmentRequestForm id={id} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/vetrequest/search": ({incident, organization}) => <VetRequestSearch incident={incident} organization={organization} />,
  "/:organization/:incident/vet/vetrequest/edit/:id": ({id, incident, organization}) => <VetRequestForm id={id} state={initialWorkflowData} incident={incident} organization={organization} />,
  "/:organization/:incident/vet/vetrequest/:id": ({id, incident, organization}) => <VetRequestDetails id={id} incident={incident} organization={organization} />,

};

export default routes;
