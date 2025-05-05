import { Popover } from 'antd'
import React from 'react'

const SummaryPopup = () => {
    return (
        <div className='absolute top-0 right-0 mt-2 mr-2'>
            <Popover content={"fjadljflaskjdflkasdlfka"} title="Summary" trigger="click" placement='leftTop'>
                <img
                    src="https://img.icons8.com/sf-regular/48/overview-pages-2.png"
                    alt="Custom Icon"
                    title="Click to perform action"
                />
            </Popover>
        </div>
    )
}

export default SummaryPopup