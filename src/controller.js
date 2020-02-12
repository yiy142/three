import React from 'react';
import Switch from "react-bootstrap-switch";

import * as canvas_api from "utils/canvas.js";
import * as json_api from "utils/jsonToThree.js";

const _ = require("lodash");
export default class POIController extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            poiNames : props.poiNames,
            show: true
        }
    }

    render(){
        return (
            <div className="map-select-section">
                {
                    this.state.poiNames.map(poiName=>{
                        <POI poi = {poiName} />
                    })
                }
            </div>
        );

    }
}

class POI extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            poi: props.poi,
            on: true
        }
    }

    render(){
        return (
            <div>
                <span> {this.state.poi} </span>
                <hr></hr>
                <Switch
                    value={this.state.on}
                    labelText= {this.state.poi} labelWidth={150}
                    onChange={(event) => {
                        event.persist();
                        this.setState({on: !this.state.on});
                        canvas_api.togglePOI(this.state.on);
                }}
                />
             </div>
        )
    }
}