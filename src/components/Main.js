import React, { Component } from "react";
import { Row, Col } from "antd";
import axios from "axios";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";
import {
  SAT_API_KEY,
  STARLINK_CATEGORY,
  NEARBY_SATELLITE,
  SATELLITE_POSITION_URL,
} from "../constants";

class Main extends Component {
  state = {
    satInfo: null,
    satList: null,
    settings: null,
    positions: null,
    isLoadingList: false,
    isLoadingPosition: false,
    time: null,
    selected: [],
  };

  showNearbySatellite = (setting) => {
    this.setState({
      settings: setting,
    });
    this.fetchSatellite(setting);
  };

  fetchSatellite = (setting) => {
    const { latitude, longitude, altitude, angle } = setting;
    const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${altitude}/${angle}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

    this.setState({
      isLoadingList: true,
    });

    axios
      .get("https://starlink-backend.herokuapp.com/satelliteList", {
        params: {
          url,
        },
      })
      .then((response) => {
        console.log("above data:", response.data);
        this.setState({
          time: new Date(),
          selected: [],
          satInfo: response.data,
          isLoadingList: false,
        });
        this.getPositions(setting, this.state.satInfo.above);
      })
      .catch((error) => {
        console.log("err in fetch satellite -> ", error);
        this.setState({
          isLoadingList: false,
        });
      });
  };

  getPositions = (setting, satInfo) => {
    const { latitude, longitude, altitude, duration } = setting;
    const endTime = duration * 60 + 1;

    this.setState({
      isLoadingPosition: true,
    });

    const urls = satInfo.map((sat) => {
      const { satid } = sat;
      const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${altitude}/${endTime}/&apiKey=${SAT_API_KEY}`;

      return axios.get("https://starlink-backend.herokuapp.com/positions", {
        params: {
          url,
        },
      });
    });

    Promise.all(urls)
      .then((res) => {
        console.log("positions data:", res);
        this.setState({
          positions: res.map((sat) => sat.data),
          isLoadingPosition: false,
        });
      })
      .catch((e) => {
        console.log("err in fetch satellite positions -> ", e.message);
        this.setState({
          isLoadingPosition: false,
        });
      });
  };

  updateSelectedList = (list) => {
    this.setState({ selected: list });
  };

  showMap = (selected) => {
    this.setState((preState) => ({
      ...preState,
      satList: [...selected],
    }));
  };

  render() {
    const {
      satInfo,
      isLoadingList,
      selected,
      satList,
      time,
      isLoadingPosition,
      positions,
    } = this.state;
    return (
      <Row className="main">
        <Col span={8} className="left-side">
          <SatSetting onShow={this.showNearbySatellite} />
          <SatelliteList
            satInfo={satInfo}
            isLoad={isLoadingList}
            selected={selected}
            onShowMap={this.showMap}
            onUpdateSelectedList={this.updateSelectedList}
          />
        </Col>
        <Col span={16} className="right-side">
          <WorldMap
            satData={satList}
            time={time}
            isLoading={isLoadingPosition}
            positions={positions}
          />
        </Col>
      </Row>
    );
  }
}

export default Main;
