import jsPDF from 'jspdf';
import logo from '../static/images/shelterly.png';

const defaultFormat = {
  orientation: 'p',
  unit: 'pt',
  format: 'a4'
};

const rgbColors = {
  SHELTERLY_BROWN: [139, 107, 82],
  DEFAULT: [0, 0, 0],
  WHITE: [255, 255, 255]
}

class ShelterlyPDF {
  // private properties
  #jsPDF;
  #fileName = 'shelterly-pdf';
  #fileExtension = 'pdf';
  #pageTitle = 'Shelterly PDF';
  #paddingBetweenElements = 5;
  #documentDrawColor = rgbColors.DEFAULT;
  #documentTextColor = rgbColors.DEFAULT;
  #documentFontSize = 15;
  #documentTitle1FontSize = 25;
  #documentTitle2FontSize = 20;
  #defaultXMargin = 15;
  #documentLeftMargin = this.#defaultXMargin;
  #documentRightMargin = this.#defaultXMargin;
  #documentLastYPosition = 0;
  #defaultElementBuffer = 20;
  #totalPages = 1;
  #currentPage = 1;
  #pageRewound = false;

  constructor (format = {}) {
    this.#jsPDF = new jsPDF({
      ...defaultFormat,
      ...format
    });

    // document defaults
    this.setDocumentColors();

    // add logo header
    this.#jsPDF.addImage(logo, "png", 35, this.#documentLeftMargin, 50, 50);

    // text brown
    this.setDocumentColors({ rgb: rgbColors.SHELTERLY_BROWN });
    this.#jsPDF.text("SHELTERLY", this.#documentLeftMargin, 80);

    // reset doc colors
    this.setDocumentColors();
  }

  // read/write properties
  get fileName() { return this.#fileName; }
  set fileName(value) { this.#fileName = value; }

  get lastYPosition() { return this.#documentLastYPosition; }
  set lastYPosition(value) { this.#documentLastYPosition = value; }

  get documentLeftMargin() { return this.#documentLeftMargin; }
  set documentLeftMargin(value) { this.#documentLeftMargin = value; }

  // read only properties
  get fileExtension() { return this.#fileExtension; }
  get pageHeight() { return this.#jsPDF.internal.pageSize.height || this.#jsPDF.internal.pageSize.getHeight(); }
  get pageWidth() { return this.#jsPDF.internal.pageSize.width || this.#jsPDF.internal.pageSize.getWidth(); }

  // method to get or set colors and other attributes
  setDocumentColors({
    rgb = this.#documentDrawColor
  } = {}) {
    this.#jsPDF.setTextColor(...rgb);
    this.#jsPDF.setDrawColor(...rgb);
    return;
  }

  setDocumentFontSize({
    size = this.#documentFontSize
  } = {}) {
    this.#jsPDF.setFontSize(size);
  }

  getLastYPositionWithBuffer({
    buffer = this.#defaultElementBuffer
  } = {}) {
    return this.#documentLastYPosition + this.#paddingBetweenElements + buffer;
  }

  // draw methods
  beforeDraw({ yPosition } = {}) {
    yPosition = yPosition || this.#documentLastYPosition;

    if (yPosition >= (this.pageHeight - 75)) {
      return this.drawPageBreak();
    }

    return yPosition;
  }

  addPage() {
    this.#jsPDF.addPage();
    this.#totalPages++;
    this.#currentPage++;
  }

  setPage(pageNumber) {
    this.#jsPDF.setPage(pageNumber);
    this.#currentPage = pageNumber;
  }

  drawPageBreak() {
    if (this.#pageRewound) {
      this.setPage(this.#currentPage + 1);
    } else {
      this.addPage();
    }
    this.#documentLastYPosition = 35;

    return this.#documentLastYPosition;
  }

  drawPageHeader({
    text = this.#pageTitle,
    subText
  } = {}) {
    // page title
    this.#jsPDF.setFontSize(this.#documentTitle1FontSize);
    this.#jsPDF.text(text, this.pageWidth - this.#documentRightMargin, 35, {align: 'right'});
    this.#documentLastYPosition = 35;

    if (subText) {
      this.setDocumentFontSize();
      this.#jsPDF.text(subText, this.pageWidth - this.#documentRightMargin, 60, {align: "right"});
      this.#documentLastYPosition = 60;
    }
  }

  drawSectionHeader({
    text,
    hRule = false,
    fontSize = this.#documentTitle2FontSize
  } = {}) {
    const yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer({ buffer: 25 }) });
    this.setDocumentFontSize({ size: fontSize });
    this.#jsPDF.text(text, this.#documentLeftMargin, yPosition);

    // set last y position
    this.#documentLastYPosition = yPosition - 20;

    if (hRule) {
      this.drawHRule();
    }

    // reset document font size
    this.setDocumentFontSize();
  }

  drawHRule({
    xOffset = 0,
    buffer
  } = {}) {
    const yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer({ buffer }) });
    const xPosition = this.#documentLeftMargin + xOffset;
    const width = this.pageWidth - (xPosition - xOffset);
    this.#jsPDF.line(xPosition, yPosition, width, yPosition);

    // set last y position
    this.#documentLastYPosition = yPosition;
  }

  drawTextWithLine({
    label,
    xOffset,
    yBuffer
  }) {
    const yPosition = this.beforeDraw({ yPosition:this.getLastYPositionWithBuffer() });

    this.#jsPDF.text(
      label,
      this.documentLeftMargin,
      yPosition
    );

    this.drawHRule({ xOffset, buffer: yBuffer });

    // set last y position
    this.#documentLastYPosition = yPosition + 25;
  }

  drawTextArea({
    label,
    rows = 3
  }) {
    const yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer() });

    this.#jsPDF.text(
      label,
      this.documentLeftMargin,
      yPosition
    );

    // set last y position
    this.#documentLastYPosition = yPosition + 25;

    for (var i = 0; i < rows; i++) {
      this.drawHRule();
    }
  }

  drawCheckBoxLine({
    label
  }) {
    const yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer() });
    this.#jsPDF.setFillColor(...rgbColors.WHITE);

    // checkbox
    this.#jsPDF.rect(this.documentLeftMargin, yPosition, 20, 20, 'FD');

    this.#jsPDF.text(
      label,
      this.documentLeftMargin + 25,
      yPosition + 15
    );

    // set last y position
    this.#documentLastYPosition = yPosition + 25;
  }

  drawList({
    listItems = [],
    listStyle = 'block',
    bottomPadding = 0
  }) {
    listItems.forEach(({
      type = 'text',
      label,
      fillColor = rgbColors.WHITE,
      size = 0
    }, i) => {
      const yPosition = this.getLastYPositionWithBuffer();
      this.#jsPDF.setFillColor(...fillColor);

      if (type === 'checkbox') {
        this.#jsPDF.rect(this.#documentLeftMargin, yPosition, size, size, 'FD');
      }

      this.#jsPDF.text(label, this.#documentLeftMargin + size + (size * 0.25), yPosition + 15)

      if (listStyle === 'block') {
        this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size;
      }

      if (listStyle === 'grid') {
        if (i % 2 === 0) {
          this.#documentLeftMargin = this.pageWidth / 2;
        } else {
          this.#documentLeftMargin = this.#defaultXMargin;
          this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size + bottomPadding;
        }

        if (i === listItems.length - 1) {
          this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size + bottomPadding;
        }
      }

      if (listStyle === 'inline') {
        const lineSize = (this.pageWidth - 30) / 5;
        this.#documentLeftMargin = this.#documentLeftMargin + lineSize;

        if (this.#documentLeftMargin > (this.pageWidth - 30)) {

        }

        if (
          // last item
          i === listItems.length - 1 ||
          // or we went off the page
          this.#documentLeftMargin > (this.pageWidth - 30)
        ) {
          this.#documentLeftMargin = this.#defaultXMargin;
          this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size + bottomPadding;
        }
      }
    });

    // add bottom padding
    this.#documentLastYPosition = this.beforeDraw() + bottomPadding;

    // reset default colors
    this.#jsPDF.setFillColor(...rgbColors.DEFAULT);
  }

  drawGrid({
    blocks = [],
    bottomPadding = 0
  }) {
    blocks.forEach((blockList, i) => {
      const yBeforeDraw = this.#documentLastYPosition;
      const pageBeforeDraw = this.#currentPage;
      this.drawList(blockList);
      const pageAfterDraw = this.#currentPage

      if (i % 2 === 0) {
        if (pageBeforeDraw < pageAfterDraw) {
          this.setPage(pageBeforeDraw);
          this.#pageRewound = true;
        }
        this.#documentLastYPosition = yBeforeDraw;
        this.#documentLeftMargin = this.pageWidth / 2;
      } else {
        this.#pageRewound = false;
        this.#documentLeftMargin = this.#defaultXMargin;
      }
    })
  }

  drawCheckboxList({
    labels = [],
    listStyle = 'block',
    bottomPadding = 0
  }) {
    this.drawList({
      listStyle,
      listItems: labels.map((label) => ({
        label,
        type: 'checkbox',
        size: 20
      })),
      bottomPadding
    });
  }

  drawTextList({
    labels = [],
    listStyle = 'block',
    bottomPadding = 0
  }) {
    this.drawList({
      listStyle,
      listItems: labels.map((label) => ({
        label
      })),
      bottomPadding
    })
  }

  // save methods
  saveFile() {
    this.#jsPDF.save(`${this.#fileName}.${this.#fileExtension}`);
  }
};

export default ShelterlyPDF;
