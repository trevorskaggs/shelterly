import ReactDOMServer from 'react-dom/server';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../shelterly.png';

const defaultFormat = {
  orientation: 'p',
  unit: 'pt',
  format: 'a4',
  compress: true
};

const rgbColors = {
  SHELTERLY_BROWN: [139, 107, 82],
  DEFAULT: [0, 0, 0],
  WHITE: [255, 255, 255]
};

const handlerTypes = {
  DEFAULT: 'default'
};

const alignTypes = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};

class ShelterlyPDF {
  // private properties
  #jsPDF;
  #fileName;
  #fileExtension = 'pdf';
  #pageTitle = 'Shelterly PDF';
  #pageSubtitle = null;
  #paddingBetweenElements = 5;
  #documentDrawColor = rgbColors.DEFAULT;
  #documentTextColor = rgbColors.DEFAULT;
  #documentFontSize = 12;
  #documentTitle1FontSize = 20;
  #documentTitle2FontSize = 16;
  #defaultXMargin = 15;
  #defaultYMargin = 35;
  #documentLeftMargin = this.#defaultXMargin;
  #documentRightMargin = this.#defaultXMargin;
  #documentTopMargin = this.#defaultYMargin;
  #documentLastYPosition = this.#documentTopMargin;
  #defaultElementBuffer = 16;
  #currentPage = 1;
  #totalPages = 1;
  #pageRewound = false;
  #addFooter = null;
  #drawHeaderOnEveryPage = false;

