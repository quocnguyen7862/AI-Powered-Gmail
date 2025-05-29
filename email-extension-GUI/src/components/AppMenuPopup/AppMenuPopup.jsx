import { DatePicker, Switch } from "antd";
import React, { useEffect, useState } from "react";
import Api from "../../js/axios.config";
import { URL_AUTH_LOGOUT, URL_GMAIL_AUTH, URL_TRACKING_STATS } from "../../js/config";
import dayjs from "dayjs";

const DATE_FORMAT = 'YYYY/MM/DD';

export default function AppMenuPopup({ email, session }) {
    const [isEnabled, setIsEnabled] = useState(session?.isSignedIn);
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(dayjs().startOf('week').format(DATE_FORMAT));
    const [endDate, setEndDate] = useState(dayjs().endOf('week').format(DATE_FORMAT));
    const [trackingStats, setTrackingStats] = useState({ sentCount: 0, openedCount: 0, unopenedCount: 0 });

    const handleLogin = async () => {
        try {
            const response = await Api.postApiNonAuth(URL_GMAIL_AUTH, { email: email });
            if (response.data.isRegistered)
                window.location.href = response.data.url;
            else
                window.open(response.data.url, '_blank');
        } catch (error) {
            console.log("🚀 ~ handleLogin ~ error:", error)
        }
    }

    const handleLogout = async () => {
        try {
            const response = await Api.post(URL_AUTH_LOGOUT, {}, {}, session?.accessToken);
            window.location.reload();
        } catch (error) {
            console.log("🚀 ~ handleLogout ~ error:", error)
        }
    }

    const fetchTrackingStats = async () => {
        try {
            const response = await Api.getWithParams(URL_TRACKING_STATS, {
                startDate: startDate,
                endDate: endDate
            }, {}, session?.accessToken);
            setTrackingStats(response.data);
        } catch (error) {

        }
    }

    const onChangeChecked = async checked => {
        setIsLoading(true);
        if (checked) {
            handleLogin();
        }
        else {
            handleLogout();
        }
        setIsLoading(false);
    };

    const onChangeDate = (dates, dateStrings) => {
        setStartDate(dateStrings[0]);
        setEndDate(dateStrings[1]);
    }

    useEffect(() => {
        fetchTrackingStats();
    }, [startDate, endDate])

    return (
        <div className="w-[350px] bg-white rounded-[3px] shadow-lg p-5 font-sans absolute -translate-x-1/2">
            <div className="flex items-center justify-between mb-6">
                <a href="http://localhost:3000" target="_blank">
                    <span className="text-xs text-gray-400">AI Powered Gmail</span>
                </a>
                {
                    isEnabled && (
                        <span className="text-sm text-gray-700">{session.fullName}</span>
                    )
                }

            </div>
            {
                !isEnabled && (
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-700">AI Powered Gmail is currently disabled for:</span>
                    </div>
                )
            }
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-700">{email}</span>
                <Switch loading={isLoading} checked={isEnabled} onChange={onChangeChecked} />
            </div>
            {
                isEnabled && (
                    <>
                        <div className="flex items-center gap-2 mb-4 justify-center" id="date-picker-container">
                            <DatePicker.RangePicker
                                format={DATE_FORMAT}
                                defaultValue={[dayjs(startDate, DATE_FORMAT), dayjs(endDate, DATE_FORMAT)]}
                                onChange={onChangeDate}
                                getPopupContainer={() => document.getElementById('date-picker-container')}
                                showTime={true}
                                panelRender={panel => (
                                    <div>
                                        {/* Ẩn panel giờ nếu có */}
                                        {React.cloneElement(panel, {
                                            style: { ...panel.props.style, minWidth: 0 }
                                        })}
                                        <style>
                                            {`
                                                .ant-picker-time-panel {
                                                    display: none !important;
                                                }
                                                `}
                                        </style>
                                    </div>
                                )}
                            />
                        </div>
                        <div className="flex justify-between text-center font-bold mb-4">
                            <div>
                                <div className="text-sm text-gray-400">SENT</div>
                                <div className="text-2xl font-bold text-gray-700">{trackingStats.sentCount || 0}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">OPENED</div>
                                <div className="flex flex-row gap-1 justify-center items-end">
                                    <span className="text-2xl font-bold text-green-500 ">{trackingStats.openedCount || 0}</span>
                                    <span className="text-sm text-gray-400">{trackingStats.sentCount !== 0 ? (trackingStats.openedCount / trackingStats.sentCount).toFixed(2) : 0}%</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">UNOPENED</div>
                                <div className="flex flex-row gap-1 justify-center items-end">
                                    <span className="text-2xl font-bold text-yellow-500 ">{trackingStats.unopenedCount || 0}</span>
                                    <span className="text-sm text-gray-400">{trackingStats.sentCount !== 0 ? (trackingStats.unopenedCount / trackingStats.sentCount).toFixed(2) : 0}%</span>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div>
    );
}