import React, { useEffect, useRef } from 'react'

const Messages = ({ messages }) => {
    const el = useRef(null);

    useEffect(() => {
        el.current.scrollIntoView({ block: "end", behavior: "smooth" })
    });

    return (
        <div className='messages w-full h-[400px] overflow-auto flex flex-col p-[10px_0]'>
            {messages}
            <div id="el" ref={el} />
        </div>
    )
}

export default Messages