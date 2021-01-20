import React from "react";
import { PersonForm } from "./PeopleForms";
import { PersonView } from "./PeopleViews";
import { initialData } from "../hotline/HotlineWorkflow";

export const NewOwner = () => (
    <div>
      <PersonForm state={initialData} />
    </div>
)

export const UpdateOwner = ({id}) => (
    <PersonForm id={id} state={initialData} />
)

export const OwnerDetail = ({id}) => (
    <PersonView id={id} />
)

export const NewReporter = () => (
  <PersonForm state={initialData} />
)

export const UpdateReporter = ({id}) => (
<div>
  <PersonForm id={id} state={initialData} />
</div>
)

export const ReporterDetail = ({id}) => (
  <div>
    <PersonView id={id} />
  </div>
)
