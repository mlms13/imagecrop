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
        this.initSelection();
        this.initEvents();
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
        var options = this.getOptions(),
            self = this;

        // Set the image variable globally
        this.image = document.querySelector(options.selector);

        // Set up and position the base layer canvas
        var baseCanvas = this.createLayer('base');

        baseCanvas.draw = function (layer) {
            // Clear everything on the canvas
            layer.ctx.clearRect(0, 0, layer.ctx.canvas.width, layer.ctx.canvas.height);

            // Draw the image on the canvas
            layer.ctx.drawImage(self.image, 0, 0);

            // Draw a light backdrop on the image
            layer.ctx.fillStyle = options.initialFill;
            layer.ctx.fillRect(0, 0, layer.ctx.canvas.width, layer.ctx.canvas.height);
        };

        // Draw the image on the canvas
        this.draw();

        // Hide the original image
        this.image.style.visibility = 'hidden';
    };

    /**
     * Create a canvas to signify the selection
     * Handle collisions and ratios
     */
    proto.initSelection = function () {
        var options = this.getOptions(),
            self = this;

        this.cropCoords = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };

        // Set up and position the selection layer canvas
        var selectionCanvas = this.createLayer('selection');

        // If the selection is larger than the threshold, draw the selection
        if (Math.min(this.cropCoords.height, this.cropCoords.width) > options.dragThreshold) {

            // Fix a ratio if required
            if (options.ratio) {
                var absWidth = Math.abs(this.cropCoords.width),
                    absHeight = Math.abs(this.cropCoords.height),
                    minSideLength = Math.min(absWidth / options.ratio, absHeight);

                this.cropCoords.width = this.cropCoords.width < 0 ?
                                        -1 * minSideLength * options.ratio :
                                        minSideLength * options.ratio;

                this.cropCoords.height = this.cropCoords.height < 0 ?
                                        -1 * minSideLength :
                                        minSideLength;
            }

            // Collision detection
            if (this.cropCoords.x < 0) { this.cropCoords.x = 0; }
            if (this.cropCoords.y < 0) { this.cropCoords.y = 0; }
            if (this.cropCoords.x + this.cropCoords.width > selectionCanvas.ctx.canvas.width) {
                this.cropCoords.x = selectionCanvas.ctx.canvas.width - this.cropCoords.width;
            }
            if (this.cropCoords.y + this.cropCoords.height > selectionCanvas.ctx.canvas.height) {
                this.cropCoords.y = selectionCanvas.ctx.canvas.height - this.cropCoords.height;
            }

            selectionCanvas.draw = function (layer) {
                // Clear everything on the canvas
                layer.ctx.clearRect(0, 0, layer.ctx.canvas.width, layer.ctx.canvas.height);

                // Draw a dark backdrop
                layer.ctx.fillStyle = options.activeFill;
                layer.ctx.fillRect(0, 0, layer.ctx.canvas.width, layer.ctx.canvas.height);

                // Draw the image on the canvas
                layer.ctx.drawImage(
                    self.image, self.cropCoords.x, self.cropCoords.y,
                    self.cropCoords.width, self.cropCoords.height,
                    self.cropCoords.x, self.cropCoords.y,
                    self.cropCoords.width, self.cropCoords.height
                );

                // Draw corner resize handles
                layer.ctx.fillStyle = options.handleFill;
                layer.ctx.fillRect(self.cropCoords.x - (options.handleSize / 2),
                                   self.cropCoords.y - (options.handleSize / 2),
                                   options.handleSize, options.handleSize);
                layer.ctx.fillRect(self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2),
                                   self.cropCoords.y - (options.handleSize / 2),
                                   options.handleSize, options.handleSize);
                layer.ctx.fillRect(self.cropCoords.x - (options.handleSize / 2),
                                   self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2),
                                   options.handleSize, options.handleSize);
                layer.ctx.fillRect(self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2),
                                   self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2),
                                   options.handleSize, options.handleSize);

                // Draw side resize handles if we're not fixing a ratio
                if (!options.ratio) {
                    layer.ctx.fillRect(self.cropCoords.x + (self.cropCoords.width / 2) - (options.handleSize / 2),
                                       self.cropCoords.y - (options.handleSize / 2),
                                       options.handleSize, options.handleSize);
                    layer.ctx.fillRect(self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2),
                                       self.cropCoords.y + (self.cropCoords.height / 2) - (options.handleSize / 2),
                                       options.handleSize, options.handleSize);
                    layer.ctx.fillRect(self.cropCoords.x + (self.cropCoords.width / 2) - (options.handleSize / 2),
                                       self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2),
                                       options.handleSize, options.handleSize);
                    layer.ctx.fillRect(self.cropCoords.x - (options.handleSize / 2),
                                       self.cropCoords.y + (self.cropCoords.height / 2) - (options.handleSize / 2),
                                       options.handleSize, options.handleSize);
                }

            };
        }

        // If the selection is too small, clear the selection
        else {
            selectionCanvas.draw = function (layer) {
                layer.ctx.clearRect(0, 0, layer.ctx.canvas.width, layer.ctx.canvas.height);
            };
        }

        // Finally draw the selection layer
        this.draw('selection');
    };

    /**
     * Initialize mouse and keyboard events
     */
    proto.initEvents = function () {
        //
    };

    /**
     * Create the canvas elements and assign them to globals
     *
     * @param {string|array} Layer name as a string, or an array of layers
     */
    proto.createLayer = function (layer) {

        // Set the canvas object if it isn't set
        if (!this.canvas) {
            this.canvas = {};
        }

        // Set the layer object if it isn't set
        if (!this.canvas[layer]) {
            this.canvas[layer] = {};
        }

        // If layer is an array, then loop through and create all layers
        if (layer instanceof Array) {
            var layers = {};

            for (var i = 0; i < layer.length; i++) {
                layers[layer] = this.createLayer(layer[i]);
            }

            return layers;
        }

        // Set the canvas up for the named layer
        else {
            // Create the canvas element
            this.canvas[layer].canvas = document.createElement('canvas');
            this.canvas[layer].ctx = this.canvas[layer].canvas.getContext('2d');

            // Set the canvas to sit in place of the original image
            this.canvas[layer].canvas.id             = 'imagecrop-' + layer;
            this.canvas[layer].canvas.className      = 'imagecrop';
            this.canvas[layer].canvas.width          = this.image.offsetWidth;
            this.canvas[layer].canvas.height         = this.image.offsetHeight;
            this.canvas[layer].canvas.style.position = 'absolute';
            this.canvas[layer].canvas.style.top      = this.image.offsetTop + 'px';
            this.canvas[layer].canvas.style.left     = this.image.offsetLeft + 'px';

            // Function that the draw method will call, make sure to override
            this.canvas[layer].draw = function (layer) {};

            // Add the canvas to the body
            document.body.appendChild(this.canvas[layer].canvas);

            return this.canvas[layer];
        }
    };

    /**
     * Draw the canvases, if a layer is specified, only draw that layer
     *
     * @param {string|array} Layer name as a string, or an array of layers
     */
    proto.draw = function (layer) {

        // If layer is an array, then loop through and draw all layers
        if (layer instanceof Array) {
            for (var i = 0; i < layer.length; i++) {
                this.draw(layer[i]);
            }
        }

        // If no layer is specified, draw all layers
        else if (!layer) {
            for (layer in this.canvas) {
                this.draw(layer);
            }
        }

        // Draw the canvas for the named layer
        else {
            this.canvas[layer].draw(this.canvas[layer]);
        }

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
        }

        // otherwise assume we were given a property and update it
        else {
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
            options.outputWidth = options.outputHeight = false;
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
        tmpCtx.drawImage(this.image, this.cropCoords.x, this.cropCoords.y,
                         this.cropCoords.width, this.cropCoords.height, 0, 0,
                         tmpWidth, tmpHeight);

        return tmpCanvas.toDataURL(options.imageType, options.imageQuality);
    };

    // Expose the class via the global object
    exports.ImageCrop = ImageCrop;
}.call(this));
