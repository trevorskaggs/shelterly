import moment from 'moment';
import ShelterlyPDF from '../utils/pdf';
import { priorityChoices, DATE_FORMAT } from '../constants';
import { capitalize, statusLabelLookup } from '../utils/formatString';
import { buildAnimalCareScheduleDoc } from '../animals/Utils';

function buildServiceRequestsDoc(srs = []) {
  const pdf = new ShelterlyPDF({}, {
    // adds page numbers to the footer
    addFooterHandler: ShelterlyPDF.HandlerTypes.DEFAULT,
    pageTitle: 'Service Request Summary',
    pageSubtitle: ' '
  });

  srs.forEach((data, i) => {
    if (i > 0) {
      pdf.drawPageBreak();
      pdf.drawPageHeader();
    }

    // service request priority
    const srPriority = priorityChoices.find(({ value }) => value === (data.priority || 2))

    // Summary page
    pdf.drawSectionHeader({ text: `Information` });

    pdf.drawPad(20);

    // id & priority
    pdf.drawWrappedText({ text: `SR#${data.id} - ${srPriority.label} Priority` })

    // status
    pdf.drawWrappedText({ text: `Status: ${data.status.toUpperCase()}` });

    // summary address
    pdf.drawWrappedText({ text: 'Service Request Address:' });

    const [addressLine1, ...addressLine2] = data.full_address.split(',')
    pdf.drawWrappedText({ text: [addressLine1, addressLine2.join(',')?.trim?.()] });

    pdf.drawPad(-10);

    const infoList = [
      `Key at Staging: ${data.key_provided ? 'Yes' : 'No'}`,
      `Accessible: ${data.accessible ? 'Yes' : 'No'}`,
      `Turn Around: ${data.turn_around ? 'Yes' : 'No'}`,
    ];

    pdf.drawTextList({
      labels: infoList,
      listStyle: 'inline',
      bottomPadding: 10
    });

    // forced entry
    pdf.drawWrappedText({
      text: `Forced Entry Permission: ${
        data.assigned_requests?.find?.(
          (ar) => ar.visit_note?.forced_entry === true
        )
          ? 'Yes'
          : 'No'
      }`,
    });

    // follow up date
    pdf.drawWrappedText({ text: `Followup Date: ${data.followup_date ? new Date(data.followup_date)?.toLocaleDateString?.() : 'Not set'}` });

    // directions
    pdf.drawWrappedText({ text: `Instructions for Field Team: ${data.directions || 'No instructions available'}` })

    pdf.drawHRule();

    // visit notes
    data.assigned_requests?.forEach?.(({ visit_note }, i) => {
      if (i === 0) {
        pdf.drawSectionHeader({ text: 'Visit Notes' });
        pdf.drawPad(20);
      }

      if (visit_note) {
        pdf.drawWrappedText({
          text: `${moment(visit_note.date_completed).format('MMMM Do')}:${visit_note.forced_entry ? ' (Forced Entry)' : ''} ${
            (visit_note?.notes && visit_note?.notes) || ''
          }`,
        });
      }
    });

    pdf.drawHRule();

    // contacts
    pdf.drawSectionHeader({ text: `Contacts` });

    pdf.drawPad(20);

    // owners
    if (data.owner_objects.length) {
      data.owner_objects.forEach((owner) => {
        pdf.drawWrappedText({
          text: `Owner: ${owner.first_name} ${owner.last_name} ${owner.display_phone || ''}`
        });

        pdf.drawWrappedText({
          text: `Owner Email: ${owner.email || 'N/A'}`
        });
      })
    } else {
      //no owners
      pdf.drawWrappedText({
        text: 'Owner: N/A'
      });
    }

    // reporter
    if (data.reporter && data.reporter_object) {
      pdf.drawWrappedText({
        text: `Reporter: ${data.reporter_object.first_name} ${data.reporter_object.last_name} ${data.reporter_object.display_phone || ''}`
      });
      pdf.drawWrappedText({
        text: `Reporter Agency: ${data.reporter_object.agency || 'N/A'}`
      });
    } else {
      pdf.drawWrappedText({
        text: 'Reporter: N/A'
      });
    }

    pdf.drawHRule();

    // animals
    function drawAnimalHeader() {
      pdf.drawSectionHeader({ text: 'Animals' });
      pdf.drawPad(10);
    }

    drawAnimalHeader();

    // keep the last y position after a row was drawn
    let lastYPosAfterDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
    data.animals.forEach((animal, animalIndex) => {
      // grab the last y position before we draw a row
      let lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });

      // look ahead to see if this animal will bleed to the next page
      const estimatedAnimalHeight = 209 // this is a magic number, it should change if we add or remove properties to render for animals
      if (pdf.remainderPageHeight <= estimatedAnimalHeight) {
        pdf.drawPageBreak();
        drawAnimalHeader();
        lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
      }

      const animalStatus =
        statusLabelLookup[animal.status] ||
        `${capitalize(animal.status.toLowerCase(), { proper: true })}`;

      const animalInfoList = [
        `ID: A#${animal.id}`,
        `Status: ${animalStatus}`,
        `Name: ${animal.name || 'Unknown'}`,
        `Species: ${capitalize(animal.species)}`,
        `Sex: ${capitalize(animal.sex|| 'Unknown')}`,
        `Age: ${capitalize(animal.age || 'Unknown')}`,
        `Size: ${capitalize(animal.size || 'Unknown')}`,
        `Primary Color: ${capitalize(animal.pcolor || 'N/A')}, Secondary Color: ${capitalize(animal.scolor || 'N/A')}`,
        `Fixed: ${capitalize(animal.fixed || 'Unknown')}`,
        `Aggressive: ${capitalize(animal.aggressive || 'Unknown')}`,
        `ACO Required: ${capitalize(animal.aco_required || 'Unknown')}`,
        `Confined: ${capitalize(animal.confined || 'Unknown')}`,
        `Injured: ${capitalize(animal.injured || 'Unknown')}`,
        `Last Seen: ${animal.last_seen ? moment(animal.last_seen).format('MMMM Do YYYY HH:mm') : 'Unknown'}`
      ];

      pdf.drawTextList({
        labels: animalInfoList,
        listStyle: 'grid',
        bottomPadding: 0
      });

      pdf.drawPad();

      // breed / description (color_notes)
      pdf.drawWrappedText({
        text: `Breed / Description: ${animal.color_notes}`,
        linePadding: 0
      });

      // medical notes
      pdf.drawWrappedText({
        text: `Medical Notes: ${animal.medical_notes || 'N/A'}`,
        linePadding: 0
      });

      // behavior notes
      pdf.drawWrappedText({
        text: `Animal Notes: ${animal.behavior_notes || 'N/A'}`,
        linePadding: 0
      });

      pdf.drawWrappedText({
        text: `Shelter Address: ${animal.shelter_object?.full_address || 'N/A'}`,
        linePadding: 5
      })

      pdf.drawPad(5);
      pdf.drawHRule();
      lastYPosAfterDraw = pdf.getLastYPositionWithBuffer();

      // If after draw y position is less than before draw, that means there was a page break.
      // Draw the animal header again.
      if (
        lastYPosAfterDraw < lastYPosBeforeDraw &&
        animalIndex < data.animals.length - 1
      ) {
        drawAnimalHeader();
      }
    });

    pdf.setDocumentFontSize();
  });

  return pdf;
}

function printServiceRequestSummary(sr = {}) {
  const pdf = buildServiceRequestsDoc([sr]);
  pdf.fileName = `SR-${sr.id.toString().padStart(3, 0)}`;
  return pdf.saveFile();
}

function printAllServiceRequests(srs = []) {
  const pdf = buildServiceRequestsDoc(srs);
  pdf.fileName = `SRs-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
}

const printSrAnimalCareSchedules  = async (animals = [], srId = 0) => {
  // sort animals by id
  const sortedAnimals = [...animals].sort((a,b) => a.id - b.id);

  const  pdf = await buildAnimalCareScheduleDoc(sortedAnimals);
  pdf.fileName = `Shelterly-SR-Animal-Care-Schedules-${srId.toString().padStart(3, 0)}-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
};

export {
  printServiceRequestSummary,
  printAllServiceRequests,
  printSrAnimalCareSchedules
}
