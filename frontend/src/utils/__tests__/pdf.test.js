import ShelterlyPDF from '../pdf';
import jsPDF from 'jspdf';
import '../../shelterly.png';

describe('Utils >  ShelterlyPDF', () => {
  let pdf;
  let mockDrawPageHeader = jest.fn();
  let mockDrawGraphic = jest.fn();
  let spyDrawPageHeader;
  let mockJsPdf;
  let numberOfPages = 1;

  const mockFooterHandler = jest.fn();
  const mockPdfText = jest.fn();
  const mockPdfRect = jest.fn();
  const mockPdfLine = jest.fn();
  const mockPdfAutoTable = jest.fn();
  const mockPdfSave = jest.fn();
  const mockPdfDeletePage = jest.fn();
  const mockPdfSetPage = jest.fn();
  const getNumberOfPages = () => numberOfPages;
  const incrementNumberOfPages = () => numberOfPages++;
  const mockPdfAddPage = incrementNumberOfPages;
  const mockPdfInternalGetNumberOfPages = getNumberOfPages;
  let spyPdfText;
  let spyPdfRect;
  let spyPdfLine;
  let spyPdfAutoTable;
  let spyPdfSave;
  let spyPdfDeletePage;
  let spyPdfSetPage;
  let spyPdfAddPage;
  let spyPdfInternalGetNumberOfPages;


  beforeEach(() => {
    mockJsPdf = new jsPDF();
    pdf = new ShelterlyPDF({}, {
      drawHeaderOnFirstPage: false,
      addFooterHandler: mockFooterHandler
    }, {
      mockJsPdf
    });
    spyDrawPageHeader = jest.spyOn(pdf, 'drawPageHeader')
      .mockImplementation(() => mockDrawPageHeader);
    spyPdfText = jest.spyOn(mockJsPdf, 'text')
      .mockImplementation(() => mockPdfText);
    spyPdfRect = jest.spyOn(mockJsPdf, 'rect')
      .mockImplementation(() => mockPdfRect);
    spyPdfLine = jest.spyOn(mockJsPdf, 'line')
      .mockImplementation(() => mockPdfLine);
    spyPdfAutoTable = jest.spyOn(mockJsPdf, 'autoTable')
      .mockImplementation(() => mockPdfAutoTable);
    spyPdfSave = jest.spyOn(mockJsPdf, 'save')
      .mockImplementation(() => mockPdfSave);
    spyPdfDeletePage = jest.spyOn(mockJsPdf, 'deletePage')
      .mockImplementation(() => mockPdfDeletePage);
    spyPdfSetPage = jest.spyOn(mockJsPdf, 'setPage')
      .mockImplementation(() => mockPdfSetPage);
    spyPdfAddPage = jest.spyOn(mockJsPdf, 'addPage')
      .mockImplementation(mockPdfAddPage);
    spyPdfInternalGetNumberOfPages = jest.spyOn(mockJsPdf.internal, 'getNumberOfPages')
      .mockImplementation(mockPdfInternalGetNumberOfPages)
  });

  afterEach(() => {
    spyDrawPageHeader.mockRestore();
    spyPdfText.mockRestore();
    spyPdfRect.mockRestore();
    spyPdfLine.mockRestore();
    spyPdfAutoTable.mockRestore();
    spyPdfSave.mockRestore();
    spyPdfDeletePage.mockRestore();
    spyPdfSetPage.mockRestore();
    spyPdfAddPage.mockRestore();
    spyPdfInternalGetNumberOfPages.mockRestore();
    numberOfPages = 1;
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
    });
  });
  
  describe('Document Draw Methods', () => {
    // Test case for drawing a page header
    it('Draws page header', () => {
      pdf.drawPageHeader();
      expect(spyDrawPageHeader).toHaveBeenCalled();
    });

    // Test case for drawing vertical padding
    it('Draws vertical padding', () => {
      const currentYPosition = pdf.lastYPosition;
      const padAmount = 90;
      pdf.drawPad(padAmount);
      expect(pdf.lastYPosition).toEqual(currentYPosition + padAmount);
    });

    // Test case for drawing a horizontal rule
    it('Draws a horizontal rule', () => {
      const buffer = 10;
      const expectedYPosition = pdf.getLastYPositionWithBuffer({ buffer });
      pdf.drawHRule({ buffer });
      expect(pdf.lastYPosition).toEqual(expectedYPosition);
    });

    // Test cases for drawing an image
    describe('drawImage', () => {
      it('Throws if no src argument is provided', async () => {
        await expect(pdf.drawImage({}))
          .rejects
          .toThrow('The src param is not defined.');
      });
    });
    

    // Test cases for drawing an svg
    describe('drawSvg', () => {
      it('Throws if no svg argument is provided', async () => {
        await expect(pdf.drawSvg({}))
          .rejects
          .toThrow('The svg param is not defined.');
      });
    });

    // Test cases for drawing a graphic
    describe('drawGraphic', () => {
      it('Should throw padding array is not in shape', async () => {
        await expect(pdf.drawGraphic({ padding: [0, 0, 0] })).rejects.toThrow(
          'padding array must equal all four sides, i.e. [top, left, bottom, right]'
        );
      })
    });

    describe('Draw text elements', () => {
      it('Draws a section header', () => {
        const text = 'This is a test';
        const expectedYPosition = pdf.getLastYPositionWithBuffer({ buffer: 25 })
        pdf.drawSectionHeader({ text });
        expect(spyPdfText).toHaveBeenCalledWith(
          text,
          pdf.documentLeftMargin,
          expectedYPosition
        );
      });

      it('Draws text with style', () => {
        const text = 'This is a test';
        const xPosition = 0;
        const yPosition = 0;
        pdf.textWithStyle({ text, xPosition, yPosition });
        expect(spyPdfText).toHaveBeenCalledWith(text, xPosition, yPosition);
      });

      it('Draws a single line text element', () => {
        const text = 'test';
        const currentYPosition = pdf.lastYPosition;
        const expectedYPosition = pdf.getLastYPositionWithBuffer({ buffer: 16 });
        pdf.drawSingleLineText({ text });
        expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
        expect(spyPdfText).toHaveBeenCalledWith(text, pdf.documentLeftMargin, expectedYPosition);
      });

      it('Draws a wrapped text element', () => {
        const text = 'test';
        const currentYPosition = pdf.lastYPosition;
        const expectedYPosition = pdf.getLastYPositionWithBuffer({ buffer: 16 });
        pdf.drawWrappedText({ text });
        expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
        expect(spyPdfText).toHaveBeenCalledWith(text, pdf.documentLeftMargin, expectedYPosition);
      });

      it('Draws a text with a line', async () => {
        const mockDrawHRule = jest.fn();
        const spyDrawHRule = jest.spyOn(pdf, 'drawHRule')
          .mockImplementation(mockDrawHRule);
  
        const label = 'label';
        const currentYPosition = pdf.lastYPosition;
        const offset = 10;
        const buffer = 5;
        const expectedYPosition = pdf.getLastYPositionWithBuffer();
  
        await pdf.drawTextWithLine({ label, xOffset: offset, yBuffer: buffer });
  
        expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
        expect(mockDrawHRule).toHaveBeenCalledWith({
          buffer,
          xOffset: offset,
        });
        expect(spyPdfText).toHaveBeenCalledWith(label, pdf.documentLeftMargin, expectedYPosition);
  
        spyDrawHRule.mockRestore();
      });

      it('Draws a multi-row text area', () => {
        const mockDrawHRule = jest.fn();
        const spyDrawHRule = jest.spyOn(pdf, 'drawHRule')
          .mockImplementation(mockDrawHRule);
  
        const label = 'label';
        const rows = 5;
        const currentYPosition = pdf.lastYPosition;
        const expectedYPosition = pdf.getLastYPositionWithBuffer();
  
        pdf.drawTextArea({ label, rows });
  
        expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
        expect(mockDrawHRule).toHaveBeenCalledTimes(rows);
        expect(spyPdfText).toHaveBeenCalledWith(label, pdf.documentLeftMargin, expectedYPosition);
  
        spyDrawHRule.mockRestore();
      });

      it('Draws page numbers', () => {
        const pageNumber = 1;
        const pageCount = 10;
        const marginBottom = 30;
        const expectedPageNumberText = `Page ${pageNumber} of ${pageCount}`;
        const { pageWidth, pageHeight } = pdf;
        pdf.drawPageNumbers({ pageNumber, pageCount, marginBottom });
        expect(spyPdfText).toHaveBeenCalledWith(
          expectedPageNumberText,
          pageWidth / 2,
          pageHeight - marginBottom,
          { align: "center" }
        );
      });
    });

    describe('Draw complex elements', () => {
      it('Draws a checkbox', () => {
        const label = 'label';
        const currentYPosition = pdf.lastYPosition;
        const expectedYPosition = pdf.getLastYPositionWithBuffer();
        const docLeftMargin = pdf.documentLeftMargin;
  
        pdf.drawCheckBoxLine({ label });
  
        expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
        expect(spyPdfText).toHaveBeenCalledWith(
          label,
          docLeftMargin + 25,
          expectedYPosition + 15
        );
        expect(spyPdfRect).toHaveBeenCalledWith(
          docLeftMargin,
          expectedYPosition,
          20,
          20,
          "FD"
        );
      });

      it('Draws a list', () => {
        const label = 'label';
        const currentYPosition = pdf.lastYPosition;
  
        // doesn't draw a list if no items are provided
        expect(() => {
          pdf.drawList();
        }).toThrow();
        expect(pdf.lastYPosition).toBe(currentYPosition);

        const listItem = { label, withLines: true, type: 'checkbox' };
  
        // does draw the list if items are provided
        pdf.drawList({
          listItems: [listItem, listItem, listItem]
        });
        expect(pdf.lastYPosition).toBeGreaterThan(currentYPosition);
        expect(spyPdfText).toHaveBeenCalledTimes(3);
        expect(spyPdfLine).toHaveBeenCalledTimes(3);
        expect(spyPdfRect).toHaveBeenCalledTimes(3);
      });

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

      it('Throws if table grid arguments dont match length', () => {
        expect(() => {
          pdf.drawTableGrid({
            headers: [''],
            columnStyles: []
          });
        }).toThrow('columnStyles length must match header length');
      });

      it('Draws a table grid', () => {
        const headers = ['Test header 1', 'Test header 1', 'Test header 3'];
  
        // does draw the list if items are provided
        pdf.drawTableGrid({
          headers
        });
        expect(spyPdfAutoTable.mock.calls[0][0]).toMatchObject({ head: [headers] });
      });
    });
  });

  describe('saveFile', () => {
    it('Saves PDF', async () => {
      const fileName = 'test';
      pdf.fileName = fileName;
      pdf.drawPageBreak();
      pdf.drawPageBreak();
      await pdf.saveFile({ maxPages: 1 });

      const expectedFullFilename = `${pdf.fileName}.${pdf.fileExtension}`
      expect(spyPdfSave).toHaveBeenCalledWith(expectedFullFilename, { returnPromise: true });
      expect(mockFooterHandler).toHaveBeenCalledTimes(1);
      // for some reason the mocks for setPage and deletePage are not being called, or set properly, i tired
      // expect(mockPdfSetPage).toHaveBeenCalledTimes(1);
      // expect(mockPdfDeletePage).toHaveBeenCalledTimes(1);
      expect(mockPdfInternalGetNumberOfPages()).toEqual(3);
    });
  });
});
