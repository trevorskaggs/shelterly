import ShelterlyPDF from '../utils/pdf';
import { priorityChoices } from '../constants';
import { statusChoices } from '../animals/constants';

export const printDispatchResolutionForm = (data) => {
  const pdf = new ShelterlyPDF({}, {
    // adds page numbers to the footer
    addFooterHandler: ({
      pageNumber,
      pageCount,
      pdf
    }) => {
      const { width: pageWidth, height: pageHeight } = pdf.internal.pageSize;
      pdf.text('Page ' + String(pageNumber) + ' of ' + String(pageCount), pageWidth / 2, pageHeight - 15, {
        align: 'center'
      });
    },
    pageTitle: 'Dispatch Assignment',
    pageSubtitle: `Opened: ${new Date(data.start_time).toLocaleDateString()}`
  });

  pdf.fileName = `DAR-${data.id.toString().padStart(3, 0)}`;

  // draw team section
  pdf.drawSectionHeader({ text: data.team_object.name, hRule: false });
  pdf.drawTextList({
    labels: data.team && data.team_object.team_member_objects.map(team_member => (
      `${team_member.first_name} ${team_member.last_name} ${team_member.display_phone ? `${team_member.display_phone}` : ''}`
    ))
  });

  pdf.drawPad();

  // summary page
  data.assigned_requests.forEach((assigned_request, index) => {
    // service request priority
    const srPriority = priorityChoices.find(({ value }) => value === (assigned_request.service_request_object.priority || 2))
    // Summary page
    pdf.drawSectionHeader({
      text: `SR#${assigned_request.service_request_object.id} - ${srPriority.label} Priority`
    });

    pdf.drawPad(20);

    // summary address
    pdf.drawSectionHeader({ text: 'Service Request Address:', fontSize: 14 });

    const [addressLine1, ...addressLine2] = assigned_request.service_request_object.full_address.split(',')

    pdf.drawTextList({
      labels: [
        addressLine1,
        addressLine2.join(',')?.trim?.()
      ],
      bottomPadding: 12
    })

    // lat/lng
    pdf.drawWrappedText({
      text: `Latitude: ${assigned_request.service_request_object.latitude},  Longitude: ${assigned_request.service_request_object.longitude}`
    });

    // Animal count
    pdf.drawSectionHeader({ text: 'Animals', fontSize: 14 });

    const animalCounts = [];
    assigned_request.service_request_object.animals
      .filter(animal => Object.keys(assigned_request.animals).includes(String(animal.id)))
      .forEach((animal, index) => {
        const countIndex = animalCounts.findIndex(([species]) => animal.species === species);
        if (countIndex > -1) {
          const [currentSpecies, oldCount] = animalCounts[countIndex];
          animalCounts[countIndex] = [currentSpecies, oldCount + 1];
        } else {
          animalCounts.push([animal.species, 1]);
        }
      });

    pdf.drawTextList({
      labels: animalCounts.map(([species, count]) => (
        // capitalize the species
        `${species.replace(/(^.)/, m => m.toUpperCase())}: ${count}`
      ))
    });

    pdf.drawPad(30);
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
      hRule: false
    });
    pdf.drawPad(20);
    pdf.drawWrappedText({
      text: `Latitude: ${assigned_request.service_request_object.latitude},  Longitude: ${assigned_request.service_request_object.longitude}`
    });
    pdf.drawPad(-10);
    pdf.drawHRule();
    pdf.drawPad(-10);
    pdf.drawCheckboxList({
      labels: ['Completed', 'Not Completed Yet', 'Unable to Complete'],
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
      text: `Additional Information: ${assigned_request.service_request_object.directions || 'N/A'}`
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
    }].concat(statusChoices.filter((choice) => choice.value !== 'REPORTED'));

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
            return 'No Further Action';
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
        marginTop: -10
      }].concat(Array(5).fill({
        type: 'checkbox',
        label: '',
        size: 20
      }));

      pdf.drawList({
        listItems: animalRow,
        listStyle: 'inline',
        bottomPadding: 0
      });

      pdf.drawWrappedText({
        text: `Primary Color: ${animal.pcolor || 'N/A'}, Secondary Color: ${animal.scolor || 'N/A'}`,
        linePadding: 10
      });
      pdf.drawWrappedText({
        text: `Description: ${animal.color_notes || 'N/A'}`,
        bottomPadding: 5
      });
      pdf.drawWrappedText({
        text: `Behavior: ${animal.behavior_notes || 'N/A'}`,
        bottomPadding: 5,
        linePadding: -10
      });
      pdf.drawWrappedText({
        text: `Medical: ${animal.medical_notes || 'N/A'}`,
        linePadding: -10
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

  pdf.saveFile();
}
