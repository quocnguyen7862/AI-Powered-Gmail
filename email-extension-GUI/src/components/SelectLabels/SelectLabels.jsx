import { Radio } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import Api from '../../js/axios.config'
import { URL_LABEL } from '../../js/config'

const SelectLabels = ({ session }) => {
    const [labels, setLabels] = useState([])
    console.log("🚀 ~ SelectLabels ~ labels:", labels)

    const fetchLabels = useCallback(async () => {
        try {
            const response = await Api.get(URL_LABEL, {}, session?.accessToken);
            const data = response.data;
            setLabels([...data.map(label => ({ id: label.id, name: label.name, color: label.color }))])
        } catch (error) {
            console.error("Error fetching labels:", error);
        }
    }, [])

    useEffect(() => {
        fetchLabels();
    }, [fetchLabels])



    return (
        <Radio.Group style={{ display: "flex", flexDirection: "column" }} defaultValue={labels[0]?.name || ''}>
            {
                labels.map((label, index) => (
                    <Radio.Button
                        key={index}
                        style={{ borderRadius: 0 }}
                        value={label.name}
                    >
                        {label.name}
                    </Radio.Button>
                ))
            }
        </Radio.Group>
    )
}

export default SelectLabels