  constructor (format = {}, {
    addFooterHandler,
    drawHeaderOnEveryPage,
    pageTitle,
    pageSubtitle
  } = {}) {
    this.#jsPDF = new jsPDF({
      ...defaultFormat,
      ...format
    });

    if (pageTitle) {
      this.#pageTitle = pageTitle;
    }
    if (pageSubtitle) {
      this.#pageSubtitle = pageSubtitle;
    }
    if (drawHeaderOnEveryPage === true) {
      this.#drawHeaderOnEveryPage = true;
    }
    if (typeof addFooterHandler === 'function') {
      this.#addFooter = addFooterHandler;
    } else if (addFooterHandler === ShelterlyPDF.HandlerTypes.DEFAULT) {
      this.#addFooter = this.drawPageNumbers;
    }

    // document defaults
    this.setDocumentColors();

    // draw header
    this.drawPageHeader();
  }

  // static getters
  static get HandlerTypes() {
    return handlerTypes;
  }

  static get AlignTypes() {
    return alignTypes;
  }

  //
  // read/write properties
  //

  get fileName() { return this.#fileName; }
  set fileName(value) { this.#fileName = value; }

  get lastYPosition() { return this.#documentLastYPosition; }
  set lastYPosition(value) { this.#documentLastYPosition = value; }

  get documentLeftMargin() { return this.#documentLeftMargin; }
  set documentLeftMargin(value) { this.#documentLeftMargin = value; }

  //
  // read only properties
  //

  get fileExtension() { return this.#fileExtension; }
  get pageHeight() { return this.#jsPDF.internal.pageSize.height || this.#jsPDF.internal.pageSize.getHeight(); }
  get pageWidth() { return this.#jsPDF.internal.pageSize.width || this.#jsPDF.internal.pageSize.getWidth(); }
  get numberOfPages() { return this.#jsPDF.internal.getNumberOfPages(); }
  get remainderPageHeight() { return (this.pageHeight - 35) - this.#documentLastYPosition - 20; }
  get contentWidth() { return this.pageWidth - this.#defaultXMargin * 2; }

  //
  // document config methods
  //

  /**
   * sets the text and draw colors
   * @param {object} [arg1={}] - arguments as an object
   * @param {Array} [arg1.rgb=this.#documentDrawColor] - rgb value in array form, defaults to rgbColors.DEFAULT or [0,0,0]
   */
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
  /**
   * adds a new page to the document while keeping track of total pages and current page
   */
  addPage() {
    this.#jsPDF.addPage();
    this.#totalPages++;
    this.#currentPage++;
  }

  /**
   * sets the page for drawing by page number
   * @param  {number} pageNumber page number to set
   */
  setPage(pageNumber) {
    this.#jsPDF.setPage(pageNumber);
    this.#currentPage = pageNumber;
  }
  /**
   * deletes a page by page number
   * @param  {number} pageNumber page number to delete
   */
  deletePage(pageNumber) {
    this.#jsPDF.deletePage(pageNumber);
  }

  //
  // document draw methods
  //

  /**
   * process before drawing anything on the pdf document, i.e. automatic page breaking
   * @param {object} [arg1={}] - arguments as an object
   * @param {number} [arg1.yPosition=this.#documentLastYPosition] - set the yPosition before processing beforeDraw,
   *  - defaults to the this.#documentLastYPosition
   * @returns {number} - the yPosition after processing beforeDraw
   */
  beforeDraw({
    yPosition = this.#documentLastYPosition
  } = {}) {
    if (yPosition >= (this.pageHeight - 75)) {
      return this.drawPageBreak();
    }

    return yPosition;
  }

  /**
   * @param {object} [param0]
   * @param {string} [param0.pageTitle=this.#pageTitle]
   * @param {string} [param0.subtitle=this.#pageSubtitle]
   */
  drawPageHeader({
    pageTitle = this.#pageTitle,
    subtitle = this.#pageSubtitle,
  } = {}) {
    // set default font size
    this.setDocumentFontSize({ size: 15 });
    // add logo header
    this.#jsPDF.addImage(
      logo,
      'png',
      this.#documentTopMargin,
      this.#documentLeftMargin,
      50,
      50
    );

    // text brown
    this.setDocumentColors({ rgb: rgbColors.SHELTERLY_BROWN });
    this.#jsPDF.text('SHELTERLY', this.#documentLeftMargin, 80);

    // reset doc colors
    this.setDocumentColors();

    // page title
    this.#jsPDF.setFontSize(this.#documentTitle1FontSize);
    this.#jsPDF.text(
      pageTitle,
      this.pageWidth - this.#documentRightMargin,
      this.#documentTopMargin,
      { align: 'right' }
    );
    this.#documentLastYPosition = this.#documentTopMargin + 25;

    if (subtitle) {
      this.setDocumentFontSize();
      this.#jsPDF.text(
        subtitle,
        this.pageWidth - this.#documentRightMargin,
        this.#documentLastYPosition,
        { align: 'right' }
      );
    }

    this.drawPad(5);
    this.drawHRule();
  }

  drawPageBreak() {
    if (this.#pageRewound) {
      this.setPage(this.#currentPage + 1);
    } else {
      this.addPage();
    }
    this.#documentLastYPosition = this.#documentTopMargin;

    if (this.#drawHeaderOnEveryPage) {
      this.drawPageHeader();
    }

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
   * @param  {string} src - image url source, i.e. '/path/to/image.png'
   */
  async drawImage({
    display = 'block',
    maxHeight = 75,
    maxWidth = 75,
    padding = 0,
    src
  }) {
    if (!src) {
      throw new Error('The src param is not defined.')
    }

    // force the loading of the image in the event the image is not cached by the browser
    function promiseImage(src){
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      })
    }
    const img = await promiseImage(src);
    await this.drawGraphic({ display, maxHeight, maxWidth, padding, src: img });
  }

  async drawSvg({
    display = 'block',
    maxHeight = 75,
    maxWidth = 75,
    padding = 0,
    svg
  }) {
    if (!svg) {
      throw new Error('The svg param is not defined.');
    }
    await this.drawGraphic({ display, maxHeight, maxWidth, padding, svg });
  }

  async drawGraphic({
    display = 'block',
    maxHeight = 75,
    maxWidth = 75,
    padding = 0,
    src,
    svg
  }) {
    // padding settings
    let leftPad = padding;
    let rightPad = padding;
    let topPad = padding;
    let bottomPad = padding;
    let imgWidth = 0;
    let imgWidthBuffer = maxWidth;

    if (Array.isArray(padding)) {
      // enforce padding array precision
      if (padding.length !== 4) throw new Error('padding array must equal all four sides, i.e. [top, left, bottom, right');

      leftPad = padding[1];
      rightPad = padding[3];
      topPad = padding[0];
      bottomPad = padding[2];
    }

    //
    // add image
    //
    if (src) {
      const img = src;

      // use canvas to resize the image
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      await ctx.drawImage(img, 0, 0);

      var MAX_WIDTH = maxWidth;
      var MAX_HEIGHT = maxHeight;
      imgWidth = img.width;
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
      await ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

      const imgData = await canvas.toDataURL();
  
      await this.#jsPDF.addImage(imgData, 'PNG', this.#documentLeftMargin + leftPad, this.#documentLastYPosition + topPad, imgWidth, imgHeight, '', 'FAST');
    }

    //
    // add svg as image
    //
    else if (svg) {
      const svgString = ReactDOMServer.renderToStaticMarkup(svg);
      await this.#jsPDF.addSvgAsImage(svgString, this.#documentLeftMargin + leftPad, this.#documentLastYPosition + topPad, maxWidth, maxHeight);
    }

    //
    // after draw, set document positions
    //
    if (display === 'inline') {
      // this buffer will pad the right side of the image if the width is less than the max width
      imgWidthBuffer = maxWidth - imgWidth;
      this.#documentLeftMargin = this.#documentLeftMargin + leftPad + rightPad + imgWidth + imgWidthBuffer;
    }
    else { // display === 'block'
      this.#documentLastYPosition = this.#documentLastYPosition + imgHeight + padding;
    }
  }

  drawSectionHeader({
    text,
    hRule = false,
    fontSize = this.#documentTitle2FontSize,
    align = alignTypes.LEFT
  } = {}) {
    const yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer({ buffer: 25 }) });
    this.setDocumentFontSize({ size: fontSize });

    const textWidth = this.#jsPDF.getStringUnitWidth(text);
    let leftMargin = this.#documentLeftMargin;
    if (align === alignTypes.CENTER) {
      leftMargin = this.contentWidth / 2 - textWidth * 2 - 15;
    } else if (align === alignTypes.RIGHT) {
      leftMargin = this.contentWidth - textWidth - 15;
    }

    this.#jsPDF.text(text, leftMargin, yPosition);

    // set x & y position
    this.#documentLastYPosition = yPosition - 20;
    this.#documentLeftMargin = this.#defaultXMargin;

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

  textWithStyle({ text, xPosition, yPosition }) {
    const boldIndicator = '***';
    const textArray = text.split(boldIndicator);

    let _xPosition = xPosition;

    textArray.forEach((_text, i) => {
      this.#jsPDF.setFont(undefined, 'bold');

      if (i % 2 === 0) {
        this.#jsPDF.setFont(undefined, 'normal');
      }

      this.#jsPDF.text(_text, _xPosition, yPosition);
      _xPosition = _xPosition + this.#jsPDF.getStringUnitWidth(_text) * this.#documentFontSize;
    })
  }

  drawSingleLineText({ text, bottomPadding = 0, topPadding = 0 }) {
    let yPosition = this.beforeDraw({ yPosition: this.getLastYPositionWithBuffer({ buffer: this.#defaultElementBuffer + topPadding }) });
    this.textWithStyle({
      text,
      xPosition: this.#documentLeftMargin,
      yPosition
    })
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
      inlineOffset = 0,
      withLines = false,
      lineXOffset = 0
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

      if (withLines === true) {
        let rightMargin = this.#documentLeftMargin + this.pageWidth - 45;
        if (listStyle === 'grid') {
          rightMargin = this.#documentLeftMargin + this.pageWidth / 2 - 30;
        }
        const textWidth = this.#jsPDF.getStringUnitWidth(label) * this.#documentFontSize;
        this.#jsPDF.line(
          this.#documentLeftMargin + textWidth,
          yPosition + 15,
          rightMargin,
          yPosition + 15
        );
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
        const itemWidth = listItems.length;
        const lineSize = (this.pageWidth - 30) / itemWidth;
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
        label: label.label || label,
        type: label.type || 'checkbox',
        size: 20
      })),
      bottomPadding
    });
  }
  /**
   * draw a text list
   *
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
    listStyle = 'block',
    withLines = false,
  }) {
    this.drawList({
      listStyle,
      listItems: labels.map((label) => ({
        label,
        marginTop: labelMarginTop,
        inlineRightMargin: labelInlineMarginRight,
        inlineOffset: labelInlineOffset,
        withLines
      })),
      bottomPadding
    })
  }

  /**
   * draws a blank table grid with headers
   *
   * @param  {Array} [headers=[' ', ' ', ' ', ' ']] - column headers
   */
  drawTableGrid({
    headers = [' ', ' ', ' ', ' '],
    columnStyles,
  } = {}) {
    // set the default columnStyles if not defined
    if (!columnStyles) {
      const defaultColumnStyle = { cellWidth: 'auto' };
      columnStyles = headers.map((_h, i) => defaultColumnStyle)
    }

    // columnStyles must be one for each column
    if (columnStyles.length !== headers.length) {
      throw new Error('columnStyles length must match header length');
    }

    this.#jsPDF.autoTableSetDefaults(
      {
        headStyles: { fillColor: [255, 255, 255] } // White
      },
      this.#jsPDF
    );

    // calculate how many rows are needed
    const rowHeight = 20;
    const numberOfRows = Math.floor(this.remainderPageHeight / rowHeight);

    this.#jsPDF.autoTable({
      head: [headers],
      body: Array(numberOfRows).fill(Array(headers.length).fill(' ')),
      startY: this.#documentLastYPosition,
      showHead: 'firstPage',
      theme: 'grid',
      margin: { left: this.#documentLeftMargin, right: this.#documentRightMargin, bottom: 0 },
      willDrawCell: (data) => {
        if (data.row.section === 'head') {
          this.#jsPDF.setTextColor(...this.#documentDrawColor) // Black
        }
      },
      styles: {
        minCellHeight: rowHeight
      },
      columnStyles
    });

    this.resetDocumentLeftMargin();
  }

  /**
   * draws page numbers and total page count at the footer of the document
   *
   * @param {object} param0
   * @param {number} param0.pageNumber
   * @param {number} param0.pageCount
   */
  drawPageNumbers({
    pageNumber,
    pageCount
  }) {
    const jsPdf = this.#jsPDF;
    const { width: pageWidth, height: pageHeight } = jsPdf.internal.pageSize;
    jsPdf.text('Page ' + String(pageNumber) + ' of ' + String(pageCount), pageWidth / 2, pageHeight - 15, {
        align: 'center'
      });
  }

  /**
   * saves the document to file
   *
   * @param {object} [param0]
   * @param {number} [maxPages=Infinity] limits the amount of pages to save
   * @returns {Promise<void>}
   */
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
    return this.#jsPDF.save(`${this.#fileName}.${this.#fileExtension}`, { returnPromise: true });
  }
};

export default ShelterlyPDF;
