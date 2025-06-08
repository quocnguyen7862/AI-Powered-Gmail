import dayjs from 'dayjs'
import React from 'react'

const TrackingPanel = ({ trackings }) => {
    return (
        <div className='flex flex-col h-full'>
            <div className='px-[10px] py-4 border-b-[1px] border-gray-200'>
                <p className='text-[10px] text-[#727A81] font-bold'>
                    EMAIL TRACKER
                </p>
            </div>
            {
                trackings.length > 0 && trackings.map((tracking, index) => {
                    return (
                        <>
                            <div key={index} className='px-[10px] py-4 text-[16px] mb-[16px] border-b-[1px] border-gray-200'>
                                <p className='text-[12px] font-semibold mb-[3px] text-[#5A5A5A]'>
                                    {tracking.subject}
                                </p>
                                <span className='w-auto bg-[#a272f9] text-white text-center text-[11px] font-bold leading-[1px] rounded-[2px] px-[6px] py-[4px]'>
                                    Opens {tracking.readeds.length}
                                </span>
                            </div>
                            <ul className='px-[15px] border-b-[1px] border-gray-200'>
                                {
                                    tracking.readeds.reverse().map((readed, index) => {
                                        return (
                                            <li key={readed.id} className=' pb-[19px]'>
                                                <div className='flex items-start'>
                                                    <span className='w-[54px] h-[22px] bg-[#a272f9] text-white text-center text-[11px] font-bold leading-[1px] rounded-[2px] px-[6px] pb-[4px] pt-[10px]'>
                                                        Open
                                                    </span>
                                                    <div className='mt-[5px] h-[22px] ml-auto text-end'>
                                                        <span className='text-[11px] text-black mb-[3px]'>
                                                            {dayjs(readed.createdAt).format('M/D/YYYY, h:mm:ss A')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </>
                    )
                })
            }
        </div>
    )
}

export default TrackingPanel