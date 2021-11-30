import React, {Component} from 'react'
import {Form, Button, InputNumber} from 'antd'

class SatSettingForm extends Component {
    render() {
        const {getFieldDecorator} = this.props.form
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 11},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 13},
            },
        }
        return (
            <Form {...formItemLayout} className="sat-setting" onSubmit={this.showSatellite}>
                <Form.Item label="Longitude (degrees)">
                    {
                        getFieldDecorator("longitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input the longitude",
                                }
                            ],
                            initialValue: 0
                        })(<InputNumber
                            placeholder="Please input longitude"
                            min={-180} max={180}
                            style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Latitude (degrees)">
                    {
                        getFieldDecorator("latitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input the latitude",
                                }
                            ],
                            initialValue: 0
                        })(<InputNumber
                            placeholder="Please input latitude"
                            min={-90} max={90}
                            style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Altitude (meters)">
                    {
                        getFieldDecorator("altitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input the altitude",
                                }
                            ],
                            initialValue: 0
                        })(<InputNumber
                            placeholder="Please input altitude"
                            min={-413} max={8850}
                            style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Angle (degrees)">
                    {
                        getFieldDecorator("angle", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input the angle",
                                }
                            ],
                            initialValue: 90
                        })(<InputNumber
                            placeholder="Please input angle"
                            min={0} max={90}
                            style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Duration (minutes)">
                    {
                        getFieldDecorator("duration", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input the duration",
                                }
                            ],
                            initialValue: 10
                        })(<InputNumber
                            placeholder="Please input duration"
                            min={0} max={60}
                            style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item className="show-nearby">
                    <Button type="primary" htmlType="submit" style={{textAlign: "center"}}>
                        Find Nearby Satellite
                    </Button>
                </Form.Item>
            </Form>
        )
    }

    showSatellite = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
                this.props.onShow(values)
            }
        })
    }
}

const SatSetting = Form.create({name: 'satellite-setting'})(SatSettingForm)
export default SatSetting
