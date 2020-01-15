import React from 'react';
import axios from 'axios';

import * as canvas_api from "utils/canvas.js"

export default class MapSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            maps: {},
            selected_map: '',
            show : true
        }

        this.config = require("assets/config.json");
    }

    componentDidMount() {
        let url = this.config.backend_url;
        let targetUrl = this.config.maplist_url;
        let axiosConfig = this.config.axios_config;
                
        axios.post(url, {
            headers: axiosConfig.headers,
            data: {
                target: targetUrl
            }})
            .then(res => {
                const newMaps = res.data;
                this.setState({maps : newMaps});
            });
    }

    handleMapChange(event) {
        this.setState({
            selected_map: event.target.value
        })
    }

    render() {
        let map_options = [];
        for (let mapName in this.state.maps) {
            let elem = this.state.maps[mapName];

            map_options.push(<option value={elem[elem.length - 1]} key={elem}>{mapName}</option>);
        }
        let hideStyle = {"display": this.state.show ? "block" : "none" }
        return (

            <div className='selector'>
                <div className='card-header' onClick = { (event) =>{
                    
                    this.setState({show: !this.state.show});
                }}>Map Switch</div>

                <div className='card-body' style = {hideStyle}>
                    <div>
                        <span style = {{"color": "white"}}> Current Map: </span> <span className = "map-label">{this.state.selected_map}</span>
                    </div>
                    <hr/>
                    <div className="map-select-section">
                        <select className='custom-select-list' onChange={(()=>{
                        
                            this.state.selected_map = event.target.value;
                    
                        }).bind(this)} defaultValue={this.state.selected_map} >
                            <option default="">Choose...</option>
                            { map_options}
                        </select>
                        <button  className='node-box-stop' 
                            onClick={(()=>{
                                let url = this.config.backend_url;
                                let axiosConfig = this.config.axios_config;
                                        
                                axios.post(url, {
                                    headers: axiosConfig.headers,
                                    data: {
                                        target: this.state.selected_map
                                    }})
                                    .then(res => {
                                        canvas_api.reload(res.data);
                                    });
                            })}
                            >
                            Select
                        </button>
                    </div>
                </div>
            </div>

            
        );
    }
}
