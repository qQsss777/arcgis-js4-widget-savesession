/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Collection from "esri/core/Collection";
import ViewPoint from "esri/Viewpoint";
import Camera from "esri/Camera";
import Graphic from "esri/Graphic";
// esri.views
import View = require("esri/views/View");


//--------------------------------------------------------------------
//
//  Interfaces
//
//--------------------------------------------------------------------

interface ISession {
    camera: object;
    viewpoint: object;
    graphics: Array<IGraphics>;
}

interface IGraphics {
    title: string;
    features: Array<object>;
}

//--------------------------------------------------------------------
//
//  CSS
//
//--------------------------------------------------------------------

const CSS = {
    base: "esri-savesession esri-widget",
    saveExport: "esri-savesession-import esri-widget--button",
    saveImport: "esri-savesession-export esri-widget--button",
};


@subclass("esri.widgets.switchmapping")
class SaveSession extends declared(Widget) {

    constructor() {
        super();
    }


    //--------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------
    //----------------------------------
    //  view
    //----------------------------------

    @property()
    @renderable()
    view: View;

    //-------------------------------------------------------------------
    //
    //  Public methods
    //
    //-------------------------------------------------------------------

    render() {

        return (
            <div horizontal layout>
                <div bind={this} role="button" class={this.classes(CSS.saveExport)} onclick={this._exportSession}><span class="esri-icon-save" /></div>
                <label bind={this} for="files" role="button" class={this.classes(CSS.saveExport)}><span class="esri-icon-upload" /></label>
                <input bind={this} id="files" type="file" onchange={this._importSession} style="display:none;" />
            </div>
        );
    }

    //-------------------------------------------------------------------
    //
    //  Private methods
    //
    //-------------------------------------------------------------------

    //Export of the current session : viewpoint and graphics in GraphicsLayer
    private async _exportSession() {
        const defToDownload = await this._getJsonData()
        const currentTime: string = Date.now().toString()
        this._saveJSONdownload(defToDownload, `${currentTime}-session.json`)
    }

    private async _getJsonData() {

        //object based on ISession
        const definition = {} as ISession

        //export from the current view
        //if 3d view, export JSON camera
        if (this.view.type === '3d') {
            definition.camera = this.view.camera.toJSON()
        }
        //else export viewpoint 
        else {
            definition.viewpoint = this.view.viewpoint.toJSON()
        }

        //array of object graphics instancied
        definition.graphics = []

        //get collection of grahphicslayers
        const allGraphicsView = this.view.allLayerViews.filter(graphic => graphic.layer.type === 'graphics')
        const allGraphics = allGraphicsView.map(layer => layer.layer) as Collection<GraphicsLayer>

        //if graphics layer, get graphics then return definition 
        if (allGraphics.length > 0) {
            const collectionGraphics = await this._getGraphicsCollection(allGraphics)
            definition.graphics = collectionGraphics
        }
        return definition
    }


    private async _getGraphicsCollection(layers: Collection<GraphicsLayer>) {
        // for each graphic layer, we get an array of features
        const listGraphics: Array<IGraphics> = []
        layers.flatten(layer => {
            listGraphics.push(this._getGraphicsData(layer));
        });
        return listGraphics
    }

    private _getGraphicsData(layer: GraphicsLayer) {
        //we get features (geometry, symbol, attributes) of each GraphicsLayer
        const graphicsDefinition = {} as IGraphics;
        const featuresArray: Array<object> = []
        graphicsDefinition.title = layer.title
        layer.graphics.flatten(graphic => {
            featuresArray.push(graphic.toJSON())
        });
        graphicsDefinition.features = featuresArray;
        return graphicsDefinition
    }

    //get JSON data to string and download file
    private _saveJSONdownload(content: any, fileName: string) {
        const data = JSON.stringify(content, undefined, 4)
        const a = document.createElement("a");
        const file = new Blob([data], { type: 'text/json' });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    //Import of a session from a JSON file
    private _importSession() {
        const fileInput = document.querySelector('#files');
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const data = JSON.parse(reader.result) as ISession;

            //If 3D app, we update the camera object of the SceneView
            if (this.view.type == '3d' && "camera" in data) {
                this._changeCamera(data)
            }

            //If 2D app, we update the viewpoint object of the MapView
            else if (this.view.type === '2d' && "viewpoint" in data) {
                this._changeViewpoint(data)
            }
            else {
                alert("Pas de données")
            }

            // We add graphics to the GraphicsLayer
            this._addGraphics(data)
        });
        reader.readAsText(fileInput.files[0]);
    }

    //Update SceneView Camera
    private _changeCamera(data: ISession) {
        const vPt = Camera.fromJSON(data.camera)
        this.view.camera = vPt
    }

    //Update MapView ViewPoint
    private _changeViewpoint(data: ISession) {
        const vPt = ViewPoint.fromJSON(data.viewpoint)
        this.view.goTo(vPt)
    }

    //Add graphics
    private _addGraphics(data: ISession) {

        //Compare Collection of GraphicsLayer with JSON file and add graphics
        const allCurrentLayers: Collection<GraphicsLayer> = this.view.allLayerViews.map(layer => layer.layer)
            .filter(layer => layer.type === 'graphics') as Collection<GraphicsLayer>
        allCurrentLayers.forEach(layer => {
            data.graphics.forEach(graphics => {
                if (layer.title === graphics.title) {
                    layer.addMany(graphics.features.map(graphic => Graphic.fromJSON(graphic)))
                }
            })
        })
    }
}

export = SaveSession;