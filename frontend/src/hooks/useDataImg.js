/**
 * Hook for loading an image from src path to base64 encoded data string
 */
function useDataImg() {
  /**
   * Promise that loads the image form source path
   *
   * @param {string} src
   * @returns {Image}
   */
  async function promiseImage(src){
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Returns a base64 encoded data url string of the supplied Image
   *
   * @param {Image} img
   * @returns {string}
   */
  function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  /**
   * Combines promiseImage and getBase64Image to get the url string of the image src supplied at hook instantiation
   *
   * @param {string} imgSrc provide an image path
   * @returns {string} base64 encoded data url string
   */
  async function getDataFromSrcPath(imgSrc) {
    const img = await promiseImage(imgSrc);
    const imgData = getBase64Image(img);

    return imgData;
  }

  return {
    getDataFromSrcPath,
    promiseImage,
    getBase64Image
  }
}

export default useDataImg;
