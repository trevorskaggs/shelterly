import moment from 'moment';
import ShelterlyPDF from '../utils/pdf';
import { capitalize } from '../utils/formatString';
import { SpeciesIcon } from '../components/icons';

const dateFormat = 'YYYYMMDDHHmm';

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

  for (let i = 0; i < animals.length; i++) {
    const animal = animals[i];

    if (i > 0) {
      pdf.drawPageBreak();
    }

    const imageSrc = animal.front_image;
    let graphicOptions = {
      display: 'inline',
      maxHeight: 75,
      maxWidth: 75,
      padding: [10, 0, 10, 50],
      drawFuncName: 'drawImage'
    };
    if (imageSrc) {
      graphicOptions = {
        ...graphicOptions,
        src: imageSrc
      };
    } else  {
      graphicOptions = {
        ...graphicOptions,
        drawFuncName: 'drawSvg',
        svg: <SpeciesIcon color="#B9BECA" species={animal.species} />
      };
    }
    // draw image or svg
    await pdf[graphicOptions.drawFuncName](graphicOptions);

    pdf.setDocumentFontSize({ size: 12 });
    pdf.drawPad(-15);

    const labelsList = [
      [`Animal No: A#${animal.id}`, `Animal Name: ${capitalize(animal.name || 'unknown')}`],
      [
        `Intake Date: ${animal.intake_date
          ? new Date(animal.intake_date).toLocaleDateString()
          : 'N/A'}`,
        `Location: ${animal.room ? `${animal.building_name} / ${animal.room_name}` : 'N/A'}`
      ],
      [`Species: ${capitalize(animal.species)}`, `Color: ${capitalize(animal.pcolor)} ${animal.scolor ? `/ ${capitalize(animal.scolor)}` : '' }`],
      [`Age: ${capitalize(animal.age)}`, `Under Vet Care: Y / N`]
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

    if (animal.owners && animal.owners.length) {
      pdf.drawWrappedText({ text: `Owner(s): ${animal.owners.map((owner) =>
        `${capitalize(`${owner.first_name} ${owner.last_name}`, { proper: true })} ${owner.display_phone}`).join('; ')}`})
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
      [`Aggressive: ${capitalize(animal.aggressive)}`, `Injured: ${capitalize(animal.injured)}`, `Fixed: ${capitalize(animal.fixed)}`],
      [`Microchip: _______`, `Neck Tag: _______`, `Collar: _______`]
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
      text: `Behavior Notes: ${animal.behavior_notes || 'N/A'}`,
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

    pdf.drawTableGrid({
      headers: ['Date Time', 'AR#', 'Actions', 'Comments']
    });
  }

  return pdf;
}

async function printAnimalCareSchedule (animal = {}) {
  const pdf = await buildAnimalCareScheduleDoc([animal]);
  pdf.fileName = pdf.filename || `Shelterly-Animal-Care-Schedule-${animal.id.toString().padStart(3, 0)}-${moment().format(dateFormat)}`;
  pdf.saveFile();
};

async function printAllAnimalCareSchedules (animals = []) {
  const  pdf = await buildAnimalCareScheduleDoc(animals);
  pdf.fileName = `Shelterly-Animal-Care-Schedules-${moment().format(dateFormat)}`;
  pdf.saveFile();
}

export {
  buildAnimalCareScheduleDoc,
  printAllAnimalCareSchedules,
  printAnimalCareSchedule
};
