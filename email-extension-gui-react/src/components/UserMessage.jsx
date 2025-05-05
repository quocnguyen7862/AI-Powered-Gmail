import React from 'react'

const UserMessage = ({ text }) => {
    return (
        <div className="message-container w-full">
            <div className="user-message float-right p-[15px_10px] m-3 rounded-[20px_20px_1px_20px] bg-[#cccccc] text-black">{text}</div>
        </div>
    )
}

export default UserMessage