ImageCrop
=========

ImageCrop is a simple canvas-based for client-side image cropping. It has no external dependencies, and it should work reasonably well in all browsers that support `canvas` (though it hasn't been thoroughly tested).

ImageCrop is inspired by tools like [Jcrop](http://deepliquid.com/content/Jcrop.html) (but without depending on jQuery) and [ImageCutter](http://www.joustmultimedia.com/blog/post/image_cutter) (but without the emphasis on a server to do the actual cropping). [CanvasCropper](https://github.com/codepo8/canvascropper) and [this HTML5 image crop tool](http://www.script-tutorials.com/html5-image-crop-tool) were the starting points for the code in this library.

## Usage

### Setup

Your HTML only needs to have an image that you are capable of selecting in some way:

```html
<img class="myImg" src="/path/to/image.png" alt="My image">
```

Somewhere near the end of your document, include the `imagecrop.js` script and initialize the plugin on an image. You'll want to make sure the image has completely loaded before firing up the plugin. **Watch out!** This can be tricky if the browser is loading the image from cache, as the image may load before the `load` event listener is set. You may want to make use of a library like [imagesloaded](https://github.com/desandro/imagesloaded) to ensure that your images have completely loaded.

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
  });
</script>
```

### Methods and Public Properties

| Method or Property | Result                                                       |
|--------------------|--------------------------------------------------------------|
| `save()`           | Returns a PNG image representing the current crop selection. |
| `set(prop, val)`   | Update options after `init` by passing a property and value, or object containing multiple.|
| `cropCoords`       | An object with `x`, `y`, `width`, and `height` properties related to the current crop selection.|
| `drawSelection`    | Redraw the Canvas after you've changed `cropCoords`.         |

## Options

| Option         | Type    | Default                   | Comment                                         |
|----------------|---------|---------------------------|-------------------------------------------------|
| `selector`     | string  | `"img.imagecrop"`         | Pass in a selector for your image.              |
| `image`        | element | `querySelector(selector)` | If you already have a reference to your image, you can pass that instead of a selector. |
| `opacity`      | number  | `0.4`                     | Opacity for the canvas overlay during cropping. |
| `outputWidth`  | number  | `false`                   | A target width for the cropped file.            |
| `outputHeight` | number  | `false`                   | A target height for the cropped file.           |
| `ratio`        | number  | `false`*                  | A fixed ratio representing `width` / `height`.  |
| `handleSize`   | number  | `10`                      | Size in pixels of the square resize handles.    |
| `handleFill`   | string  | `"rgba(0, 0, 0, 0.65)"`   | Fill color of resize handles.                   |
| `keyboard`     | boolean | `true`                    | Allow keyboard interaction with the Canvas      |
| `keyboardStep` | number  | `5`                       | Number of pixels the keyboard keys should move the selection. |

* If an `outputWidth` and `outputHeight` are set, ratio will be set automatically, regardless of whether a `ratio` is passed to the constructor. Height and width win, but if a ratio is set later using the `.set()` method, height and width will be ignored when the image is saved (to avoid skewed images).

## Caveats

- ImageCrop probably doesn't work with Canvas polyfills for old IE, because they don't generally work well with the `drawImage()` method, which is used heavily in this library
- Images loaded from other domains probably won't work, due to the way browsers protect against cross-origin attacks
