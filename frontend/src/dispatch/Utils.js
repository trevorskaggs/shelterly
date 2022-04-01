
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

  // draw team section
  pdf.drawSectionHeader({ text: data.team_object.name, hRule: true });
  pdf.drawTextList({
    labels: data.team && data.team_object.team_member_objects.map(team_member => (
      `${team_member.first_name} ${team_member.last_name} ${team_member.agency_id ? `(${team_member.agency_id})` : ''}`
    )),
    bottomPadding: 20
  });

  // loop through SR's and page break between each one
  data.assigned_requests.forEach((assigned_request, index) => {
    if (index > 0) {
      pdf.drawPageBreak();
    }
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
    pdf.drawSectionHeader({ text: 'Animals', hRule: true });

    pdf.drawGrid({
      blocks: assigned_request.service_request_object.animals.filter(animal => Object.keys(assigned_request.animals).includes(String(animal.id))).map((animal, index) => ({
        listItems: [
          { label: `A#${animal.id} - ${animal.name || 'Unknown'} - ${animal.species}` },
          ...dispatchStatusChoices.filter((choice) => choice.value !== 'REPORTED' ).map((choice) => ({
            type: 'checkbox',
            label: choice.label,
            size: 20
          }))
        ],
        bottomPadding: 20
      }))
    });

    // priorities
    pdf.drawSectionHeader({ text: 'Priority', hRule: true });
    pdf.drawCheckboxList({
      labels: priorityChoices.map((priority) => priority.label),
      listStyle: 'inline',
      bottomPadding: 25
    });

    // date completed, followup, etc..
    pdf.drawTextWithLine({ label: 'Date Completed:', xOffset: 120, yBuffer: 0 });
    pdf.drawTextWithLine({ label: 'Followup Date:', xOffset: 110, yBuffer: 20 });
    pdf.drawTextArea({ label: 'Visit Notes:' });
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
