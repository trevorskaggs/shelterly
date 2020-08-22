import React from 'react';
import { PersonForm } from './PeopleForms';
import { PersonView } from './PeopleViews';

const header_style = {
  textAlign: 'center',
};

export const NewOwner = () => (
  <div>
    <PersonForm />
  </div>
);

export const UpdateOwner = ({ id }) => (
  <PersonForm id={id} />
);

export const OwnerDetail = ({ id }) => (
  <PersonView id={id} />
);

export const NewReporter = () => (
  <PersonForm />
);

export const UpdateReporter = ({ id }) => (
  <div>
    <h1 style={header_style}>Reporter Information</h1>
    <PersonForm id={id} />
  </div>
);

export const ReporterDetail = ({ id }) => (
  <div>
    <PersonView id={id} />
  </div>
);
