import moment from "moment";
import ShelterlyPDF from "../utils/pdf";
import {
  buildAnimalCareScheduleContent,
  buildAnimalCareScheduleDoc,
} from "../animals/Utils";
import { buildOwnersContent } from "../people/Utils";
import { DATE_FORMAT } from "../constants";

export { printOwnerDetails } from "../people/Utils";

async function printAnimalCareSchedules(animals = [], id = 0, type = "Intake") {
  const pdf = await buildAnimalCareScheduleDoc(animals);
  pdf.fileName = `Shelterly-${type}-Animal-Care-Schedules-${id
    .toString()
    .padStart(4, 0)}-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
}

export const printRoomAnimalCareSchedules = async (
  animals = [],
  roomId = 0
) => {
  await printAnimalCareSchedules(animals, roomId, "Room");
};

export const printIntakeSummaryAnimalCareSchedules = async (
  animals = [],
  roomId = 0
) => {
  await printAnimalCareSchedules(animals, roomId);
};

export const printIntakeSummary = async (data = {}) => {
  const title = `${
    data.intake_type === "owner_walkin"
      ? "Owner Walk-In"
      : data.intake_type === "reporter_walkin"
      ? "Reporter Walk-In"
      : "Dispatch"
  } Intake Summary`;

  const pdf = new ShelterlyPDF(
    {},
    {
      pageTitle: title,
      pageSubtitle: `Date: ${new Date().toLocaleDateString()}`,
      drawHeaderOnEveryPage: true,
    }
  );

  await buildOwnersContent(pdf, [data.person_object], data.animal_objects);
  pdf.drawPageBreak();
  await buildAnimalCareScheduleContent(pdf, data.animal_objects);

  pdf.fileName = `Shelterly-Intake-Summary-${data.intake_type}-${data.id
    .toString()
    .padStart(3, 0)}-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
};
