import { DatePicker, Switch } from "antd";
import React from "react";

export default function AppMenuPopup() {
    const [isEnabled, setIsEnabled] = React.useState(false);

    const onChange = checked => {
        setIsEnabled(checked);
    };

    return (
        <div className="w-[350px] bg-white rounded-xl shadow-lg p-5 font-sans">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <span className="text-xs text-gray-400">AI Powered Gmail</span>
                </div>
                <span className="text-xs text-gray-500">quoc nguyen</span>
            </div>
            {
                !isEnabled && (
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-700">AI Powered Gmail is currently disabled for:</span>
                    </div>
                )
            }
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-700">ducquoc2002@gmail.com</span>
                <Switch defaultChecked={isEnabled} onChange={onChange} />
            </div>
            {
                isEnabled && (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <DatePicker.RangePicker />
                        </div>
                        <div className="flex justify-between text-center font-bold mb-4">
                            <div>
                                <div className="text-sm text-gray-400">SENT</div>
                                <div className="text-2xl font-bold text-gray-700">0</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">OPENED</div>
                                <span className="text-2xl font-bold text-green-500">0</span>
                                <span className="text-sm text-gray-400">0%</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">REPLIED</div>
                                <span className="text-2xl font-bold text-yellow-500">0</span>
                                <span className="text-sm text-gray-400">0%</span>
                            </div>
                        </div>
                    </>
                )
            }
        </div>
    );
}