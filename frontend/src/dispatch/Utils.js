
import ShelterlyPDF from '../utils/pdf';
import { priorityChoices } from '../constants';
import { dispatchStatusChoices } from '../animals/constants';

export const printDispatchResolutionForm = (data) => {
  const pdf = new ShelterlyPDF();

  // draw page header
  pdf.drawPageHeader({
    text: 'Dispatch Assignment Resolution Form',
    subText: `Opened: ${new Date(data.start_time).toLocaleDateString()}`
  });
  pdf.drawHRule();

  // loop through SR's and page break between each one
  data.assigned_requests.forEach((assigned_request, index) => {
    if (index > 0) {
      pdf.drawPageBreak();
    }

    // Summary page
    pdf.drawSectionHeader({
      text: `SR#${assigned_request.service_request_object.id} - Summary`,
      hRule: false
    });

    // summary address
    pdf.drawTextList({
      labels: [
        '',
        'Service Request Address:'
      ],
      bottomPadding: 8
    })

    const [addressLine1, ...addressLine2] = assigned_request.service_request_object.full_address.split(',')

    pdf.drawTextList({
      labels: [
        addressLine1,
        addressLine2.join(',')?.trim?.()
      ],
      bottomPadding: 30
    })

    // Animal count
    pdf.drawTextList({
      labels: [ 'Animals' ],
      bottomPadding: 8
    });

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

    // end of summary page break
    pdf.drawPageBreak();

    // draw team section
    pdf.drawSectionHeader({ text: data.team_object.name, hRule: true });
    pdf.drawTextList({
      labels: data.team && data.team_object.team_member_objects.map(team_member => (
        `${team_member.first_name} ${team_member.last_name} ${team_member.agency_id ? `(${team_member.agency_id})` : ''}`
      )),
      bottomPadding: 20
    });

    // SR Header
    pdf.drawSectionHeader({
      text: `SR#${assigned_request.service_request_object.id} - ${assigned_request.service_request_object.full_address}`,
      hRule: true
    });

    pdf.drawCheckboxList({
      labels: ['Not Completed Yet', 'Unable to Complete'],
      listStyle: 'grid'
    });

    // owners
    if (assigned_request.service_request_object.owners.length) {
      pdf.drawTextList({
        labels: assigned_request.service_request_object.owner_objects.map((owner) => (
          `Owner: ${owner.first_name} ${owner.last_name} ${owner.phone}`
        ))
      })
    } else {
      //no owners
      pdf.drawTextList({
        labels: ['Owner: No Owner']
      })
    }
    
    // additional info
    pdf.drawTextList({
      labels: [
        `Additional Information: ${assigned_request.service_request_object.directions || 'N/A'}`,
        `Accessible: ${assigned_request.service_request_object.accessible ? 'Yes' : 'No'}`,
        `Turn Around: ${assigned_request.service_request_object.turn_around ? 'Yes' : 'No'}`
      ],
      bottomPadding: 20
    })

    // animals
    pdf.drawSectionHeader({
      text: 'Animals'
    });

    const dispatchStatusHeaders = [{
      value: '', label: 'ID - Species\nName'
    }].concat(dispatchStatusChoices.filter((choice) => choice.value !== 'REPORTED'));

    function drawAnimalHeader() {
      pdf.drawTextList({
        labels: dispatchStatusHeaders.map((choice) => {
          if (choice.label.indexOf('SIP') > -1) {
            return 'SIP';
          }
          if (choice.label.indexOf('UTL') > -1) {
            return 'UTL';
          }
  
          return choice.label;
        }),
        listStyle: 'inline',
        bottomPadding: 5
      });
  
      pdf.drawHRule();
    }

    // draw the animals header before the animals table
    pdf.setDocumentFontSize({ size: 11 });
    drawAnimalHeader();
    

    // keep the last y position after a row was drawn
    let lastYPosAfterDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });
    assigned_request.service_request_object.animals.filter(animal => Object.keys(assigned_request.animals).includes(String(animal.id))).forEach((animal) => {
      // grab the last y position before we draw a row
      const lastYPosBeforeDraw = pdf.getLastYPositionWithBuffer({ buffer: 0 });

      const animalRow = [{
        label: `A#${animal.id} - ${animal.species}\n${animal.name || 'Unknown'}`,
        marginTop: -10
      }].concat(Array(4).fill({
        type: 'checkbox',
        label: '',
        size: 20
      }));

      pdf.drawList({
        listItems: animalRow,
        listStyle: 'inline',
        bottomPadding: 0
      });

      const animalDetails = [
        `Primary Color: ${animal.pcolor || 'N/A'}, Secondary Color: ${animal.scolor}`,
        `Description: ${animal.color_notes || 'N/A'}`,
        `Behavior: ${animal.behavior_notes || 'N/A'}`
      ];
      
      // secondary row
      if (animalDetails.length > 0) {
        pdf.drawTextList({
          labels: animalDetails,
          labelMarginTop: -10,
          bottomPadding: 0
        });
      }

      pdf.drawHRule({ buffer: 15 });
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
    pdf.setDocumentFontSize({ size: 11 });
    const currentPriority = data.sr_updates[index] ? data.sr_updates[index].priority : 2
    pdf.drawCheckboxList({
      labels: priorityChoices.map(({ value, label}) => {
        if (value === currentPriority) {
          return `${label} (Current)`
        }
        return label
      }),
      listStyle: 'inline',
      bottomPadding: 25
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
      bottomPadding: 20
    })
    pdf.drawTextArea({ label: 'Visit Notes:', rows: 4 });
    pdf.drawCheckBoxLine({ label: 'Forced Entry' });

    // owners contacted
    if (assigned_request.service_request_object.owners.length) {
      pdf.drawTextList({
        labels: ['Owner Contacted:']
      });

      assigned_request.service_request_object.owner_objects.forEach((owner) => {
        pdf.drawCheckBoxLine({ label: `Owner: ${owner.first_name} ${owner.last_name} ${owner.phone}` });
        pdf.drawTextWithLine({ label: 'Owner Contact Time:', xOffset: 150 });
        pdf.drawTextArea({ label: 'Owner Contact Notes:' });
      });
    }
  });

  pdf.saveFile();
}
