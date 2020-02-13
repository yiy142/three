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
            <div className='card-body'>
            <div className="controller">
                <div>
                        <span style = {{"color": "white"}}> Controller: </span>
                    </div>
                    <hr/>

                {
                    this.state.poiNames.map(poiName=>{
                        return (<POI key = {poiName} poi = {poiName} />);
                    })
                }
            </div>
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
                <Switch
                    value={this.state.on}
                    labelText={this.state.poi} labelWidth={150}
                    onChange={(event) => {
                        this.setState({on: !this.state.on});
                        canvas_api.togglePOI(this.state.poi);
                }}
                />
             </div>
        )
    }
}