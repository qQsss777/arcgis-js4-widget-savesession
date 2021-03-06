/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Accessor = require("esri/core/Accessor");
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Collection from "esri/core/Collection";
import ViewPoint from "esri/Viewpoint";
import Camera from "esri/Camera";
import Graphic from "esri/Graphic";
// esri.views
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");



interface ISession {
    camera: object;
    viewpoint: object;
    graphics: Array<IGraphics>;
}

interface IGraphics {
    title: string;
    features: Array<object>;
}

interface SaveSessionViewModelProperties {
    view: MapView | SceneView | null
}


@subclass("esri.widgets.SaveSessionViewModel")
class SaveSessionViewModel extends declared(Accessor) {

    constructor(properties?: SaveSessionViewModelProperties) {
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
    view: MapView | SceneView;


    //-------------------------------------------------------------------
    //
    //  Private methods
    //
    //-------------------------------------------------------------------
    public async exportSession() {
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
        //we get features (geometry, symobl, attributes)
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

    public importSession() {
        const fileInput = document.querySelector('#files');
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const data = JSON.parse(reader.result) as ISession;
            if (this.view.type == '3d' && "camera" in data) {
                this._changeCamera(data)
            }
            else if (this.view.type === '2d' && "viewpoint" in data) {
                this._changeViewpoint(data)
            }
            else {
                alert("Pas de données")
            }
            this._addGraphics(data)

        });
        reader.readAsText(fileInput.files[0]);
    }

    private _changeCamera(data: ISession) {
        const vPt = Camera.fromJSON(data.camera)
        this.view.camera = vPt
    }

    private _changeViewpoint(data: ISession) {
        const vPt = ViewPoint.fromJSON(data.viewpoint)
        this.view.goTo(vPt)
    }

    private _addGraphics(data: ISession) {
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

export = SaveSessionViewModel;