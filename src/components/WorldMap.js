import React, {Component} from 'react'
import axios from 'axios'
import {Spin} from "antd"
import {feature} from 'topojson-client'
import {geoGraticule, geoPath} from 'd3-geo'
import {geoKavrayskiy7} from 'd3-geo-projection'
import {select as d3Select} from 'd3-selection'
import {schemeCategory10} from "d3-scale-chromatic"
import * as d3Scale from "d3-scale"
import {timeFormat as d3TimeFormat} from "d3-time-format"
import {WORLD_MAP_URL} from "../constants"

const width = 960
const height = 600

class WorldMap extends Component {
    constructor() {
        super()
        this.state = {
            isDrawing: false
        }
        this.map = null
        this.refMap = React.createRef()
        this.refTrack = React.createRef()
        this.color = d3Scale.scaleOrdinal(schemeCategory10)
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                const {data} = res
                const land = feature(data, data.objects.countries).features
                this.generateMap(land)
            })
            .catch(e => console.log('err in fetching world map data ', e.message))
    }

    generateMap(land) {
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1)

        const graticule = geoGraticule()

        const canvas = d3Select(this.refMap.current)
            .attr("width", width)
            .attr("height", height)

        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height)

        const context = canvas.node().getContext("2d")
        const context2 = canvas2.node().getContext("2d")

        const path = geoPath()
            .projection(projection)
            .context(context)

        land.forEach(ele => {
            context.globalAlpha = 0.7
            context.fillStyle = '#B3DDEF'
            context.strokeStyle = '#000'
            context.lineWidth = 1
            context.beginPath()
            path(ele)
            context.fill()
            context.stroke()

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)'
            context.lineWidth = 0.1
            context.beginPath()
            path(graticule())
            context.stroke()

            context.lineWidth = 0.5
            context.beginPath()
            path(graticule.outline())
            context.stroke()
        })

        this.map = {
            projection: projection,
            context2: context2
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("prevProps:", prevProps)
        console.log("currProps:", this.props)

        if (prevProps.time !== this.props.time) {
            const {context2} = this.map
            context2.clearRect(0, 0, width, height)
            context2.font = "bold 14px sans-serif"
            context2.fillStyle = "#333"
            context2.textAlign = "center"
            context2.fillText(d3TimeFormat(this.props.time), width / 2, 20)
        }

        if (prevProps.satData !== this.props.satData) {
            this.setState({
                isDrawing: true
            })

            const showingPositions = this.selectPositions(this.props.satData, this.props.positions)
            if (!prevState.isDrawing) {
                this.track(showingPositions)
            } else {
                const oHint = document.getElementsByClassName("hint")[0]
                oHint.innerHTML = "Please wait for the animation to finish before selecting new ones!"
            }
        }
    }

    selectPositions = (satData, positions) => {
        return positions.filter(entry => {
            return satData.some(item => {
                return item.satid === entry.info.satid
            })
        })
    }

    track = data => {
        if (!data[0].hasOwnProperty("positions")) {
            throw new Error("no position data")
        }

        const len = data[0].positions.length
        const {context2} = this.map

        let i = 0
        let timer = setInterval(() => {
            if (i >= len) {
                clearInterval(timer)
                this.setState({isDrawing: false})
                const oHint = document.getElementsByClassName("hint")[0]
                oHint.innerHTML = ""
                return
            }

            let timePassed = 1000 * i
            let time = new Date(this.props.time.getTime() + timePassed)

            context2.clearRect(0, 0, width, height)
            context2.font = "bold 14px sans-serif"
            context2.fillStyle = "#333"
            context2.textAlign = "center"
            context2.fillText(d3TimeFormat(time), width / 2, 20)

            data.forEach(sat => {
                const {info, positions} = sat
                this.drawSat(info, positions[i])
            })

            i += 60
        }, 1000)
    }

    drawSat = (sat, pos) => {
        const {satlongitude, satlatitude} = pos

        if (!satlongitude || !satlatitude) return

        const {satname} = sat
        const nameWithNumber = satname.match(/\d+/g).join("")

        const {projection, context2} = this.map
        const xy = projection([satlongitude, satlatitude])

        context2.fillStyle = this.color(nameWithNumber)
        context2.beginPath()
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI)
        context2.fill()
        context2.font = "bold 11px sans-serif"
        context2.textAlign = "center"
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14)
    }

    render() {
        const {isLoading} = this.props
        return (
            <div className="map-box">
                {
                    isLoading ?
                        <div className="spinner">
                            <Spin tip="Loading..." size="large"/>
                        </div>
                        :
                        null
                }
                <canvas className="map" ref={this.refMap}/>
                <canvas className="track" ref={this.refTrack}/>
                <div className="hint"/>
            </div>
        )
    }
}

export default WorldMap
