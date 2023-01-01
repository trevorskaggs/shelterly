import moment from 'moment';
import { buildAnimalCareScheduleDoc } from '../animals/Utils';

const dateFormat = 'YYYYMMDDHHmm';

export const printRoomAnimalCareSchedules  = async (animals = [], roomId = 0) => {
  const  pdf = await buildAnimalCareScheduleDoc(animals);
  pdf.fileName = `Shelterly-Room-Animal-Care-Schedules-${roomId.toString().padStart(4, 0)}-${moment().format(dateFormat)}`;
  pdf.saveFile();
};