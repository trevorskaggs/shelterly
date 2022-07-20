import ShelterlyPDF from '../utils/pdf';
import { capitalize } from '../utils/formatString';

export const printOwnerDetails = (owner) => {
  const pdf = new ShelterlyPDF();
  pdf.fileName = `Owner-Summary-${owner.id.toString().padStart(3, 0)}`;

  // draw page header
  pdf.drawPageHeader({
    text: 'Owner Summary',
    subText: `Date: ${new Date().toLocaleDateString()}`
  });
  pdf.drawHRule();

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
  owner.animals.forEach((animal) => {
    // grab the last y position before we draw a row
    const lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });

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
    if (lastYPosAfterDraw < lastYPosBeforeDraw) {
      drawAnimalHeader();
    }
  });

  pdf.saveFile();
};
