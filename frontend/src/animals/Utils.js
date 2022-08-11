import ShelterlyPDF from '../utils/pdf';

export const printAnimalCareSchedule = (animal, images) => {
  const pdf = new ShelterlyPDF();
  pdf.fileName = `Animal-Care-Schedule-${animal.id.toString().padStart(3, 0)}`;

  // draw page header
  pdf.drawPageHeader({
    text: 'Owner Summary',
    subText: `Date: ${new Date().toLocaleDateString()}`
  });
  pdf.drawHRule();

  const imageSrc = images.find((image) => image) || '/static/images/image-not-found.png'
  pdf.drawImage({
    src: imageSrc,
    maxHeight: 75,
    maxWidth: 75,
    padding: [10, 0, 10, 50],
    display: 'inline'
  });

  pdf.setDocumentFontSize({ size: 12 });
  pdf.drawPad(-15);

  const labelsList = [
    [`Animal No: A#${animal.id}`, `Animal Name: ${animal.name}`],
    [
      `Intake Date: ${new Date(animal.intake_date).toLocaleDateString()}`,
      `Location: ${animal.room ? `${animal.building_name} / ${animal.room_name}` : 'N/A'}`
    ],
    [`Species: ${animal.species}`, `Color: ${animal.pcolor} ${animal.scolor ? `/ ${animal.scolor}` : '' }`],
    [`Age: ${animal.age}`, `Under Vet Care: Y / N`]
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

  pdf.drawWrappedText({ text: `Owner(s): ${animal.owners.map((owner) => `${owner.first_name} ${owner.last_name} ${owner.display_phone}`).join('; ')}`})

  pdf.drawPad(-15);

  const additionalLabelsList = [
    [`Aggressive: ${animal.aggressive}`, `Injured: ${animal.injured}`, `Fixed: ${animal.fixed}`],
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
    linePadding: -5,
    bottomPadding: 0
  });
  pdf.drawWrappedText({
    text: `Behavior Notes: ${animal.behavior_notes || 'N/A'}`,
    bottomPadding: 0,
  });
  pdf.drawWrappedText({
    text: `Medical Notes: ${animal.medical_notes || 'N/A'}`
  });

  pdf.drawHRule();

  pdf.drawTableGrid({
    headers: ['Date\nTime', 'AR#', 'Actions', 'Comments']
  });

  pdf.saveFile({ maxPages: 1 });
};
