import ShelterlyPDF from '../pdf';
import '../../shelterly.png';
describe('Utils >  ShelterlyPDF', () => {
  it('Create new ShelterlyPDF instance', () => {
    const pdf = new ShelterlyPDF();
    expect(pdf instanceof ShelterlyPDF).toBe(true);
  });

  // Test case for setting and getting the fileName property
  it('Set and get fileName property', () => {
    const pdf = new ShelterlyPDF();
    pdf.fileName = 'test';
    expect(pdf.fileName).toBe('test');
  });

  // Test case for setting and getting the lastYPosition property
  it('Set and get lastYPosition property', () => {
    const pdf = new ShelterlyPDF();
    pdf.lastYPosition = 100;
    expect(pdf.lastYPosition).toBe(100);
  });

  // Test case for setting and getting the documentLeftMargin property
  it('Set and get documentLeftMargin property', () => {
    const pdf = new ShelterlyPDF();
    pdf.documentLeftMargin = 50;
    expect(pdf.documentLeftMargin).toBe(50);
  });

  // Test case for getting the fileExtension property
  it('Get fileExtension property', () => {
    const pdf = new ShelterlyPDF();
    expect(pdf.fileExtension).toBe('pdf');
  });

  // Test case for getting the pageHeight property
  it('Get pageHeight property', () => {
    const pdf = new ShelterlyPDF();
    expect(pdf.pageHeight).toBeGreaterThan(0);
  });

  // Test case for getting the pageWidth property
  it('Get pageWidth property', () => {
    const pdf = new ShelterlyPDF();
    expect(pdf.pageWidth).toBeGreaterThan(0);
  });

  // Test case for setting and getting document colors
  it('Set and get document colors', () => {
    const pdf = new ShelterlyPDF();
    const documentColor = '#ff0000';
    pdf.setDocumentColors({ rgb: [documentColor] });
    expect(pdf.drawColor).toEqual(documentColor);
    expect(pdf.textColor).toEqual(documentColor);
  });

  // Test case for setting and getting document font size
  it('Set and get document font size', () => {
    const pdf = new ShelterlyPDF();
    pdf.setDocumentFontSize({ size: 20 });
    expect(pdf.fontSize).toBe(20);
  });

  // Test case for getting the lastYPosition with buffer
  it('Get lastYPosition with buffer', () => {
    const pdf = new ShelterlyPDF();
    pdf.lastYPosition = 100;
    const buffer = 25;
    const padding = pdf.paddingBetweenElements;
    const yPosition = pdf.getLastYPositionWithBuffer({ buffer });
  
    expect(yPosition).toBe(100 + buffer + padding);
  });

  // Test case for adding a new page
  it('Add new page', () => {
    const pdf = new ShelterlyPDF();
    const totalPages = pdf.numberOfPages;
    pdf.addPage();
    expect(pdf.numberOfPages).toBe(totalPages + 1);
  });

  // Test case for setting a page by page number
  it('Set page by page number', () => {
    const pdf = new ShelterlyPDF();
    pdf.setPage(2);
    expect(pdf.currentPage).toBe(2);
  });

  // Test case for drawing a page break
  it('Draw page break', () => {
    const pdf = new ShelterlyPDF();
    const totalPages = pdf.numberOfPages;
    pdf.drawPageBreak();
    expect(pdf.numberOfPages).toBe(totalPages + 1);
    expect(pdf.currentPage).toBe(2);
  });

  // Test case for saving the PDF
  // it('Save PDF', async () => {
  //   const pdf = new ShelterlyPDF();
  //   const fileName = 'test';
  //   pdf.fileName = fileName;
  //   const savedPdf = await pdf.saveFile();
  //   const savedFileName = savedPdf.internal.fileTitle;
  //   expect(savedFileName).toBe(`${fileName}.pdf`);
  // });
});
