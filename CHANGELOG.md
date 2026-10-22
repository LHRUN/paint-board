# 3.1.0

### Feat

- Eraser
  - Eraser mode shows a circle that follows the pointer and matches the erase size as zoom changes.
- Images
  - Supports custom filter configuration and preview.
- Fonts
  - Chinese interface text uses ZCOOL KuaiLe.

### Fix

- Selection Mode
  - Fixed the selection logic for hand-drawn shapes and the calculation of the selection box's range

# 3.0.0

### Feat

- Free Drawing
  - Added pen, outlined pen, and ink brushes.
- Selection Mode
  - Selected drawings and shapes can change color and line style.
  - Two or more selected objects can be combined into one group.
- Text and Fonts
  - Text has its own color palette, separate from brush colors.
  - Google Fonts can be added to the font list and are loaded when a board opens.
- Layers
  - Added a layer list to reorder objects and show or hide them.
- File List
  - Boards open in a dialog with thumbnails, rename, and batch download.
  - A new visit with an empty board can start from a template.
  - Creating a board asks for a unique title. At most 20 boards can be added; boards already saved above that limit remain available.
- Image Export
  - Export can include or omit the canvas background, and a failed export no longer saves an empty image.
- Canvas
  - Panning skips object hit-testing until the pan ends.

### Fix

- Switching boards writes the current canvas back to its own file before the next board loads.
- Opening the app waits for saved boards to load, and does not overwrite them when that load fails.
- Rapid undo and redo no longer let a slower step overwrite a newer one.
- Moving, scaling, or rotating text is kept in undo history.
- Copy and paste keep custom object fields and line endpoint handles.
- A click that does not move no longer leaves a dot or an empty undo step for the basic, material, multi-color, and eraser brushes.
- Importing a board JSON keeps its zoom and viewport.

### Note

- The first successful save moves each board's drawing into its own local record. Paint Board 2.x cannot read those drawings. Do not open this site in 2.x and save; saving there can replace the drawing with an empty canvas. A JSON file exported from 2.x still opens in this version.
- Free-drawing shortcut letters now match the letter on each brush button.
- Boards can no longer be reordered by dragging. Double-clicking empty canvas no longer creates a text box; use the text button on the action bar.

### CI

- The production image and CI build use Node.js 22 and pnpm 8.15.9.
- GitHub Pages is published with the official Pages actions instead of pushing a `gh-pages` branch.

# 2.0.0

### Feat

- Tool Panel
  - Refined overall layout for a more intuitive workflow.
- Free Drawing
  - Added multi-color switching and customizable configurations.
  - Brush shadows now support adjustable X and Y offsets.
- Shape Drawing
  - Added dynamic drawing support for Lucide icons.
  - Introduced a “hand-drawn” line style option.
  - Line and fill colors can now be switched freely.
  - Added five new shape fill patterns for richer visual effects.
- Selection Mode
  - Added a “Lock” toggle to prevent selected objects from being moved, dragged, or rotated.
- Canvas Background
  - Supports simultaneous drawing of background color, image, and camera feed, with adjustable layer order.
  - Background color now supports gradient effects.
  - Background images support background removal and segmentation processing.
- File List
  - Improved add/delete interactions for smoother operation.
  - Added file sorting functionality.
- Camera
  - Added a camera button at the bottom-left corner to toggle the camera.
  - Supports real-time capture or freezing a frame as the background, with adjustable filters, brightness, contrast, saturation, and opacity.
- Shortcuts
  - Refactored event handling module and added multiple new shortcuts for canvas transformations, element adjustments, and tool panel switching.

# 1.5.7

### Feat

- add fullscreen

# 1.5.6

### Feat

- draw
  - basic / material / multi color: add line type connfig (solid / dashed / dotted)

### refactor
  - restructure core code directory

# 1.5.5

### Feat

- i18n: add zh-tw(中文繁体), ja(日本語), ko(한국어)

# 1.5.4

### Feat

- add eraser config

# 1.5.3

### Feat

- upload image
  -  add image segmentation 

# 1.5.2

### Feat

- add download image size config

# 1.5.1

### Feat

- add PWA

### CI

- integrate Dockerfile with GitHub Actions for GitHub Pages deployment

# 1.5.0

### Feat

- save as image supports custom configurations. Rotate, Scale, Crop
- add transformers.js
- support removing background for uploading images (browser needs to support WebGPU)

# 1.4.1

### Feat

- update some styles
- remove autodraw

# 1.4.0

### Feat

- add canvas background image

# 1.3.1

### Feat

- update font family

### Docs

- README adds browser support

# 1.3.0

### Feat

- Drawing
  - Provides a variety of common shapes drawing, support for multiple endpoints line segments and arrows, and support for the configuration of the border and fill styles.
  - Added Google AutoDraw feature to Basic Drawing.
- Font
  - Supports font drawing by double-clicking.
  - Add font style configuration.
- Board
  - The drawing board supports customized width and height configurations.
  - Added Guide Line drawing feature.
- Optimisation
  - All fonts support i18n.
  - All inputs can now display content in real time.
  - Adjusting Tool Panel Styles.

### Fix

- Fix zoom progress component initialization error.
- Fix the error of initializing the display of the background color of the drawing board.

# 1.2.1

### Fix

- fix bottom operation tooltip display

# 1.2.0

### Feat

- add docker support

### Docs

- add CONTRIBUTING.md
- add Issues template

# 1.1.0

### Feat

- dynamic loading clarity

# 1.0.0

### Feat

- Refactoring with Fabric.js
- Adjust the operation panel style layout, add multi-functional menus to improve the user experience
- Increased number of brush styles to 12 and introduced multiple customizations
- Optimized layer settings from layer list to single element layer settings. Includes moving layers up, moving layers down, moving to top layer and moving to bottom layer
- Add new image upload function, also support layer filter configuration, add more effects to the painting content
- Introduced text drawing function, user can freely configure fonts
- Add rotation operation and transparency configuration in selection mode
- Introduces multi-file configuration, allowing users to easily switch between multiple canvases, each with customizable titles, additions, deletions, and upload and download features
- Supports multi-end operation, mobile users can zoom and drag the canvas by two-finger
- Add canvas zoom feature, users can freely adjust the canvas size as needed. And add background color and transparency configuration

# 0.2.8 (2023-12-03)

### Feat

- add microsoft clarity

# 0.2.7 (2023-12-03)

### Feat

- add clean modal
- Text rendering adds color
- Change the material loading text

# 0.2.6 (2023-09-29)

### Fix

- static file path error

# 0.2.5 (2023-09-24)

### Fix

- single layer deleted error

# 0.2.4 (2023-09-23)

### Fix

- issue#11
- click mask doesn't close

# 0.2.3 (2023-02-16)

### Feat

- Add i18n

# 0.2.2 (2023-01-22)

### Chore

- Add styleLint
- Deploy changed to github actions

# 0.2.1 (2022-12-19)

### Feat

- Add free draw effect, multiple effects, fluorescent、multicolor、crayon、bubbles、spray

# 0.2.0 (2022-12-06)

### Feat

- Add dclick drawing text
- Add select mode, can zoom, move and delete(Backspace) elements

### Chore

- Deploy changed to gh-pages
- Add lodash

# 0.1.0 (2022-11-14)

### Feat

- Add free draw, eraser
- Add drawing board drag and drop
- Add multi layer, can add, delete and sort
- Add undo, redo, clean, save
