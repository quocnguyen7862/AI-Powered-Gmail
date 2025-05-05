import React from 'react'

const Input = ({ onSend }) => {
    const [text, setText] = React.useState('');

    const handleInputChange = (e) => {
        setText(e.target.value);
    }

    const handleSend = (e) => {
        e.preventDefault();
        onSend(text);
        setText("");
    }

    return (
        <div className='input relative'>
            <form onSubmit={handleSend}>
                <input
                    className='text-base border-0 rounded-none rounded-bl-xl rounded-br-xl border-t-[1px_solid_#eee] shadow-none opacity-[1] outline-[none] p-[16px_52px_16px_10px] w-full focus:outline-none'
                    type='text'
                    onChange={handleInputChange}
                    value={text}
                    placeholder='Type your message...'
                />
                <button className='bg-transparent border-0 rounded-br-xl shadow-none cursor-pointer fill-[#4a4a4a] opacity-[1] outline-none p-[14px_16px_12px_16px] absolute right-0 top-0'>
                    <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 500 500"
                    >
                        <g>
                            <g>
                                <polygon points="0,497.25 535.5,267.75 0,38.25 0,216.75 382.5,267.75 0,318.75" />
                            </g>
                        </g>
                    </svg>
                </button>
            </form>
        </div>
    )
}

export default Input