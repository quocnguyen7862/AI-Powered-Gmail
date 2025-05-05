import React, { useEffect, useState } from 'react'

const BotMessage = ({ fetchMessage }) => {
    const [isLoading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadMessage() {
            const msg = await fetchMessage();
            setLoading(false);
            setMessage(msg);
        }
        loadMessage();
    }, [fetchMessage]);

    return (
        <div className='message-container w-full' >
            <div className='bot-message float-left p-[15px_20px] m-[5px] rounded-[20px_20px_20px_1px] bg-[#00aaa5] text-white min-w-10'>
                {isLoading ? "..." : message}
            </div>
        </div>
    )
}

export default BotMessage