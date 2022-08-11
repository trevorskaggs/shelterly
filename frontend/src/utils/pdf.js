import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../shelterly.png';

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
  #documentFontSize = 12;
  #documentTitle1FontSize = 20;
  #documentTitle2FontSize = 16;
  #defaultXMargin = 15;
  #documentLeftMargin = this.#defaultXMargin;
  #documentRightMargin = this.#defaultXMargin;
  #documentLastYPosition = 0;
  #defaultElementBuffer = 16;
  #totalPages = 1;
  #currentPage = 1;
  #pageRewound = false;
  #addFooter = null;
  #defaultImageSrc = '/static/images/image-not-found.png';

  constructor (format = {}, {
    addFooterHandler
  } = {}) {
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

    if (typeof addFooterHandler === 'function') {
      this.#addFooter = addFooterHandler;
    }
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

  resetDocumentLeftMargin() {
    this.#documentLeftMargin = this.#defaultXMargin;
  }

  getLastYPositionWithBuffer({
    buffer = this.#defaultElementBuffer
  } = {}) {
    return this.#documentLastYPosition + this.#paddingBetweenElements + buffer;
  }

  // draw methods
  beforeDraw({
    yPosition = this.#documentLastYPosition
  } = {}) {
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

  drawPad(amount = 20) {
    // set last y position
    this.#documentLastYPosition = this.#documentLastYPosition + amount;
  }
  /**
   * draws a png image from url source
   * @param  {string} [display='block'] - image display, either 'block' or 'inline'
   * @param  {number} [maxHeight=100] - image maximum height
   * @param  {number} [maxWidth=100] - image maximum width
   * @param  {number|Array} [padding=0] - padding int or array, i.e. [top, left, bottom, right]
   * @param  {string} [src] - image url source, i.e. '/path/to/image.png' - currently only png supported
   */
  drawImage({
    display = 'block',
    maxHeight = 75,
    maxWidth = 75,
    padding = 0,
    src
  }) {
    const img = document.createElement('img');
    img.src = src || this.#defaultImageSrc;

    // use canvas to resize the image
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var MAX_WIDTH = maxWidth;
    var MAX_HEIGHT = maxHeight;
    var imgWidth = img.width;
    var imgHeight = img.height;

    // resizing logic
    if (imgWidth > imgHeight) {
      if (imgWidth > MAX_WIDTH) {
        imgHeight *= MAX_WIDTH / imgWidth;
        imgWidth = MAX_WIDTH;
      }
    } else {
      if (imgHeight > MAX_HEIGHT) {
        imgWidth *= MAX_HEIGHT / imgHeight;
        imgHeight = MAX_HEIGHT;
      }
    }

    canvas.width = imgWidth;
    canvas.height = imgHeight;
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    const imgData = canvas.toDataURL('png');

    let leftPad = padding;
    let rightPad = padding;
    let topPad = padding;
    let bottomPad = padding;

    if (Array.isArray(padding)) {
      // enforce padding array precision
      if (padding.length !== 4) throw new Error('padding array must equal all four sides, i.e. [top, left, bottom, right');

      leftPad = padding[1];
      rightPad = padding[3];
      topPad = padding[0];
      bottomPad = padding[2];
    }

    // this buffer will pad the right side of the image if the width is less than the max width
    const imgWidthBuffer = maxWidth - imgWidth;

    this.#jsPDF.addImage(imgData, 'PNG', this.#documentLeftMargin + leftPad, this.#documentLastYPosition + topPad, imgWidth, imgHeight);
    if (display === 'inline') {
      this.#documentLeftMargin = this.#documentLeftMargin + leftPad + rightPad + imgWidth + imgWidthBuffer;
    }
    else { // display === 'block'
      this.#documentLastYPosition = this.#documentLastYPosition + imgHeight + padding;
    }
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
      this.drawPad();
      this.drawHRule();
    }

    // reset document font size
    this.setDocumentFontSize();
  }

  drawHRule({
    xOffset = 0,
    buffer,
    lineWidth = this.pageWidth
  } = {}) {
    const yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer({ buffer }) });
    const xPosition = this.#documentLeftMargin + xOffset;
    const width = lineWidth - (xPosition - xOffset);
    this.#jsPDF.line(xPosition, yPosition, width, yPosition);

    // set last y position
    this.#documentLastYPosition = yPosition;
  }

  drawSingleLineText({ text, bottomPadding = 0, topPadding = 0 }) {
    let yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer({ buffer: this.#defaultElementBuffer + topPadding }) }); // this.getLastYPositionWithBuffer() + topPadding;
    this.#jsPDF.text(text, this.#documentLeftMargin, yPosition)
    this.#documentLastYPosition = yPosition + bottomPadding;
  }

  drawWrappedText({ text, linePadding = 0, bottomPadding = 0 }) {
    const splitLines = this.#jsPDF.splitTextToSize(text, this.pageWidth - (this.#documentRightMargin * 2));
    if (splitLines.length > 1) {
      splitLines.forEach((splitText) => {
        this.drawSingleLineText({
          text: splitText,
          bottomPadding: linePadding,
          topPadding: linePadding
        })
      })
    } else {
      this.drawSingleLineText({
        text,
        bottomPadding: bottomPadding,
        topPadding: linePadding
      })
    }

    // set last y position
    this.#documentLastYPosition = this.#documentLastYPosition + bottomPadding;

    return this.#documentLastYPosition
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
    this.#documentLastYPosition = yPosition;

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
      size = 0,
      marginTop = 0,
      inlineRightMargin = 0,
      inlineOffset = 0
    }, i) => {
      const yPosition = this.getLastYPositionWithBuffer() + marginTop;
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
          this.#documentLeftMargin = this.#defaultXMargin;
          this.#documentLastYPosition = this.beforeDraw({ yPosition }) + size + bottomPadding;
        }
      }

      if (listStyle === 'inline') {
        const itemWidth = listItems.length > 5 ? listItems.length : 5;
        let lineSize = ((this.pageWidth - (30 - inlineOffset)) / itemWidth) + inlineRightMargin;
        this.#documentLeftMargin = this.#documentLeftMargin + lineSize;

        if (
          // last item
          i === listItems.length - 1 ||
          // or we went off the page
          this.#documentLeftMargin > (this.pageWidth - 30)
        ) {
          this.#documentLeftMargin = this.#defaultXMargin + inlineOffset;
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
  /**
   * draw a text list
   * @param  {number} [bottomPadding=0] - bottom padding after list is drawn
   * @param  {number} [labelInlineMarginRight=0] - right margin of inline label/list item
   * @param  {number} [labelInlineOffset=0] - offset for inline style
   * @param  {number} [labelMarginTop=0] - top margin of label/list item
   * @param  {Array} [labels=[]] - array of strings (labels) to draw as a test list
   * @param  {string} [listStyle='block'] - draw the list items in block, grid, or inline style
   */
  drawTextList({
    bottomPadding = 0,
    labelInlineMarginRight = 0,
    labelInlineOffset = 0,
    labelMarginTop = 0,
    labels = [],
    listStyle = 'block'
  }) {
    this.drawList({
      listStyle,
      listItems: labels.map((label) => ({
        label,
        marginTop: labelMarginTop,
        inlineRightMargin: labelInlineMarginRight,
        inlineOffset: labelInlineOffset
      })),
      bottomPadding
    })
  }

  drawTableGrid({
    headers = [' ', ' ', ' ', ' ']
  } = {}) {
    // this.documentLeftMargin = 0;
    this.#jsPDF.autoTableSetDefaults(
      {
        headStyles: { fillColor: [255, 255, 255] } // White
      },
      this.#jsPDF
    );

    this.#jsPDF.autoTable({
      head: [headers],
      body: Array(30).fill(Array(headers.length).fill(' ')),
      startY: this.#documentLastYPosition,
      showHead: 'firstPage',
      theme: 'grid',
      margin: { left: this.#documentLeftMargin, right: this.#documentRightMargin },
      willDrawCell: (data) => {
        if (data.row.section === 'head') {
          this.#jsPDF.setTextColor(...this.#documentDrawColor) // Black
        }
      },
    });

    this.resetDocumentLeftMargin();
  }

  // save methods
  saveFile({
    maxPages = Infinity
  } = {}) {
    const pageCount = this.#jsPDF.internal.getNumberOfPages()

    for (var i = 1; i <= pageCount; i++) {
      // delete all pages that exceeds maxPages limit
      if (i > maxPages) {
        this.#jsPDF.deletePage(i);
        continue;
      }

      // calls the addFooterHandler for each page, before the file is saved
      if (typeof this.#addFooter === 'function') {
        this.#jsPDF.setPage(i)
        this.#addFooter({
          pageNumber: i,
          pageCount,
          pdf: this.#jsPDF
        });
      }
    }
    this.#jsPDF.save(`${this.#fileName}.${this.#fileExtension}`);
  }
};

export default ShelterlyPDF;
