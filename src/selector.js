import React from 'react';
import axios from 'axios';

import * as canvas_api from "utils/canvas.js"

export default class MapSelector extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            maps: {},
            selected_map: ''
        }
        this.axiosConfig = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':'GET'
            }
        };
    }

    componentDidMount() {
        let url = `http://localhost:8888`;
        axios.post(url,this.axiosConfig,{data: {target: `http://mvp.momenta.works/config/map/map_lists.json`}})
            .then(res => {
                console.log(res);

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

        return (

            <div className='selector'>
                <div className='card-header'>Map Switch:</div>
                <div className='card-body'>
                    <div>
                        <span style = {{"color": "white"}}> Current Map: </span> <span className = "map-label">{this.state.selected_map}</span>
                    </div>
                    <hr/>
                    <div className="map-select-section">
                        <select className='custom-select-list' onChange={(()=>{
                        
                            this.state.selected_map = event.target.value;
                    
                        }).bind(this)} value={this.state.selected_map} >
                            <option value="">Choose...</option>
                            { map_options}
                        </select>
                        <button  className='node-box-stop' 
                            onClick={(()=>{
                                let url = `http://localhost:8888`;
                        axios.post(url,this.axiosConfig, {data: {target: this.state.selected_map}})
                            .then(res => {
                                canvas_api.reload(res.data);
                            });
                        }).bind(this)}
                            >
                            Select
                        </button>
                    </div>
                </div>
            </div>

            
        );
    }
}
