import React from 'react'

const Header = ({ onClick }) => {
    return (
        <div className='flex bg-[#005b9c] p-5'>
            <div className="header text-center max-h-[58px] text-base font-bold flex-1 text-white">&nbsp;React Chatbot UI</div>
            <button onClick={onClick} className='w-6 items-center border-none rounded bg-transparent hover:bg-[#609cc7] text-white inline-flex font-normal align-middle justify-center outline-none'>
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWUlEQVR4nL3Uv05UQRTH8d1FwEolVMAGGgsihpoABYUxQGzs7OiARGMiPYkNUi9UvAKvQMsjELOuJfJHewWrj5lwEm82987uGsNJJndyz5nvzO/MmVOr3adhCLN4iXU8R6PfxcOF+WN8wjd3doubmF9iH2O9gF/wAis4Rxtv0SzETGITHXzHcg74Ay38jO/DnJqIua2EBjDZCea6fBt4WrKmhWs8KQMmiUV7VvCdJfkVJ+2kfJcBR1OiYzzq8pUCw7eFC9RLpVcsygGnQtHfNGEaO/8IrEdJrRZ/vsLvVMgZ4CmOYrzpBZyPY89UAD/guDC2C75mmeQHkdj3VbIz6dgqvRTs4vOAsBF8xV6ZM5XLuwGBB7hKbz8X9Bof0+6ZmFTQh/H0FnvtuhC7tqMRTHRdwHbITDFL/UoZj/aVOkqyX4X2lS5gLyszA26kcojmupbe90BP7H/YH/XhBdXogkRwAAAAAElFTkSuQmCC" alt="time-machine"></img>
            </button>
        </div>
    )
}

export default Header