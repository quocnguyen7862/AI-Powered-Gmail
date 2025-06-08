"use client";
import Api from "@/axios.config";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { URL_TRACKING_STATS } from "@/constants/endpoints";
import { DatePicker, DatePickerProps } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

const DATE_FORMAT = "YYYY/MM/DD";

const GmailTrackingPage: React.FC = () => {
  const [startDate, setStartDate] = useState(
    dayjs().subtract(6, "day").format(DATE_FORMAT),
  );
  const [endDate, setEndDate] = useState(dayjs().format(DATE_FORMAT));
  const [trackingStats, setTrackingStats] = useState({
    sentCount: 0,
    openedCount: 0,
    unopenedCount: 0,
  });

  const fetchTrackingStats = async () => {
    try {
      const response = await Api.getWithParams(URL_TRACKING_STATS, {
        startDate: startDate,
        endDate: endDate,
      });
      setTrackingStats(response.data);
    } catch (error) {}
  };

  const customWeekStartEndFormat: DatePickerProps["format"] = (value) =>
    `${dayjs(value).format(DATE_FORMAT)} ~ ${dayjs(value).format(DATE_FORMAT)}`;

  const onChangeDate = (dates: any, dateStrings: any) => {
    setStartDate(dateStrings[0]);
    setEndDate(dateStrings[1]);
  };

  useEffect(() => {
    fetchTrackingStats();
  }, [startDate, endDate]);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-[970px]">
        <Breadcrumb pageName="Gmail Tracking Reports" />
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-4">
            <div className="rounded-sm border border-stroke bg-white px-[30px] py-[20px] shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                  Summary reports
                </h4>
                <DatePicker.RangePicker
                  onChange={onChangeDate}
                  maxDate={dayjs().endOf("day")}
                  format={DATE_FORMAT}
                  defaultValue={[
                    dayjs(startDate, DATE_FORMAT),
                    dayjs(endDate, DATE_FORMAT),
                  ]}
                  getPopupContainer={(node) =>
                    document.getElementById("date-picker-container") || node
                  }
                  showTime={true}
                  panelRender={(panel) => (
                    <div>
                      {React.isValidElement(panel)
                        ? React.cloneElement(panel, {})
                        : panel}
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
              <div className="flex justify-evenly gap-6 font-google">
                <div className="flex h-[100px] w-[32.8%] items-center justify-center gap-6 rounded-[5px] bg-[#f4f7f9]">
                  <div className="h-[60px] w-[60px] rounded-md bg-white p-2">
                    <img
                      width="48"
                      height="48"
                      src="https://img.icons8.com/pulsar-gradient/48/postcode.png"
                      alt="postcode"
                    />
                  </div>
                  <div className="box-border">
                    <p className="mb-[3px] text-[32px] font-bold leading-[1] text-[#8178d9]">
                      {trackingStats.sentCount || 0}
                    </p>
                    <p className="text-[14px] font-semibold text-[#666]">
                      Tracking
                    </p>
                  </div>
                </div>
                <div className="flex h-[100px] w-[32.8%] items-center justify-center gap-6 rounded-[5px] bg-[#f4f7f9]">
                  <div className="h-[60px] w-[60px] rounded-md bg-white p-2">
                    <img
                      width="48"
                      height="48"
                      src="https://img.icons8.com/pulsar-gradient/48/feedback.png"
                      alt="feedback"
                    />
                  </div>
                  <div className="box-border">
                    <p className="mb-[3px] text-[32px] font-bold leading-[1] text-[#8cd622]">
                      {trackingStats.sentCount !== 0
                        ? (
                            (trackingStats.openedCount /
                              trackingStats.sentCount) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                      <span className="ms-[3px] text-[14px] font-semibold text-[#666]">
                        ({trackingStats.openedCount || 0})
                      </span>
                    </p>
                    <p className="text-[14px] font-semibold text-[#666]">
                      Opened
                    </p>
                  </div>
                </div>
                {/* <div className="flex h-[100px] w-[32.8%] items-center justify-center gap-6 rounded-[5px] bg-[#f4f7f9]">
                  <div className="h-[60px] w-[60px] rounded-md bg-white p-2">
                    <img
                      width="48"
                      height="48"
                      src="https://img.icons8.com/pulsar-gradient/48/envelope-number.png"
                      alt="envelope-number"
                    />
                  </div>
                  <div className="box-border">
                    <p className="mb-[3px] text-[32px] font-bold leading-[1] text-[#f7d070]">
                      {trackingStats.sentCount !== 0
                        ? (
                            trackingStats.unopenedCount /
                            trackingStats.sentCount
                          ).toFixed(2)
                        : 0}
                      %
                      <span className="ms-[3px] text-[14px] font-semibold text-[#666]">
                        ({trackingStats.unopenedCount || 0})
                      </span>
                    </p>
                    <p className="text-[14px] font-semibold text-[#666]">
                      Unread
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default GmailTrackingPage;
