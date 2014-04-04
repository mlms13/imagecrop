window.ImageCrop = function (config) {
  'use strict';

  var self = this,
      options = {},
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      mouseLocation = false;

  this.cropCoords = {
    x: 0,
    y: 0,
    height: 0,
    width: 0
  };
  this.dragCoords = {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
    mouseX: 0,
    mouseY: 0
  };

  // defaults for all options
  options.selector = config.selector || 'img.imagecrop';
  options.image = config.image || document.querySelector(options.selector);
  options.opacity = (config.opacity >= 0) ? config.opacity : 0.4;
  options.outputWidth = config.outputWidth || false;
  options.outputHeight = config.outputHeight || false;
  options.ratio = (options.outputWidth && options.outputHeight) ?
                  options.outputWidth / options.outputHeight :
                  config.ratio || false;
  options.handleSize = config.handleSize || 10;

  function drawInitialState() {
    // clear everything on the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.drawImage(options.image, 0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0,' + options.opacity + ')';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function drawSelection() {
    drawInitialState();

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

    ctx.drawImage(options.image, self.cropCoords.x, self.cropCoords.y,
                  self.cropCoords.width, self.cropCoords.height,
                  self.cropCoords.x, self.cropCoords.y,
                  self.cropCoords.width, self.cropCoords.height);
  }

  // initialize, by converting the supplied image to a canvas
  this.init = function () {
    var currentMouseState = false;

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

    // handle moving when the mouse is down
    canvas.addEventListener('mousemove', function (e) {
      var canvasX = e.pageX - canvas.offsetLeft,
          canvasY = e.pageY - canvas.offsetTop;

      if (currentMouseState === 'resizing') {
        if (mouseLocation === 'nw-resize') {
          self.cropCoords.x = self.dragCoords.x;
          self.cropCoords.y = self.dragCoords.y;
        } else if (mouseLocation === 'ne-resize') {
          self.cropCoords.x = self.dragCoords.x;
          self.cropCoords.y = self.dragCoords.y + self.dragCoords.height;
        } else if (mouseLocation === 'se-resize') {
          self.cropCoords.x = self.dragCoords.x;
          self.cropCoords.y = self.dragCoords.y;
        } else if (mouseLocation === 'sw-resize') {
          self.cropCoords.x = self.dragCoords.x + self.dragCoords.width;
          self.cropCoords.y = self.dragCoords.y;
        }
        self.cropCoords.width = self.dragCoords.width + (canvasX - self.dragCoords.x - self.dragCoords.width);
        self.cropCoords.height = self.dragCoords.height + (canvasY - self.dragCoords.y - self.dragCoords.height);
      } else if (currentMouseState === 'drawing') {
        self.cropCoords.width = canvasX - self.cropCoords.x;
        self.cropCoords.height = canvasY - self.cropCoords.y;
      } else if (currentMouseState === 'dragging') {
        self.cropCoords.x = self.dragCoords.x + canvasX - self.dragCoords.x - self.dragCoords.mouseX;
        self.cropCoords.y = self.dragCoords.y + canvasY - self.dragCoords.y - self.dragCoords.mouseY;
      }

      if (currentMouseState) {
        // draw the selection box
        drawSelection();
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
        } else if (canvasX > self.cropCoords.x &&
                   canvasX < self.cropCoords.x + self.cropCoords.width &&
                   canvasY > self.cropCoords.y &&
                   canvasY < self.cropCoords.y + self.cropCoords.height) {
          mouseLocation = 'selection';
          canvas.style.cursor = 'move';
        } else {
          mouseLocation = false;
          canvas.style.cursor = 'crosshair';
        }
      }
    }, false);

    // set up event listeners on the canvas
    canvas.addEventListener('mousedown', function (e) {
      var canvasX = e.pageX - canvas.offsetLeft,
          canvasY = e.pageY - canvas.offsetTop;

      // check to see if we're clicking inside an existing selection
      if (mouseLocation === 'nw-resize') {
        self.dragCoords.x = self.cropCoords.x + self.cropCoords.width;
        self.dragCoords.y = self.cropCoords.y + self.cropCoords.height;
        self.dragCoords.height = self.cropCoords.height * -1;
        self.dragCoords.width = self.cropCoords.width * -1;

        currentMouseState = 'resizing';
      } else if (mouseLocation === 'ne-resize') {
        self.dragCoords.x = self.cropCoords.x;
        self.dragCoords.y = self.cropCoords.y + self.cropCoords.height * 2;
        self.dragCoords.height = self.cropCoords.height * -1;
        self.dragCoords.width = self.cropCoords.width;

        currentMouseState = 'resizing';
      } else if (mouseLocation === 'se-resize') {
        self.dragCoords.x = self.cropCoords.x;
        self.dragCoords.y = self.cropCoords.y;
        self.dragCoords.height = self.cropCoords.height;
        self.dragCoords.width = self.cropCoords.width;

        currentMouseState = 'resizing';
      } else if (mouseLocation === 'sw-resize') {
        self.dragCoords.x = self.cropCoords.x + self.cropCoords.width * 2;
        self.dragCoords.y = self.cropCoords.y;
        self.dragCoords.height = self.cropCoords.height;
        self.dragCoords.width = self.cropCoords.width * -1;

        currentMouseState = 'resizing';
      } else if (mouseLocation === 'selection') {
        // set the starting point for our drag
        self.dragCoords.x = self.cropCoords.x;
        self.dragCoords.y = self.cropCoords.y;
        self.dragCoords.mouseX = canvasX - self.cropCoords.x;
        self.dragCoords.mouseY = canvasY - self.cropCoords.y;

        currentMouseState = 'dragging';
      } else {
        // set initial top and left coordinates
        self.cropCoords.x = canvasX;
        self.cropCoords.y = canvasY;

        currentMouseState = 'drawing';
      }
    }, false);

    // and handle mouse up
    canvas.addEventListener('mouseup', function () {
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
    }, false);
  };

  // update canvas with new size and save content as png
  this.save = function () {
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

    return tmpCanvas.toDataURL();
  };
};
