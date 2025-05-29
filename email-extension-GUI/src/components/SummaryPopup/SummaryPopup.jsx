import { Button, Popover } from 'antd'
import React, { useEffect } from 'react'
import { URL_SUMMARIZE_BY_MESSAGE } from '../../js/config';
import Api from '../../js/axios.config';

const SummaryPopup = ({ threadId, messageId, session }) => {
    const [summary, setSummary] = React.useState('')

    const fetchSummary = async () => {
        try {
            const response = await Api.post(URL_SUMMARIZE_BY_MESSAGE, { threadId: threadId, messageId: messageId }, {}, session?.accessToken);
            const data = response.data.summary;
            return data;
        } catch (error) {
            return error.data.message
        }
    };

    return (
        <div className='absolute right-0 z-50'>
            <Popover content={
                <div>
                    {summary}
                </div>
            } title={
                <div className='text-center font-bold text-lg'>
                    Summary
                </div>
            } trigger="click" placement='leftTop' styles={{ body: { width: 400, maxHeight: 500, overflowY: 'auto' } }} >
                <button
                    className='p-[10px] rounded-full border-0 hover:bg-[#f2f2f2]'
                    onClick={async () => {
                        const output = await fetchSummary()
                        setSummary(output)
                    }}>
                    <img
                        width={20}
                        height={20}
                        src="https://img.icons8.com/sf-regular/48/overview-pages-2.png"
                        alt="Custom Icon"
                        title="Summarize email"
                    />
                </button>
            </Popover>
        </div>
    )
}

export default SummaryPopup