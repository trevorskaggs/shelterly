import moment from 'moment';
import ShelterlyPDF from '../utils/pdf';
import { capitalize } from '../utils/formatString';
import { SpeciesIcon } from '../components/icons';
import { DATE_FORMAT } from '../constants';
import { createQrCode } from '../utils/qrCode';

/**
 * helper function for drawing the animal details QR code at the top of the animal care schedule pdf
 */
async function drawQRCareCode(pdf, animalUrl) {
  // set absolute position to the top header of each animal care schedule page
  const { oldLeftMargin, oldLastYPosition, resetPosition } =
  pdf.setAbsolutePosition({ x: 200, y: 10 });

  // draw QR code
  await pdf.drawImage({ src: createQrCode(animalUrl) });

  // reset position to continue normal draw operations
  resetPosition(oldLeftMargin, oldLastYPosition);
}

async function buildAnimalCareScheduleContent(pdf, animals) {
  for (let i = 0; i < animals.length; i++) {
    const animal = animals[i];

    if (i > 0) {
      pdf.drawPageBreak();
    }

    if (animal.url) {
      await drawQRCareCode(pdf, animal.url)
    }

    const imageSrc = animal.front_image;
    let graphicOptions = {
      display: 'inline',
      maxHeight: 75,
      maxWidth: 75,
      padding: [10, 0, 10, 50],
      drawFuncName: 'drawImage'
    };
    if (animal.lazyImage) {
      graphicOptions = {
        ...graphicOptions,
        src: animal.lazyImage,
        drawFuncName: 'drawGraphic'
      };
    }
    else if (imageSrc) {
      graphicOptions = {
        ...graphicOptions,
        src: imageSrc
      };
    } else  {
      graphicOptions = {
        ...graphicOptions,
        drawFuncName: 'drawSvg',
        svg: <SpeciesIcon color="#B9BECA" species={animal.species_string} />
      };
    }
    // draw image or svg
    await pdf[graphicOptions.drawFuncName](graphicOptions)
      .catch(() => {
        if (imageSrc) {
          console.log('Cannot add animal image to ShelterlyPDF');
        }
      });

    pdf.setDocumentFontSize({ size: 12 });
    pdf.drawPad(-15);

    const labelsList = [
      [`Animal No: A#${animal.id_for_incident}`, `Animal Name: ${capitalize(animal.name || 'unknown')}`],
      [
        `Intake Date: ${animal.intake_date
          ? new Date(animal.intake_date).toLocaleDateString()
          : 'N/A'}`,
          `Species: ${capitalize(animal.species_string)}`
      ],
      [
        `Color: ${capitalize(animal.pcolor)} ${animal.scolor ? `/ ${capitalize(animal.scolor)}` : '' }`,
        `Age: ${capitalize(animal.age)}`
      ],
      [
        `Under Vet Care: Y / N`,
        animal.shelter_object
          ? ''
          : 'Location: N/A'
      ]
    ];
    const listOptions = {
      listStyle: 'inline',
      labelInlineOffset: 125
    };
    labelsList.forEach((labels) => {
      pdf.drawTextList({ labels, ...listOptions })
    });

    pdf.resetDocumentLeftMargin();
    pdf.drawPad(15);

    pdf.drawWrappedText({
      text: `Location: ${
        animal.shelter_object ? `${animal.shelter_object.name}` : "N/A"
      }${
        animal.building_name ? ` / ${animal.building_name}` : ""
      }${
        animal.room ? ` / ${animal.room_name}` : ""
      }`,
    });

    // draw status
    pdf.drawWrappedText({ text: `Status: ${animal.status.toUpperCase() }`});

    if (animal.owners && animal.owners.length) {
      pdf.drawWrappedText({ text: `Owner(s): ${animal.owners.map((owner) =>
        `${capitalize(`${owner.first_name} ${owner.last_name}`, { proper: true })}`).join('; ')}`})
    }
    else if (animal.owner_names && animal.owner_names.length) {
        pdf.drawWrappedText({ text: `Owner(s): ${animal.owner_names.map((owner_name) =>
          `${capitalize(owner_name, { proper: true })}`).join('; ')}`})
    }
    else {
      pdf.drawWrappedText({ text: 'Owner(s): ___________________________________'})
    }

    pdf.drawPad(-15);

    const additionalLabelsList = [
      [`Aggressive: ${capitalize(animal.aggressive)}`, `Injured: ${capitalize(animal.injured)}`, `Fixed: ${capitalize(animal.fixed)}`, ' '],
      [`Microchip: ${animal.microchip || '_______'}`, 'Neck Tag: _______', 'Collar: _______', 'Sex: ' + `${animal.sex || '_______'}`]
    ]
    const additionalListOptions = {
      listStyle: 'inline',
      labelInlineMarginRight: 75
    };
    additionalLabelsList.forEach((labels) => {
      pdf.drawTextList({ labels, ...additionalListOptions})
    });

    pdf.drawPad(25)

    pdf.drawWrappedText({
      text: `Breed / Description: ${animal.color_notes || 'N/A'}`,
      linePadding: -2,
      bottomPadding: 3
    });
    pdf.drawWrappedText({
      text: `Animal Notes: ${animal.behavior_notes || 'N/A'}`,
      linePadding: -2,
      bottomPadding: 3,
    });
    pdf.drawWrappedText({
      text: `Medical Notes: ${animal.medical_notes || 'N/A'}`,
      linePadding: -2
    });

    pdf.drawHRule({
      buffer: 5
    });

    const pageWidth = pdf.pageWidth - pdf.documentLeftMargin * 2;
    const smallCol = pageWidth * .15;
    const bigCol = pageWidth * .35;
    pdf.drawTableGrid({
      headers: ['Date Time', 'AR#', 'Actions', 'Comments'],
      columnStyles: [{ cellWidth: smallCol }, { cellWidth: smallCol }, { cellWidth: bigCol }, { cellWidth: bigCol }]
    });
  }

  return pdf;
}

