/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { aliasOf, declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import { tsx } from "esri/widgets/support/widget";
import SceneView from "esri/views/SceneView";
import MapView from "esri/views/MapView";


// esri.views
import View = require("esri/views/View");
import SaveSessionViewModel = require("./SaveSessionViewModel");


//--------------------------------------------------------------------
//
//  Interfaces
//
//--------------------------------------------------------------------

interface SaveSessionProperties extends __esri.WidgetProperties {
    view: MapView | SceneView;
}

const CSS = {
    base: "esri-savesession esri-widget",
    saveExport: "esri-savesession-import esri-widget--button",
    saveImport: "esri-savesession-export esri-widget--button",
};


@subclass("esri.widgets.switchmapping")
class SaveSession extends declared(Widget) {

    constructor(properties?: SaveSessionProperties) {
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

    @aliasOf("viewModel.view")
    view: View;

    @property()
    viewModel: SaveSessionViewModel = new SaveSessionViewModel();

    //-------------------------------------------------------------------
    //
    //  Public methods
    //
    //-------------------------------------------------------------------

    render() {

        return (
            <div>
                <div bind={this} role="button" class={this.classes(CSS.saveExport)} onclick={this._onClickSave}><span class="esri-icon-save" /></div>
                <label bind={this} for="files" role="button" class={this.classes(CSS.saveImport)}><span class="esri-icon-upload" /></label>
                <input bind={this} id="files" type="file" onchange={this._onLoad} style="display:none;" />
            </div>
        );
    }

    //-------------------------------------------------------------------
    //
    //  Private methods
    //
    //-------------------------------------------------------------------

    //Export of the current session : viewpoint and graphics in GraphicsLayer
    private _onClickSave() {
        this.viewModel.exportSession();
    }

    //Import of a session from a JSON file
    private _onLoad() {
        this.viewModel.importSession();
    }
}

export = SaveSession;