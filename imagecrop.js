window.ImageCrop = function (config) {
  'use strict';

  var self = this,
      options = {},
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      mouseLocation = '';

  // expose cropCoords to the client, just in case
  this.cropCoords = {
    x: 0,
    y: 0,
    height: 0,
    width: 0
  };

  // defaults for all options
  options.selector      = config.selector || 'img.imagecrop';
  options.image         = config.image || document.querySelector(options.selector);
  options.initialFill   = config.initialFill || 'rgba(0, 0, 0, 0.1)';
  options.activeFill    = config.activeFill || 'rgba(0, 0, 0, 0.6)';
  options.outputWidth   = config.outputWidth || false;
  options.outputHeight  = config.outputHeight || false;
  options.ratio         = (options.outputWidth && options.outputHeight) ?
                          options.outputWidth / options.outputHeight :
                          config.ratio || false;
  options.handleSize    = config.handleSize || 10;
  options.handleFill    = config.handleFill || 'rgba(0, 0, 0, 0.65)';
  options.keyboard      = config.keyboard || true;
  options.keyboardStep  = config.keyboardStep || 5;
  options.imageType     = config.imageType || 'image/png';
  options.imageQuality  = config.imageQuality || 1.0;
  options.dragThreshold = config.dragThreshold || 1;

  function drawInitialState ( state ) {
    // clear everything on the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.drawImage(options.image, 0, 0);
    ctx.fillStyle = options[state] || options.initialFill;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // initialize, by converting the supplied image to a canvas
  function init () {
    var currentMouseState = false,
        dragCoords = {};

    if (!options.image) { return; }

    // position and style the canvas
    canvas.width = options.image.offsetWidth;
    canvas.height = options.image.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = options.image.offsetTop + 'px';
    canvas.style.left = options.image.offsetLeft + 'px';
    document.body.appendChild(canvas);

    // draw the image and hide the original image
    drawInitialState();
    options.image.style.visibility = 'hidden';

    // allow changing selection position with keyboard
    if (options.keyboard) {
      var horizontal,
          vertical;

      canvas.setAttribute('tabindex', '1');
      canvas.style.outline = 'none';
      canvas.addEventListener('keydown', function (e) {
        var stepValue;

        if (e.keyCode >= 37 && e.keyCode <= 40) {
          // Allow faster movement if shift key is down
          if (e.shiftKey) {
            stepValue = options.keyboardStep * 10;
          } else {
            stepValue = options.keyboardStep;
          }
          if (e.keyCode === 37) { // left
            horizontal = - stepValue;
            vertical = 0;
          } else if (e.keyCode === 38) { // up
            horizontal = 0;
            vertical = - stepValue;
          } else if (e.keyCode === 39) { // right
            horizontal = stepValue;
            vertical = 0;
          } else if (e.keyCode === 40) { // down
            horizontal = 0;
            vertical = stepValue;
          }

          self.cropCoords.x += horizontal;
          self.cropCoords.y += vertical;
          self.drawSelection();

          e.preventDefault();
          e.stopPropagation();
        }
      }, false);
    }

    // handle moving when the mouse is down
    canvas.addEventListener('mousemove', function (e) {
      var canvasX = e.pageX - canvas.offsetLeft,
          canvasY = e.pageY - canvas.offsetTop;

      if (currentMouseState === 'resizing') {
        self.cropCoords.x = dragCoords.x;
        self.cropCoords.y = dragCoords.y;

        if (mouseLocation === 'n-resize' || mouseLocation === 's-resize') {
          self.cropCoords.height = canvasY - self.cropCoords.y;
        } else if (mouseLocation === 'w-resize' || mouseLocation === 'e-resize') {
          self.cropCoords.width = canvasX - self.cropCoords.x;
        } else {
          self.cropCoords.width = canvasX - self.cropCoords.x;
          self.cropCoords.height = canvasY - self.cropCoords.y;
        }
      } else if (currentMouseState === 'drawing') {
        self.cropCoords.width = canvasX - self.cropCoords.x;
        self.cropCoords.height = canvasY - self.cropCoords.y;
      } else if (currentMouseState === 'dragging') {
        self.cropCoords.x = canvasX - dragCoords.mouseX;
        self.cropCoords.y = canvasY - dragCoords.mouseY;
      }

      if (currentMouseState) {
        // draw the selection box
        self.drawSelection();
      } else {
        // determine where the mouse is in the canvas selection
        if (canvasX > self.cropCoords.x - (options.handleSize / 2) &&
            canvasX < self.cropCoords.x + (options.handleSize / 2) &&
            canvasY > self.cropCoords.y - (options.handleSize / 2) &&
            canvasY < self.cropCoords.y + (options.handleSize / 2)) {
          mouseLocation = 'nw-resize';
          canvas.style.cursor = 'nwse-resize';
        } else if (canvasX > self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2) &&
                   canvasX < self.cropCoords.x + self.cropCoords.width + (options.handleSize / 2) &&
                   canvasY > self.cropCoords.y - (options.handleSize / 2) &&
                   canvasY < self.cropCoords.y + (options.handleSize / 2)) {
          mouseLocation = 'ne-resize';
          canvas.style.cursor = 'nesw-resize';
        } else if (canvasX > self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2) &&
                   canvasX < self.cropCoords.x + self.cropCoords.width + (options.handleSize / 2) &&
                   canvasY > self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2) &&
                   canvasY < self.cropCoords.y + self.cropCoords.height + (options.handleSize / 2)) {
          mouseLocation = 'se-resize';
          canvas.style.cursor = 'nwse-resize';
        } else if (canvasX > self.cropCoords.x - (options.handleSize / 2) &&
                   canvasX < self.cropCoords.x + (options.handleSize / 2) &&
                   canvasY > self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2) &&
                   canvasY < self.cropCoords.y + self.cropCoords.height + (options.handleSize / 2)) {
          mouseLocation = 'sw-resize';
          canvas.style.cursor = 'nesw-resize';
        } else if (!options.ratio &&
                   canvasX > self.cropCoords.x + (self.cropCoords.width / 2) - (options.handleSize / 2) &&
                   canvasX < self.cropCoords.x + (self.cropCoords.width / 2) + (options.handleSize / 2) &&
                   canvasY > self.cropCoords.y - (options.handleSize / 2) &&
                   canvasY < self.cropCoords.y + (options.handleSize / 2)) {
          mouseLocation = 'n-resize';
          canvas.style.cursor = 'ns-resize';
        } else if (!options.ratio &&
                   canvasX > self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2) &&
                   canvasX < self.cropCoords.x + self.cropCoords.width + (options.handleSize / 2) &&
                   canvasY > self.cropCoords.y + (self.cropCoords.height / 2) - (options.handleSize / 2) &&
                   canvasY < self.cropCoords.y + (self.cropCoords.height / 2) + (options.handleSize / 2)) {
          mouseLocation = 'e-resize';
          canvas.style.cursor = 'ew-resize';
        } else if (!options.ratio &&
                   canvasX > self.cropCoords.x + (self.cropCoords.width / 2) - (options.handleSize / 2) &&
                   canvasX < self.cropCoords.x + (self.cropCoords.width / 2) + (options.handleSize / 2) &&
                   canvasY > self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2) &&
                   canvasY < self.cropCoords.y + self.cropCoords.height + (options.handleSize / 2)) {
          mouseLocation = 's-resize';
          canvas.style.cursor = 'ns-resize';
        } else if (!options.ratio &&
                   canvasX > self.cropCoords.x - (options.handleSize / 2) &&
                   canvasX < self.cropCoords.x + (options.handleSize / 2) &&
                   canvasY > self.cropCoords.y + (self.cropCoords.height / 2) - (options.handleSize / 2) &&
                   canvasY < self.cropCoords.y + (self.cropCoords.height / 2) + (options.handleSize / 2)) {
          mouseLocation = 'w-resize';
          canvas.style.cursor = 'ew-resize';
        } else if (canvasX > self.cropCoords.x &&
                   canvasX < self.cropCoords.x + self.cropCoords.width &&
                   canvasY > self.cropCoords.y &&
                   canvasY < self.cropCoords.y + self.cropCoords.height) {
          mouseLocation = 'selection';
          canvas.style.cursor = 'move';
        } else {
          mouseLocation = '';
          canvas.style.cursor = 'crosshair';
        }
      }
    }, false);

    // set up event listeners on the canvas
    canvas.addEventListener('mousedown', function (e) {
      var canvasX = e.pageX - canvas.offsetLeft,
          canvasY = e.pageY - canvas.offsetTop;

      // check to see if we're resizing

      if (mouseLocation.indexOf('resize') > -1) {
        dragCoords.x = self.cropCoords.x;
        dragCoords.y = self.cropCoords.y;
        dragCoords.height = self.cropCoords.height;
        dragCoords.width = self.cropCoords.width;

        if (mouseLocation === 'nw-resize') {
          dragCoords.x = self.cropCoords.x + self.cropCoords.width;
          dragCoords.y = self.cropCoords.y + self.cropCoords.height;
          dragCoords.height = self.cropCoords.height * -1;
          dragCoords.width = self.cropCoords.width * -1;
        } else if (mouseLocation === 'ne-resize') {
          dragCoords.y = self.cropCoords.y + self.cropCoords.height;
          dragCoords.height = self.cropCoords.height * -1;
        } else if (mouseLocation === 'sw-resize') {
          dragCoords.x = self.cropCoords.x + self.cropCoords.width;
          dragCoords.width = self.cropCoords.width * -1;
        } else if (mouseLocation === 'n-resize') {
          dragCoords.y = self.cropCoords.y + self.cropCoords.height;
          dragCoords.height = self.cropCoords.height * -1;
        } else if (mouseLocation === 'w-resize') {
          dragCoords.x = self.cropCoords.x + self.cropCoords.width;
          dragCoords.width = self.cropCoords.width * -1;
        }        

        currentMouseState = 'resizing';
      } else if (mouseLocation === 'selection') {
        // set the starting point for our drag
        dragCoords.x = self.cropCoords.x;
        dragCoords.y = self.cropCoords.y;
        dragCoords.mouseX = canvasX - self.cropCoords.x;
        dragCoords.mouseY = canvasY - self.cropCoords.y;

        currentMouseState = 'dragging';
      } else {
        // set initial top and left coordinates
        self.cropCoords.x = canvasX;
        self.cropCoords.y = canvasY;

        currentMouseState = 'drawing';
      }
    }, false);

    // handle mouse up / mouse out
    function endMouseMove () {
      // handle dragging from not the top left
      if (self.cropCoords.width < 0) {
        self.cropCoords.width = Math.abs(self.cropCoords.width);
        self.cropCoords.x -= self.cropCoords.width;
      }
      if (self.cropCoords.height < 0) {
        self.cropCoords.height = Math.abs(self.cropCoords.height);
        self.cropCoords.y -= self.cropCoords.height;
      }
      currentMouseState = false;
    }
    canvas.addEventListener('mouseup', endMouseMove, false);
    canvas.addEventListener('mouseout', endMouseMove, false);
  }
  init();

  this.drawSelection = function () {
    if (self.cropCoords.width < options.dragThreshold &&
        self.cropCoords.height < options.dragThreshold) {
      // only show the canvas as active if we've actually drawn something
      drawInitialState( 'activeFill' );
    }

    // fix a ratio if required
    if (options.ratio) {
      var absWidth = Math.abs(self.cropCoords.width),
          absHeight = Math.abs(self.cropCoords.height),
          minSideLength = Math.min(absWidth / options.ratio, absHeight);

      self.cropCoords.width = self.cropCoords.width < 0 ?
                              -1 * minSideLength * options.ratio :
                              minSideLength * options.ratio;

      self.cropCoords.height = self.cropCoords.height < 0 ?
                              -1 * minSideLength :
                              minSideLength;
    }

    // collision detection
    if (self.cropCoords.x < 0) self.cropCoords.x = 0;
    if (self.cropCoords.y < 0) self.cropCoords.y = 0;
    if (self.cropCoords.x + self.cropCoords.width > ctx.canvas.width) {
      self.cropCoords.x = ctx.canvas.width - self.cropCoords.width;
    }
    if (self.cropCoords.y + self.cropCoords.height > ctx.canvas.height) {
      self.cropCoords.y = ctx.canvas.height - self.cropCoords.height;
    }

    ctx.drawImage(options.image, self.cropCoords.x, self.cropCoords.y,
                  self.cropCoords.width, self.cropCoords.height,
                  self.cropCoords.x, self.cropCoords.y,
                  self.cropCoords.width, self.cropCoords.height);

    // draw resize handles
    ctx.fillStyle = options.handleFill;
    ctx.fillRect(self.cropCoords.x - (options.handleSize / 2),
                 self.cropCoords.y - (options.handleSize / 2),
                 options.handleSize, options.handleSize);
    ctx.fillRect(self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2),
                 self.cropCoords.y - (options.handleSize / 2),
                 options.handleSize, options.handleSize);
    ctx.fillRect(self.cropCoords.x - (options.handleSize / 2),
                 self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2),
                 options.handleSize, options.handleSize);
    ctx.fillRect(self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2),
                 self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2),
                 options.handleSize, options.handleSize);

    if (!options.ratio) {
      ctx.fillRect(self.cropCoords.x + (self.cropCoords.width / 2) - (options.handleSize / 2),
                   self.cropCoords.y - (options.handleSize / 2),
                   options.handleSize, options.handleSize);
      ctx.fillRect(self.cropCoords.x + self.cropCoords.width - (options.handleSize / 2),
                   self.cropCoords.y + (self.cropCoords.height / 2) - (options.handleSize / 2),
                   options.handleSize, options.handleSize);
      ctx.fillRect(self.cropCoords.x + (self.cropCoords.width / 2) - (options.handleSize / 2),
                   self.cropCoords.y + self.cropCoords.height - (options.handleSize / 2),
                   options.handleSize, options.handleSize);
      ctx.fillRect(self.cropCoords.x - (options.handleSize / 2),
                   self.cropCoords.y + (self.cropCoords.height / 2) - (options.handleSize / 2),
                   options.handleSize, options.handleSize);
    }
  };

  // update canvas with new size and save content as png
  this.save = function () {
    // if width and height aren't set, save the whole image
    if (self.cropCoords.width === 0 && self.cropCoords.height === 0) {
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
        tmpWidth = options.outputWidth || self.cropCoords.width,
        tmpHeight = options.outputHeight || self.cropCoords.height;

    // size the new canvas correctly
    tmpCanvas.width = tmpWidth;
    tmpCanvas.height = tmpHeight;

    // draw
    tmpCtx.drawImage(options.image, self.cropCoords.x, self.cropCoords.y,
                     self.cropCoords.width, self.cropCoords.height, 0, 0,
                     tmpWidth, tmpHeight);

    return tmpCanvas.toDataURL(options.imageType, options.imageQuality);
  };

  // allow changing the options after the plugin has loaded
  this.set = function (prop, value) {
    var objProp;

    if (typeof prop === 'object') {
      // if an object is passed as the first parameter, loop through it
      for (objProp in prop) {
        self.set(objProp, prop[objProp]);
      }
    } else {
      // otherwise assume we were given a property
      // update that property
      options[prop] = value;
      // and redraw
      self.drawSelection();
    }
  };
};
