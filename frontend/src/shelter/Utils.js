import { buildAnimalCareScheduleDoc } from '../animals/Utils';

export const printRoomAnimalCareSchedules  = async (animals = [], roomId = 0) => {
  const  pdf = await buildAnimalCareScheduleDoc(animals);
  pdf.fileName = `Shelterly-Room-Animal-Care-Schedules-${roomId.toString().padStart(4, 0)}`;
  pdf.saveFile();
};
