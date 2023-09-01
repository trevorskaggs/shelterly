import ShelterlyPDF from '../pdf';
import '../../shelterly.png';

describe('Utils >  ShelterlyPDF', () => {
  let pdf;
  let mockDrawPageHeader = jest.fn();
  let mockDrawGraphic = jest.fn();
  let spyDrawPageHeader;
  let spyDrawGraphic;

  beforeEach(() => {
    pdf = new ShelterlyPDF({}, {
      drawHeaderOnFirstPage: false
    });
    spyDrawPageHeader = jest.spyOn(pdf, 'drawPageHeader')
      .mockImplementation(() => mockDrawPageHeader);
    spyDrawGraphic = jest.spyOn(pdf, 'drawGraphic')
      .mockImplementation(() => mockDrawGraphic);
  });

  afterEach(() => {
    spyDrawPageHeader.mockRestore();
    spyDrawGraphic.mockRestore();
  })

  it('Creates new ShelterlyPDF instance', () => {
    expect(pdf instanceof ShelterlyPDF).toBe(true);
    expect(mockDrawGraphic).not.toHaveBeenCalled();
  });

  describe('Setters & Getters', () => {
    // Test case for setting and getting the fileName property
    it('Sets and gets fileName property', () => {
      pdf.fileName = 'test';
      expect(pdf.fileName).toBe('test');
    });

    // Test case for setting and getting the lastYPosition property
    it('Sets and gets lastYPosition property', () => {
      pdf.lastYPosition = 100;
      expect(pdf.lastYPosition).toBe(100);
    });

    // Test case for setting and getting the documentLeftMargin property
    it('Sets and gets documentLeftMargin property', () => {
      pdf.documentLeftMargin = 50;
      expect(pdf.documentLeftMargin).toBe(50);
    });

    // Test case for getting the fileExtension property
    it('Gets fileExtension property', () => {
      expect(pdf.fileExtension).toBe('pdf');
    });

    // Test case for getting the pageHeight property
    it('Gets pageHeight property', () => {
      expect(pdf.pageHeight).toBeGreaterThan(0);
    });

    // Test case for getting the pageWidth property
    it('Gets pageWidth property', () => {
      expect(pdf.pageWidth).toBeGreaterThan(0);
    });

    // Test case for setting and getting document colors
    it('Sets and gets document colors', () => {
      const documentColor = '#ff0000';
      pdf.setDocumentColors({ rgb: [documentColor] });
      expect(pdf.drawColor).toEqual(documentColor);
      expect(pdf.textColor).toEqual(documentColor);
    });

    // Test case for setting and getting document font size
    it('Sets and gets document font size', () => {
      pdf.setDocumentFontSize({ size: 20 });
      expect(pdf.fontSize).toBe(20);
    });
  })

  describe('Document Page Manipulation', () => {
    // Test case for getting the lastYPosition with buffer
    it('Get lastYPosition with buffer', () => {
      pdf.lastYPosition = 100;
      const buffer = 25;
      const padding = pdf.paddingBetweenElements;
      const yPosition = pdf.getLastYPositionWithBuffer({ buffer });

      expect(yPosition).toBe(100 + buffer + padding);
    });

    // Test case for adding a new page
    it('Add new page', () => {
      const totalPages = pdf.numberOfPages;
      pdf.addPage();
      expect(pdf.numberOfPages).toBe(totalPages + 1);
    });

    // Test case for setting a page by page number
    it('Set page by page number', () => {
      pdf.setPage(2);
      expect(pdf.currentPage).toBe(2);
    });

    // Test case for drawing a page break
    it('Draw page break', () => {
      const totalPages = pdf.numberOfPages;
      pdf.drawPageBreak();
      expect(pdf.numberOfPages).toBe(totalPages + 1);
      expect(pdf.currentPage).toBe(2);
    });

    // Test case for conditionally drawing a page break based on document last Y position
    it('Can conditionally draw a page break based on document y position', () => {
      const totalPages = pdf.numberOfPages;
      const pageHeight = pdf.pageHeight;

      pdf.beforeDraw();
      expect(pdf.numberOfPages).toBe(totalPages);

      pdf.beforeDraw({ yPosition: pageHeight });
      expect(pdf.numberOfPages).toBe(totalPages + 1);
    })
  })
  
  describe('Document Draw Methods', () => {
    // Test case for drawing a page header
    it('Draws page header', () => {
      pdf.drawPageHeader();
      expect(spyDrawPageHeader).toHaveBeenCalled();
    });

    // Test case for drawing a graphic
    it('Draws a graphic', () => {
      pdf.drawGraphic();
      expect(spyDrawGraphic).toHaveBeenCalled();
    });

    // Test case for drawing a text element
    it('Draws a single line text element', () => {
      const text = 'test';
      const currentYPosition = pdf.lastYPosition;
      pdf.drawSingleLineText({ text });
      expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
    });

    // Test case for drawing a wrapped text element
    it('Draws a wrapped text element', () => {
      const text = 'test';
      const currentYPosition = pdf.lastYPosition;
      pdf.drawWrappedText({ text });
      expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
    });

    // Test case for drawing a text with a line
    it('Draws a text with a line', async () => {
      const mockDrawHRule = jest.fn();
      const spyDrawHRule = jest.spyOn(pdf, 'drawHRule')
        .mockImplementation(mockDrawHRule);

      const label = 'label';
      const currentYPosition = pdf.lastYPosition;
      const offset = 10;
      const buffer = 5;

      await pdf.drawTextWithLine({ label, xOffset: offset, yBuffer: buffer });

      expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
      expect(mockDrawHRule).toHaveBeenCalledWith({
        buffer,
        xOffset: offset,
      });

      spyDrawHRule.mockRestore();
    });

    // Test case for drawing a text area
    it('Draws a multi-row text area', () => {
      const mockDrawHRule = jest.fn();
      const spyDrawHRule = jest.spyOn(pdf, 'drawHRule')
        .mockImplementation(mockDrawHRule);

      const label = 'label';
      const rows = 5;
      const currentYPosition = pdf.lastYPosition;

      pdf.drawTextArea({ label, rows });

      expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
      expect(mockDrawHRule).toHaveBeenCalledTimes(rows);

      spyDrawHRule.mockRestore();
    });

    // Test case fro drawing a checkbox
    it('Draws a checkbox', () => {
      const label = 'label';
      const currentYPosition = pdf.lastYPosition;

      pdf.drawCheckBoxLine({ label });

      expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
    });

    // Test case for drawing a list
    it('Draws a list', () => {
      const label = 'label';
      const currentYPosition = pdf.lastYPosition;

      // doesn't draw a list if no items are provided
      expect(() => {
        pdf.drawList();
      }).toThrow();
      expect(pdf.lastYPosition).toBe(currentYPosition);

      // does draw the list if items are provided
      pdf.drawList({
        listItems: [{ label }, { label }, { label }]
      });
      expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
    });

    // Test case for drawing a grid
    it('Draws a grid', () => {
      const mockDrawList = jest.fn();
      const spyDrawList = jest.spyOn(pdf, 'drawList')
        .mockImplementation(mockDrawList);

      const label = 'label';
      const blocks = [
        [{ label }, { label }, { label }],
        [{ label }, { label }, { label }],
          [{ label }, { label }, { label }],
          [{ label }, { label }, { label }],
          [{ label }, { label }, { label }],
      ];
      pdf.drawGrid({ blocks });

      expect(mockDrawList).toHaveBeenCalledTimes(blocks.length);

      spyDrawList.mockRestore();
    });

    // Test case for drawing a checkbox list
    it('Draws a checkbox list', () => {
      const mockDrawList = jest.fn();
      const spyDrawList = jest.spyOn(pdf, 'drawList')
        .mockImplementation
        (mockDrawList);

      const label = 'label';
      const listItem = { label, type: 'checkbox', size: 20 };
      const labels = [listItem, listItem, listItem];
      const listStyle = 'block';
      const bottomPadding = 10;

      pdf.drawCheckboxList({ labels, listStyle, bottomPadding });

      expect(mockDrawList).toHaveBeenCalledWith({
        listStyle,
        rightAlign: false,
        listItems: labels,
        bottomPadding
      });

      spyDrawList.mockRestore();
    });

    // Test case for drawing a text list
    it('Draws a text list', () => {
      const mockDrawList = jest.fn();
      const spyDrawList = jest.spyOn(pdf, 'drawList')
        .mockImplementation(mockDrawList);

      const label = 'label';
      const labels = [label, label, label];
      const listStyle = 'block';
      const bottomPadding = 10;

      pdf.drawTextList({ labels, listStyle, bottomPadding });

      expect(mockDrawList).toHaveBeenCalledWith({
        listStyle,
        listItems: labels.map((label) => ({
          label,
          marginTop: 0,
          inlineRightMargin: 0,
          inlineOffset: 0,
          withLines: false
        })),
        bottomPadding
      });

      spyDrawList.mockRestore();
    });
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
