import moment from 'moment';
import ShelterlyPDF from '../utils/pdf';
import { capitalize } from '../utils/formatString';
import { priorityChoices, DATE_FORMAT } from '../constants';
import { statusChoices } from '../animals/constants';
import { buildAnimalCountList } from '../animals/Utils';

const buildDispatchResolutionsDoc = (drs = []) => {
  const pdf = new ShelterlyPDF({}, {
    // adds page numbers to the footer
    addFooterHandler: ShelterlyPDF.HandlerTypes.DEFAULT,
    pageTitle: `Dispatch Assignment ${drs.length ? `#${drs[0].id}` : ''}`,
    pageSubtitle: drs.length
      ? `Opened: ${new Date(drs[0].start_time).toLocaleDateString()}`
      : ''
  });

  drs.forEach((data, i) => {
    if (i > 0) {
      pdf.drawPageBreak();
      pdf.drawPageHeader({
        pageTitle: `Dispatch Assignment #${data.id}`,
        subtitle: `Opened: ${new Date(data.start_time).toLocaleDateString()}`
      });
    }

    // draw team section
    pdf.drawSectionHeader({ text: data.team_object.name, hRule: false, fontSize: 12 });
    pdf.drawPad(10)
    pdf.setDocumentFontSize({ size: 10 });
    pdf.drawTextList({
      labels: data.team && data.team_object.team_member_objects.map(team_member => (
        `${team_member.first_name} ${team_member.last_name} ${team_member.display_phone ? `${team_member.display_phone}` : ''}`
      )),
      labelMarginTop: -10
    });

    // reset document font size
    pdf.setDocumentFontSize();

    pdf.drawPad(10);

    // summary page
    data.assigned_requests.forEach((assigned_request, index) => {
      // service request priority
      const srPriority = priorityChoices.find(({ value }) => value === (assigned_request.service_request_object.priority || 2))

      // Summary page
      pdf.drawSectionHeader({
        text: `SR#${assigned_request.service_request_object.id} - ${srPriority.label} Priority`,
        fontSize: 12
      });

      pdf.drawPad(15);

      // status
      pdf.drawWrappedText({
        text: `Status: ${assigned_request.service_request_object.status.toUpperCase()}`,
        fontSize: 10
      });

      // summary address
      pdf.drawSectionHeader({ text: 'Service Request Address:', fontSize: 12 });
      pdf.drawPad(15);

      const [addressLine1, ...addressLine2] = assigned_request.service_request_object.full_address.split(',');

      pdf.setDocumentFontSize({ size: 10 });

      pdf.drawTextList({
        labels: [
          addressLine1,
          addressLine2.join(',')?.trim?.()
        ],
        bottomPadding: 12,
        labelMarginTop: -10
      })

      // reset document font size
      pdf.setDocumentFontSize();

      // lat/lng
      pdf.drawWrappedText({
        text: `Latitude: ${assigned_request.service_request_object.latitude},  Longitude: ${assigned_request.service_request_object.longitude}`,
        fontSize: 10
      });

      // Animal count
      pdf.drawSectionHeader({ text: 'Animals', fontSize: 12 });

      const assignedRequestAnimals =
        assigned_request.service_request_object.animals.filter((animal) =>
          Object.keys(assigned_request.animals).includes(String(animal.id))
        );

      pdf.setDocumentFontSize({ size: 10 });
      buildAnimalCountList(pdf, assignedRequestAnimals, { countLabelMarginTop: -10 });

      // rest document font size
      pdf.setDocumentFontSize();

      pdf.drawPad(15);
    });

    // end of summary page break
    pdf.drawPageBreak();

    // loop through SR's and page break between each one
    data.assigned_requests.forEach((assigned_request, index) => {
      if (index > 0) {
        pdf.drawPageBreak();
      }

      // SR Header
      pdf.drawSectionHeader({
        text: `SR#${assigned_request.service_request_object.id} - ${assigned_request.service_request_object.full_address}`,
        hRule: false,
        fontSize: 14
      });
      pdf.drawPad(15);
      pdf.drawWrappedText({
        text: `Latitude: ${assigned_request.service_request_object.latitude},  Longitude: ${assigned_request.service_request_object.longitude}`
      });
      pdf.drawPad(-45);
      pdf.drawCheckboxList({
        labels: [''],
        listStyle: 'inline',
        rightAlign:true
      });
      pdf.drawPad(-10);
      pdf.drawHRule();
      pdf.drawPad(-10);
      pdf.drawCheckboxList({
        labels: ['Unable to Complete'],
        listStyle: 'inline',
      });

      // owners
      if (assigned_request.service_request_object.owners.length) {
        assigned_request.service_request_object.owner_objects.forEach((owner) => (
          pdf.drawWrappedText({
            text: `Owner: ${owner.first_name} ${owner.last_name} ${owner.display_phone}`
          })
        ));
      }

      // reporter
      if (assigned_request.service_request_object.reporter_object) {
        pdf.drawWrappedText({
          text: `Reporter: ${assigned_request.service_request_object.reporter_object.first_name} ${assigned_request.service_request_object.reporter_object.last_name} ${assigned_request.service_request_object.reporter_object.agency ? '(' + assigned_request.service_request_object.reporter_object.agency + ')' : 'No'} ${assigned_request.service_request_object.reporter_object.display_phone}`
        })
      }

      // additional info
      pdf.drawWrappedText({
        text: `Instructions for Field Team: ${assigned_request.service_request_object.directions || 'N/A'}`
      });

      // accessible
      pdf.drawWrappedText({
        text: `Accessible: ${assigned_request.service_request_object.accessible ? 'Yes' : 'No'}`
      });

      // turn around
      pdf.drawWrappedText({
        text: `Turn Around: ${assigned_request.service_request_object.turn_around ? 'Yes' : 'No'}`
      });

      // animals
      pdf.drawSectionHeader({
        text: 'Animals'
      });

      const dispatchStatusHeaders = [{
        value: '', label: 'ID - Species\nName'
      }].concat(statusChoices.filter((choice) => !choice.value.includes('REPORTED')));

      function drawAnimalHeader() {
        pdf.drawTextList({
          labels: dispatchStatusHeaders.map((choice) => {
            if (choice.label.indexOf('SIP') > -1) {
              return 'SIP';
            }
            if (choice.label.indexOf('UTL') > -1) {
              return 'UTL';
            }
            if (choice.label.indexOf('No Further Action (NFA)') > -1) {
              return 'NFA';
            }

            return choice.label;
          }),
          listStyle: 'inline',
          bottomPadding: 5
        });

        pdf.drawHRule();
      }

      // draw the animals header before the animals table
      pdf.setDocumentFontSize({ size: 10 });
      drawAnimalHeader();
      

      // keep the last y position after a row was drawn
      let lastYPosAfterDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
      assigned_request.service_request_object.animals.filter(animal => Object.keys(assigned_request.animals).includes(String(animal.id))).forEach((animal) => {
        // grab the last y position before we draw a row
        const lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });

        const animalRow = [{
          label: `A#${animal.id} - ${animal.species[0].toUpperCase()}${animal.species.slice(1)}\n${animal.name || 'Unknown'}\n${animal.status}`,
          marginTop: -7
        }].concat(Array(6).fill({
          type: 'checkbox',
          label: '',
          size: 20
        }));

        pdf.drawList({
          listItems: animalRow,
          listStyle: 'inline',
          bottomPadding: 0
        });

        pdf.setDocumentFontSize({ size: 10 });

        pdf.drawTextList({
          labels: [
            `Sex: ${animal.sex}`,
            `Fixed: ${capitalize(animal.fixed)}`,
            `ACO Required: ${capitalize(animal.aco_required)}`,
            `Aggressive: ${capitalize(animal.aggressive)}`,
            `Confined: ${capitalize(animal.confined)}`,
            `Injured: ${capitalize(animal.injured)}`,
            `Last Seen: ${animal.last_seen ? moment(animal.last_seen).format('MMMM Do YYYY HH:mm') : 'Unknown'}`,
            `Age: ${capitalize(animal.age)}`,
            `Size: ${capitalize(animal.size)}`,
            `Primary Color: ${capitalize(animal.pcolor) || 'N/A'}`,
            `Secondary Color: ${capitalize(animal.scolor) || 'N/A'}`
          ],
          listStyle: 'grid',
          labelMarginTop: -4
        });

        // reset document font size
        pdf.setDocumentFontSize();

        pdf.drawPad(13);

        pdf.drawWrappedText({
          text: `Description: ${animal.color_notes || 'N/A'}`,
          bottomPadding: 0,
          fontSize: 10
        });
        pdf.drawWrappedText({
          text: `Behavior: ${animal.behavior_notes || 'N/A'}`,
          bottomPadding: 0,
          fontSize: 10
        });
        pdf.drawWrappedText({
          text: `Medical: ${animal.medical_notes || 'N/A'}`,
          fontSize: 10
        });

        lastYPosAfterDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });

        // If after draw y position is less than before draw, that means there was a page break.
        // Draw the animal header again.
        if (lastYPosAfterDraw < lastYPosBeforeDraw) {
          drawAnimalHeader();
        }
      });

      pdf.setDocumentFontSize();

      // priorities
      pdf.drawSectionHeader({ text: 'Priority', hRule: true });
      pdf.setDocumentFontSize({ size: 10 });
      const currentPriority = assigned_request.service_request_object.priority || 2
      pdf.drawCheckboxList({
        labels: priorityChoices.map(({ value, label}) => {
          if (value === currentPriority) {
            return `${label} (Current)`
          }
          return label
        }),
        listStyle: 'inline',
      });
      pdf.setDocumentFontSize();

      // date completed, followup, etc..
      pdf.drawTextList({
        labels: [
          'Date Completed:  ________/________/________________'
        ],
        bottomPadding: 5
      });
      pdf.drawTextList({
        labels: [
          'Followup Date:  ________/________/________________'
        ],
        bottomPadding: 16
      })
      pdf.drawTextArea({ label: 'Visit Notes:', rows: 4 });
      pdf.drawCheckBoxLine({ label: 'Forced Entry' });

      // owners contacted
      if (assigned_request.service_request_object.owners.length) {
        pdf.drawTextList({
          labels: ['Owner Contacted:']
        });

        assigned_request.service_request_object.owner_objects.forEach((owner) => {
          pdf.drawCheckBoxLine({ label: `Owner: ${owner.first_name} ${owner.last_name} ${owner.display_phone}` });
          pdf.drawTextWithLine({ label: 'Owner Contact Time:', xOffset: 150 });
          pdf.drawTextArea({ label: 'Owner Contact Notes:' });
        });
      }
    });
  });

  return pdf;
}

function printDispatchResolutionForm(dr = {}) {
  const pdf = buildDispatchResolutionsDoc([dr]);
  pdf.fileName = `DAR-${dr.id.toString().padStart(3, 0)}`;
  return pdf.saveFile();
}

function printAllDispatchResolutions(drs = []) {
  const pdf = buildDispatchResolutionsDoc(drs);
  pdf.fileName = `DARs-${moment().format(DATE_FORMAT)}`;
  return pdf.saveFile();
}

export {
  printDispatchResolutionForm,
  printAllDispatchResolutions
};
