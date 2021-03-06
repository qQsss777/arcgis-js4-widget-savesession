# Widget SaveSession for ArcGIS API for JavaScript

This is a widget for ArcGIS API for Javascript 4. It allows you to save your work session via a JSON file :
- position in the map (2D or 3D)
- features of the GraphicsLayer present in your application

![](saves.gif)

This widget was inspired by the one created by Robert Scheitlin : https://github.com/softwhere/SaveSession-Widget

## Installation

### Clone

- Clone this repo to your local machine using `https://github.com/qQsss777/arcgis-js4-widget-savesession.git`

### Setup

It requires the installation of typescript : https://www.typescriptlang.org/index.html#download-links

You need the ArcGIS API for JavaScript Typings too : https://developers.arcgis.com/javascript/latest/guide/typescript-setup/index.html#install-the-arcgis-api-for-javascript-typings

>  install npm packages @types/arcgis-js-api

```shell
$ npm install -g typescript
$ npm install
```

Then you can compile the widget with running the command :

```shell
$ tsc
```

To test it, you can follow this guide to use it : https://developers.arcgis.com/javascript/latest/sample-code/widgets-custom-recenter/index.html#4 (paragraph Reference and use the custom widget )

The GraphicsLayer must have a title.

## Example (Optional)

```javascript
// code away!

import WebScene from 'esri/WebScene';
import SceneView from 'esri/views/SceneView';
import SaveSession from './app/SaveSession';

const webScene = new WebScene({
    portalItem: {
        id: "414a28cfca7a471180e8e952cf14c60f"
    }
});

const view = new SceneView({
    map: webScene,
    container: "viewDiv"
});

// the layer where the graphics are sketched
const graphicsLayer = new GraphicsLayer({
    title: 'building'
});
webmap.add(graphicsLayer);

const savesession = new SaveSession({
    view
});

view.ui.add(savesession, "top-right");
```


---

## License

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


