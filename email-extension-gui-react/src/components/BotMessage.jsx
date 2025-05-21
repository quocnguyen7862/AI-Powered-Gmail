import React, { useEffect, useState } from 'react'

const BotMessage = ({ fetchMessage, canInsert }) => {
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
        <div className='message-container w-full relative' >
            <div className='bot-message flex flex-col gap-2 w-[97%] p-4 m-[5px] text-justify'>
                {isLoading ? "..." : (
                    <>
                        <p>{message}</p>
                        <div className='items-center flex gap-2 justify-between'>
                            <div className='items-center flex gap-2'>
                                <button className='px-2 leading-8 items-center border-none rounded box-border bg-[#005b9c] hover:bg-[#003d69] text-white inline-flex font-bold justify-center outline-none'>Insert</button>
                            </div>
                            <div className='items-center flex gap-2'>
                                <button className='px-2 min-h-8 items-center border-none rounded box-border bg-transparent hover:bg-[#ebebeb] hover:shadow-[inset_0_0_0_1px_#a8a8a8] text-white inline-flex font-normal align-middle justify-center outline-none'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="none" viewBox="0 0 16 16" aria-hidden="true" data-icon="InterfaceCopy" stroke="transparent">
                                        <path stroke="#646B81" stroke-linecap="round" stroke-linejoin="round" d="M7.053 10.842v1.908c0 .69.56 1.25 1.25 1.25h4.447c.69 0 1.25-.56 1.25-1.25V8.303c0-.69-.56-1.25-1.25-1.25h-1.908M8.947 3.25v4.447c0 .69-.56 1.25-1.25 1.25H3.25c-.69 0-1.25-.56-1.25-1.25V3.25C2 2.56 2.56 2 3.25 2h4.447c.69 0 1.25.56 1.25 1.25"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default BotMessage