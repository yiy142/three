import React from 'react';
import MapSelector from './selector';
import POIController from './controller';

export default class Tool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show : true,
            poiNames: ["road_border_physical", "dashed_line", "solid_line", "highway", "parking_lot", "human_access", "no_parking_zone", "garage_entrance", "garage_exit", "speed_bump", "pillar"]
        }
    }
    getPoiNames(newPois){
        this.setState({poiNames: newPois});
    }

    render() {
        let hideStyle = {"display": this.state.show ? "block" : "none" }
        return (
            <div className = "tool">
                <div className='card-header' onClick = { (event) =>{
                    
                    this.setState({show: !this.state.show});
                }}>Map Control</div>
                <div style = {hideStyle}>
                    <MapSelector getPoiNames = {this.getPoiNames.bind(this)}/>
                    <br></br>
                    <POIController poiNames = {this.state.poiNames} />
                </div>
            </div>
        );
    }
}