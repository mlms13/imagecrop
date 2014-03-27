var ImageCrop = function (config) {
  var self = this,
      options = {},
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

  this.cropCoords = {
    x: 0,
    y: 0,
    height: 0,
    width: 0
  };

  // defaults for all options
  options.selector = config.selector || 'img.imagecrop';
  options.image = config.image || document.querySelector(options.selector);
  options.opacity = (config.opacity >= 0) ? config.opacity : 0.4;

  function drawInitialState() {
    // clear everything on the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.drawImage(options.image, 0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0,' + options.opacity + ')';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function drawSelection() {
    drawInitialState();
    ctx.drawImage(options.image, self.cropCoords.x, self.cropCoords.y,
                  self.cropCoords.width, self.cropCoords.height,
                  self.cropCoords.x, self.cropCoords.y,
                  self.cropCoords.width, self.cropCoords.height);
  }

  // initialize, by converting the supplied image to a canvas
  this.init = function () {
    var mousedown = false;

    if (!options.image) return;

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

    // set up event listeners on the canvas
    canvas.addEventListener('mousedown', function (e) {
      // make sure everybody knows the mouse is down
      mousedown = true;

      // set initial top and left coordinates
      self.cropCoords.x = e.pageX - canvas.offsetLeft;
      self.cropCoords.y = e.pageY - canvas.offsetTop;
    }, false);

    // handle moving when the mouse is down
    canvas.addEventListener('mousemove', function (e) {
      if (mousedown) {
        // figure out the distance the mouse has moved while clicked
        self.cropCoords.width = (e.pageX - canvas.offsetLeft) - self.cropCoords.x;
        self.cropCoords.height = (e.pageY - canvas.offsetTop) - self.cropCoords.y;

        // and draw the selection box
        drawSelection();
      }
    }, false);

    // and handle mouse up
    canvas.addEventListener('mouseup', function (e) {
      mousedown = false;
    }, false);
  };

  // update canvas with new size and save content as png
  this.save = function () {
    // create a new canvas, real quick like
    var tmpCanvas = document.createElement('canvas'),
        tmpCtx = tmpCanvas.getContext('2d');

    // size the new canvas correctly
    tmpCanvas.width = self.cropCoords.width;
    tmpCanvas.height = self.cropCoords.height;

    // draw
    tmpCtx.drawImage(options.image, self.cropCoords.x, self.cropCoords.y,
                     self.cropCoords.width, self.cropCoords.height, 0, 0,
                     self.cropCoords.width, self.cropCoords.height);

    return tmpCanvas.toDataURL();
  };
};
