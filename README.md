ImageCrop
=========

ImageCrop is a simple canvas-based tool to help you crop images. It has no external dependencies, and it should work reasonably well in all browsers that support `canvas` (though it hasn't been thoroughly tested).

ImageCrop is inspired by tools like [Jcrop](http://deepliquid.com/content/Jcrop.html) (but without depending on jQuery) and [ImageCutter](http://www.joustmultimedia.com/blog/post/image_cutter) (but without the emphasis on a server to do the actual cropping). Much of the code in this library is inspired by [CanvasCropper](https://github.com/codepo8/canvascropper) and [this HTML5 image crop tool](http://www.script-tutorials.com/html5-image-crop-tool).

## Usage

### Setup

Your HTML only needs to have an image that you are capable of selecting in some way:

```html
<img class="myImg" src="/path/to/image.png" alt="My image">
```

Somewhere near the end of your document, include the `imagecrop.js` script and initialize the plugin on an image. You'll want to make sure the image has completely loaded before firing up the plugin.

```html
<script src="/js/imagecrop.js"></script>
<script>
  document.querySelector('.myImg').addEventListener('load', function (e) {
    // now that the image has fully loaded, initialize the plugin
    var cropper = new ImageCrop({
      // tell ImageCrop which image to crop,
      // the target of the `load` event in this case
      image: e.target
    });
    
    // initialize
    cropper.init();
  });
</script>
```

### Methods and Public Properties

| Method or Property | Result                                                       |
|--------------------|--------------------------------------------------------------|
| `init()`           | Creates the canvas and starts event listeners.               |
| `save()`           | Returns a PNG image representing the current crop selection. |
| `cropCoords`       | An object with `x`, `y`, `width`, and `height` properties related to the current crop selection.|

## Options

| Option     | Type    | Default                   | Comment                                         |
|------------|---------|---------------------------|-------------------------------------------------|
| `selector` | string  | `"img.imagecrop"`         | Pass in a selector for your image.              |
| `image`    | element | `querySelector(selector)` | If you already have a reference to your image, you can pass that instead of a selector. |
| `opacity`  | number  | `0.4`                     | Opacity for the canvas overlay during cropping. | 

## Caveats

- ImageCrop probably doesn't work with Canvas polyfills for old IE, because they don't generally work well with the `drawImage()` method, which is used heavily in this library
- Images loaded from other domains probably won't work, due to the way browsers protect against cross-origin attacks
- You can't currently resize or move your crop without starting over. This will be fixed.
