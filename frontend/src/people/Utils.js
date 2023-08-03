import moment from 'moment';
import ShelterlyPDF from '../utils/pdf';
import { capitalize } from '../utils/formatString';
import { buildAnimalCareScheduleDoc, buildAnimalCountList } from '../animals/Utils';
import {
  ORGANIZATION_NAME,
  ORGANIZATION_SHORT_NAME,
  DATE_FORMAT,
} from "../constants";

/**
 * builds owner summary content
 *
 * @param {ShelterlyPDF} pdf
 * @param {Array} owners
 * @param {Array} [animalsOverride] optionally set the animals, otherwise will use animals within the owner object
 * @returns {ShelterlyPDF}
 */
const buildOwnersContent = (pdf, owners, animalsOverride) => {
  const groupedPageCounts = [];
  let ownerPageCount = 1;
  owners.forEach((owner, i) => {
    if (i > 0) {
      pdf.drawPageBreak();
      pdf.drawPageHeader();
      
      // before resetting the owner page count, store the current count
      groupedPageCounts.push(ownerPageCount);

      // reset the page count for each owner
      ownerPageCount = 1;
    }

    // draw owner section
    pdf.drawSectionHeader({ text: 'Owner Summary/Liability', hRule: true });
    
    const ownerInfoList = [
      `Name: ${owner.first_name} ${owner.last_name}`,
      `Owner ID: #${owner.id || 'N/A'}`,
      `Agency: ${owner.agency || 'N/A'}`,
      `Telephone: ${owner.display_phone || 'N/A'} ${owner.display_alt_phone ? `  Alt: ${owner.display_alt_phone}` : ''}`,
      `Email: ${owner.email || 'N/A'}`,
      `Drivers License: ${owner.drivers_license || 'N/A'}`
    ];

    if (owner.request) {
      ownerInfoList.push(`Service Request: ${owner.request.full_address}`);
    } else if (owner.address) {
        ownerInfoList.push(`Address: ${owner.full_address}`);
    } else {
      ownerInfoList.push('Address: N/A');
    }

    pdf.drawTextList({
      labels: ownerInfoList,
      bottomPadding: 15
    });

    // Owner Comments
    pdf.drawWrappedText({
      text: `Comments: ${owner.comments || 'N/A'}`
    });

    pdf.drawPad();

    function drawAnimalHeader() {
      pdf.drawSectionHeader({ text: 'Animals', hRule: false });
    }

    const animals = animalsOverride || owner?.animals || [];

    drawAnimalHeader();

    buildAnimalCountList(pdf, animals);

    pdf.drawHRule();

    // keep the last y position after a row was drawn
    let lastYPosAfterDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });

    animals.forEach((animal, animalIndex) => {
      // grab the last y position before we draw a row
      let lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
      
      // look ahead to see if this animal will bleed to the next page
      const estimatedAnimalHeight = 162 // this is a magic number, it should change if we add or remove properties to render for animals
      if (pdf.remainderPageHeight <= estimatedAnimalHeight) {
        pdf.drawPageBreak();
        drawAnimalHeader();
        lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
        ownerPageCount++;
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

      pdf.drawWrappedText({
        text: `Breed / Description: ${animal.color_notes || 'N/A'}`,
        linePadding: -5
      });

      pdf.drawWrappedText({
        text: `Shelter Address: ${animal.shelter_object?.full_address || 'N/A'}`,
        linePadding: 5
      });

      pdf.drawPad(5);
      pdf.drawHRule();
      lastYPosAfterDraw = pdf.getLastYPositionWithBuffer();

      // If after draw y position is less than before draw, that means there was a page break.
      // Draw the animal header again.
      if (
          lastYPosAfterDraw < lastYPosBeforeDraw &&
          animalIndex < animals.length - 1
        ) {
        drawAnimalHeader();
      }
    });

    pdf.drawPageBreak();
    ownerPageCount++;

    // Draw liability form
    pdf.drawSectionHeader({
      text: "Liability Release",
      hRule: false,
      align: ShelterlyPDF.AlignTypes.CENTER,
    });
    pdf.drawPad(18);
    let liabilityPreface = `Due to a declared emergency, I am requesting ${ORGANIZATION_NAME} to board my animal(s) `;
    liabilityPreface += '(listed above) and agree to all of the following:';
    pdf.setDocumentFontSize({ size: 8 });
    pdf.drawWrappedText({ text: liabilityPreface, linePadding: -2 });
    pdf.drawHRule({ buffer: 1});
    pdf.setDocumentFontSize();

    function drawAgreements(agreements) {
      agreements.forEach((agreement, i) => {
        pdf.drawWrappedText({ text: `${i + 1})    ${agreement}`, linePadding: -3, bottomPadding: 5 })
      });
    }

    function drawSignatureLines() {
      pdf.drawTextList({
        labels: ['Owner\'s Signature: ', 'Date: '],
        listStyle: 'grid',
        bottomPadding: 10,
        withLines: true
      });
      pdf.drawTextList({
        labels: [`${ORGANIZATION_SHORT_NAME} Witness Signature (First Name & AR#): `],
        bottomPadding: 15,
        withLines: true
      });
    }

    const agreements = [
      // 1)
      'I understand that my animal(s) may be exposed to disease and other risks while being ' +
      'housed at the shelter and other facilities and therefore I will not hold ' +
      `${ORGANIZATION_NAME} responsible for the health or death of my animal(s).`,

      // 2)
      'I agree to attempt to find alternate housing for my animal(s) as soon as possible.',

      // 3)
      `I agree to contact the agency on a regular basis to keep ${ORGANIZATION_NAME} ` +
      'updated on my whereabouts and possible alternate housing.',

      // 4)
      'I understand that this boarding agreement is temporary and I agree to make arrangements ' +
      'for or claim my pet(s) at the close of the shelter.',

      // 5)
      'I understand that I will be subject to boarding fees at the close of the shelter.',

      // 6)
      'I understand that photographs of myself and my animal(s) may be taken.'
    ];

    drawAgreements(agreements);

    const releaseLabels = [
      "I Allow",
      { label: "or", type: "text" },
      "I Decline",
      {
        label:
          "any photos that are taken to be released to the media or public view",
        type: "text",
      }
    ].concat(Array(7).fill({
      label: ' ',
      type: 'text'
    }));
    pdf.drawCheckboxList({
      labels: releaseLabels,
      listStyle: 'inline',
    });

    drawSignatureLines();

    // End liability form
    // Begin release animal form
    const estimatedReleaseSectionHeight = 150;
    if (pdf.remainderPageHeight <= estimatedReleaseSectionHeight) {
      pdf.drawPageBreak();
      ownerPageCount++;
    }

    // Draw liability form
    pdf.drawSectionHeader({
      text: "Release of Animal",
      hRule: false,
      align: ShelterlyPDF.AlignTypes.CENTER,
    });
    pdf.drawPad(18);
    pdf.drawHRule({ buffer: 1});

    let releaseText = 'I hereby acknowledge that I am the owner/responsible person for the above animal. I have taken ';
    releaseText += 'custody of my animal and am now responsible for its care and transportation.';
    pdf.drawWrappedText({ text: releaseText, linePadding: -2 });

    drawSignatureLines();
    // End release animal form
  });

  // push the last owner page count
  groupedPageCounts.push(ownerPageCount);

  const totalPageCount = pdf.numberOfPages
  let ownerPageNumber = 1
  let groupIndex = 0;

  // draw the page numbers
  for (let pageNumber = 1; pageNumber <= totalPageCount; pageNumber++) {
    pdf.setPage(pageNumber);

    let ownerPageCount = groupedPageCounts[groupIndex];
    if (ownerPageNumber > ownerPageCount) {
      ownerPageNumber = 1
      groupIndex++;
      ownerPageCount = groupedPageCounts[groupIndex];
    }
    pdf.drawPageNumbers({
      pageNumber: ownerPageNumber,
      pageCount: ownerPageCount
    });
    ownerPageNumber++;
  }

  return pdf;
}

const buildOwnersDoc = (owners) => {
  const pdf = new ShelterlyPDF({}, {
    pageTitle: 'Owner Summary',
    pageSubtitle: `Date: ${new Date().toLocaleDateString()}`,
  });

  return buildOwnersContent(pdf, owners);
};

function printOwnerDetails(owner = {}) {
  const pdf = buildOwnersDoc([owner]);
  pdf.fileName = `Owner-Summary-${owner.id.toString().padStart(3, 0)}`;
  return pdf.saveFile();
}

async function printAllOwnersDetails(owners = []) {
  const pdf = buildOwnersDoc(owners);
  pdf.fileName = `Owner-Summaries-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
}

const printOwnerAnimalCareSchedules  = async (animals = [], ownerId = 0) => {
  // sort animals by id
  const sortedAnimals = [...animals].sort((a,b) => a.id - b.id);

  const  pdf = await buildAnimalCareScheduleDoc(sortedAnimals);
  pdf.fileName = `Shelterly-Owner-Animal-Care-Schedules-${ownerId.toString().padStart(4, 0)}-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
};

export {
  buildOwnersContent,
  printOwnerDetails,
  printAllOwnersDetails,
  printOwnerAnimalCareSchedules
}
