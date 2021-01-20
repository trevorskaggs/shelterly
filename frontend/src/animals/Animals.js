import React from "react";
import { AnimalView } from "./AnimalViews";
import { AnimalForm } from "./AnimalForms";
import { initialData } from "../hotline/HotlineWorkflow";

export const NewAnimal = () => (
    <AnimalForm state={initialData} />
)

export const AnimalDetail = ({id}) => (
  <div>
    <AnimalView id={id} />
  </div>
)

export const UpdateAnimal = ({id}) => (
    <AnimalForm id={id} state={initialData} />
)
