/**
 * ImageCrop 2.0
 * Michael Martin & Stephen Zuniga
 * MIT License
 */
(function () {

    /**
     * Class for cropping images using canvas
     *
     * @class ImageCrop Manages image cropping and saving
     * @param {object} Options for this instance
     */
    function ImageCrop (options) {
        this.set(options);
        this.init();
    }

    // Shortcuts
    var proto = ImageCrop.prototype;
    var exports = this;
    var originalGlobalValue = exports.ImageCrop;

    /**
     * Default options for every ImageCrop instance
     */
    proto._defaultOptions = {
        selector:      'img.imagecrop',
        initialFill:   'rgba(0, 0, 0, 0.1)',
        activeFill:    'rgba(0, 0, 0, 0.6)',
        outputWidth:   false,
        outputHeight:  false,
        ratio:         false,
        handleSize:    10,
        handleFill:    'rgba(0, 0, 0, 0.65)',
        keyboard:      true,
        keyboardStep:  5,
        imageType:     'image/png',
        imageQuality:  1.0,
        dragThreshold: 1
    };

    /**
     * Return the object containing options
     * If one doesn't exist, set them to the default
     *
     * @return {object} Options currently available for this instance
     */
    proto.getOptions = function () {
        return this._options;
    };

    /**
     * Create a canvas to replace the original image
     * Create another canvas that will represent the selection
     * Set globals so the canvases can be accessed
     */
    proto.init = function () {
        //
    };

    /**
     * Update the options with the passed parameter(s)
     * If the options global is not set, set it to the default options
     * If the first parameter is an object, pass any new parameters to the options global
     * If the first parameter is a string, and the second parameter exists, update the option using the first parameter as a key
     *
     * @param {object|string} Object of options, or string of an option key
     * @param {mixed} Value to set if the first parameter is a string
     */
    proto.set = function (prop, value) {
        var objProp;

        // Set the options to the defaults if they aren't currently set
        if (!this._options) {
            this._options = this._defaultOptions;
        }

        // if an object is passed as the first parameter, loop through it
        if (typeof prop === 'object') {
            for (objProp in prop) {
                this.set(objProp, prop[objProp]);
            }
        } else {
            // otherwise assume we were given a property and update it
            this._options[prop] = value;
        }
    };

    /**
     * Save the currently visible selection on the canvas
     * If there isn't a selection, save the entire image
     * Ensure that if the output width/height does not coincide with the ratio, that the ratio wins out
     *
     * @return {string} DataURL of the image in the selection
     */
    proto.save = function () {
        var options = this.getOptions();

        // if width and height aren't set, save the whole image
        if (Math.abs(this.cropCoords.width) <= options.dragThreshold ||
            Math.abs(this.cropCoords.height) <= options.dragThreshold) {
            return canvas.toDataURL(options.imageType, options.imageQuality);
        }

        // if a ratio is set after init, ratio wins over output width/height
        if (options.outputWidth / options.outputHeight !== options.ratio) {
            options.outputWidth = false;
            options.outputHeight = false;
        }

        // create a new canvas, real quick like
        var tmpCanvas = document.createElement('canvas'),
            tmpCtx = tmpCanvas.getContext('2d'),
            tmpWidth = options.outputWidth || this.cropCoords.width,
            tmpHeight = options.outputHeight || this.cropCoords.height;

        // size the new canvas correctly
        tmpCanvas.width = tmpWidth;
        tmpCanvas.height = tmpHeight;

        // draw
        tmpCtx.drawImage(options.image, self.cropCoords.x, self.cropCoords.y,
                         self.cropCoords.width, self.cropCoords.height, 0, 0,
                         tmpWidth, tmpHeight);

        return tmpCanvas.toDataURL(options.imageType, options.imageQuality);
    };

    // Expose the class via the global object
    exports.ImageCrop = ImageCrop;
}.call(this));