function buildAnimalCountList(pdf, animals, {
  countLabelMarginTo = 0
} = {}) {
  const animalCounts = [];
  animals
    .forEach((animal) => {
      const countIndex = animalCounts.findIndex(([species]) => animal.species_string === species);
      if (countIndex > -1) {
        const [currentSpecies, oldCount] = animalCounts[countIndex];
        animalCounts[countIndex] = [currentSpecies, oldCount + 1];
      } else {
        animalCounts.push([animal.species_string, 1]);
      }
    });

    pdf.drawTextList({
      labels: animalCounts.map(([species, count]) => (
        // capitalize the species
        `${species.replace(/(^.)/, m => m.toUpperCase())}: ${count}`
      )),
      labelMarginTop: countLabelMarginTo
    });
}

/**
 * generates care schedule for one animal
 * @param  {Array} animals - an array of the animal objects
 * @param  {ShelterlyPDF} pdf - pre-instantiated ShelterlyPDF instance, creates a new one by default
 * @returns {ShelterlyPDF}
 */
async function buildAnimalCareScheduleDoc (animals) {
  const pdf = new ShelterlyPDF({}, {
    pageTitle: 'Animal Care Schedule',
    pageSubtitle: `Date: ${new Date().toLocaleDateString()}`,
    drawHeaderOnEveryPage: true
  });

  return buildAnimalCareScheduleContent(pdf, animals);
}

async function printAnimalCareSchedule (animal = {}) {
  const pdf = await buildAnimalCareScheduleDoc([animal]);
  pdf.fileName = pdf.filename || `Shelterly-Animal-Care-Schedule-${animal.id_for_incident.toString().padStart(3, 0)}-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
};

async function printAllAnimalCareSchedules (animals = []) {
  // sort animals by id
  const sortedAnimals = [...animals].sort((a,b) => a.id_for_incident - b.id_for_incident);

  const  pdf = await buildAnimalCareScheduleDoc(sortedAnimals);
  pdf.fileName = `Shelterly-Animal-Care-Schedules-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
}

export {
  buildAnimalCareScheduleContent,
  buildAnimalCareScheduleDoc,
  buildAnimalCountList,
  printAllAnimalCareSchedules,
  printAnimalCareSchedule
};
