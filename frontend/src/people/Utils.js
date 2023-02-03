import moment from 'moment';
import ShelterlyPDF from '../utils/pdf';
import { capitalize } from '../utils/formatString';
import { buildAnimalCareScheduleDoc } from '../animals/Utils';

const dateFormat = 'YYYYMMDDHHmm';

const buildOwnersDoc = (owners) => {
  const pdf = new ShelterlyPDF({}, {
    pageTitle: 'Owner Summary',
    pageSubtitle: `Date: ${new Date().toLocaleDateString()}`
  });

  owners.forEach((owner, i) => {
    if (i > 0) {
      pdf.drawPageBreak();
      pdf.drawPageHeader();
    }

    // draw owner section
    pdf.drawSectionHeader({ text: 'Owner Details', hRule: true });
    
    const ownerInfoList = [`Name: ${owner.first_name} ${owner.last_name}`];
    if (owner.agency) ownerInfoList.push(`Agency: ${owner.agency}`);
    if (owner.phone) ownerInfoList.push(`Telephone: ${owner.display_phone} ${owner.display_alt_phone ? `  Alt: ${owner.display_alt_phone}` : ''}`);
    if (owner.email) ownerInfoList.push(`Email: ${owner.email}`);
    if (owner.request) ownerInfoList.push(`Service Request: ${owner.request.full_address}`);
    else {
      if (owner.address) ownerInfoList.push(`Address: ${owner.full_address}`);
      else ownerInfoList.push('Address: No Address Listed');
    }

    pdf.drawTextList({
      labels: ownerInfoList,
      bottomPadding: 15
    });

    if (owner.comments) {
      pdf.drawWrappedText({
        text: `Comments: ${owner.comments}`
      })
    }

    pdf.drawPad();

    function drawAnimalHeader() {
      pdf.drawSectionHeader({ text: 'Animals', hRule: true });
    }

    drawAnimalHeader();

    // keep the last y position after a row was drawn
    let lastYPosAfterDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
    owner.animals.forEach((animal, animalIndex) => {
      // grab the last y position before we draw a row
      let lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
      
      // look ahead to see if this animal will bleed to the next page
      const estimatedAnimalHeight = 162 // this is a magic number, it should change if we add or remove properties to render for animals
      if (pdf.remainderPageHeight <= estimatedAnimalHeight) {
        pdf.drawPageBreak();
        drawAnimalHeader();
        lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
      }

      const animalInfoList = [
        `ID: A#${animal.id}`,
        `Status: ${capitalize(animal.status.toLowerCase(), { proper: true })}`,
        `Name: ${animal.name || 'Unknown'}`,
        `Species: ${capitalize(animal.species)}`,
        `Sex: ${capitalize(animal.sex|| 'Unknown')}`,
        `Age: ${capitalize(animal.age || 'Unknown')}`,
        `Size: ${capitalize(animal.size || 'Unknown')}`,
        `Primary Color: ${capitalize(animal.pcolor || 'N/A')}, Secondary Color: ${capitalize(animal.scolor || 'N/A')}`
      ];

      pdf.drawTextList({
        labels: animalInfoList,
        listStyle: 'grid',
        bottomPadding: 0
      });

      pdf.drawPad();

      if (animal.color_notes) {
        pdf.drawWrappedText({
          text: `Breed / Description: ${animal.color_notes}`,
          linePadding: -5
        });
      }

      if (animal.shelter) {
        pdf.drawWrappedText({
          text: `Shelter Address: ${animal.shelter_object?.full_address || 'Unknown'}`,
          linePadding: 5
        })
      }

      pdf.drawPad(5);
      pdf.drawHRule();
      lastYPosAfterDraw = pdf.getLastYPositionWithBuffer();

      // If after draw y position is less than before draw, that means there was a page break.
      // Draw the animal header again.
      if (
          lastYPosAfterDraw < lastYPosBeforeDraw &&
          animalIndex < owner.animals.length - 1
        ) {
        drawAnimalHeader();
      }
    });
  });

  return pdf;
};

function printOwnerDetails(owner = {}) {
  const pdf = buildOwnersDoc([owner]);
  pdf.fileName = `Owner-Summary-${owner.id.toString().padStart(3, 0)}`;
  return pdf.saveFile();
}

async function printAllOwnersDetails(owners = []) {
  const pdf = buildOwnersDoc(owners);
  pdf.fileName = `Owner-Summaries-${moment().format(dateFormat)}`;
  return pdf.saveFile();
}

const printOwnerAnimalCareSchedules  = async (animals = [], ownerId = 0) => {
  const  pdf = await buildAnimalCareScheduleDoc(animals);
  pdf.fileName = `Shelterly-Owner-Animal-Care-Schedules-${ownerId.toString().padStart(4, 0)}-${moment().format(dateFormat)}`;
  return pdf.saveFile();
};

export {
  printOwnerDetails,
  printAllOwnersDetails,
  printOwnerAnimalCareSchedules
}
