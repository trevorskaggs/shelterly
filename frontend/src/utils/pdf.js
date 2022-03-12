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
  #documentLeftMargin = 15;
  #documentRightMargin = 15;
  #documentLastYPosition = 0;
  #defaultElementBuffer = 20;

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

  drawPageBreak() {
    this.#jsPDF.addPage();
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
    xOffset = 0
  } = {}) {
    const yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer() });
    const xPosition = this.#documentLeftMargin + xOffset;
    const width = this.pageWidth - (xPosition - xOffset);
    this.#jsPDF.line(xPosition, yPosition, width, yPosition);

    // set last y position
    this.#documentLastYPosition = yPosition;
  }

  drawTextWithLine({
    label,
    xOffset
  }) {
    const yPosition = this.beforeDraw({ yPosition:this.getLastYPositionWithBuffer() });

    this.#jsPDF.text(
      label,
      this.documentLeftMargin,
      yPosition
    );

    this.drawHRule({ xOffset });

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
    let nextXPosition = this.#documentLeftMargin;

    listItems.forEach(({
      type = 'text',
      label,
      fillColor = rgbColors.WHITE,
      size = 0
    }, i) => {
      const yPosition = this.getLastYPositionWithBuffer();
      this.#jsPDF.setFillColor(...fillColor);

      if (type === 'checkbox') {
        this.#jsPDF.rect(nextXPosition, yPosition, size, size, 'FD');
      }

      this.#jsPDF.text(label, nextXPosition + size + (size * 0.25), yPosition + 15)

      if (listStyle === 'block') {
        this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size;
      }

      if (listStyle === 'grid') {
        if (i % 2 === 0) {
          nextXPosition = this.pageWidth / 2;
          if (i === listItems.length - 1) {
            this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size + bottomPadding;
          }
        } else {
          nextXPosition = this.#documentLeftMargin;
          this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size + bottomPadding;
        }
      }
    });

    // add bottom padding
    this.#documentLastYPosition = this.beforeDraw() + bottomPadding;

    // reset default colors
    this.#jsPDF.setFillColor(...rgbColors.DEFAULT);
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

// export const generateAndSavePdf = ({
//   fileName = 'shelterly-pdf',
//   title = 'Shelterly',
//   format = {
//     orientation: 'p',
//     unit: 'pt',
//     format: 'a4'
//   }
// }) => {
//   const doc = new jsPDF(format);
//   const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//   const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

//   // header
//   doc.addImage(logo, "png", 35, 15, 50, 50);

//   // text brown
//   doc.setTextColor(139, 107, 82)
//   doc.text("SHELTERLY", 15, 80);

//   // text black
//   doc.setTextColor(0)

//   // draw black
//   doc.setDrawColor(0, 0, 0);

//   // title text
//   doc.setFontSize("25")
//   doc.text("Dispatch Assignment Resolution Form", pageWidth - 10, 35, {align: 'right'})

//   // title sub text
//   doc.setFontSize("15")
//   doc.text("Opened: March 5th, 14:01", pageWidth - 10, 60, {align: "right"})

//   // sub title text
//   doc.setFontSize("22")
//   doc.text("Team Name", 15, 120)

//   // <hr />
//   doc.line(15, 130, pageWidth - 35, 130);

//   // checkbox
//   doc.setFillColor(255,255,255);
//   doc.rect(15, 145, 20, 20, 'FD');

//   // checkbox label
//   doc.setFontSize("15")
//   doc.text("Not Completed Yet", 45, 160)

//   // checkbox inline
//   doc.setFillColor(255,255,255);
//   doc.rect(205, 145, 20, 20, 'FD');

//   // checkbox label
//   doc.setFontSize("15")
//   doc.text("Unable to Complete", 235, 160)


//   // footer
//   doc.text("1 / 2", pageWidth / 2, pageHeight  - 10, {align: 'center'});

//   // save
//   doc.save(`${fileName}.pdf`)
// };
