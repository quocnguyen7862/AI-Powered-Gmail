import { Radio } from 'antd'
import React from 'react'

const SelectLabels = () => {
    return (
        <Radio.Group style={{ display: "flex", flexDirection: "column" }}>
            <Radio.Button style={{ borderRadius: 0 }} value="a">Hangzhou</Radio.Button>
            <Radio.Button style={{ borderRadius: 0 }} value="b">Shanghai</Radio.Button>
            <Radio.Button style={{ borderRadius: 0 }} value="c">Beijing</Radio.Button>
            <Radio.Button style={{ borderRadius: 0 }} value="d">Chengdu</Radio.Button>
        </Radio.Group>
    )
}

export default SelectLabels