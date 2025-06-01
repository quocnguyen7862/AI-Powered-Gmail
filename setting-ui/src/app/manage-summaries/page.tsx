"use client";
import Api from "@/axios.config";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  URL_RE_SUMMARIZE,
  URL_SUMMARIZE,
  URL_SUMMARIZE_LANGUAGE,
} from "@/constants/endpoints";
import { Button, message, Modal, Pagination, Skeleton } from "antd";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MarkdownPreview } from "../chatbot/[slug]/page";

const languages = [
  { name: "Tiếng Việt", value: "vi" },
  { name: "English", value: "en" },
  { name: "日本語", value: "ja" },
  { name: "한국어", value: "ko" },
  { name: "中文", value: "zh" },
  { name: "Español", value: "es" },
  { name: "Deutsch", value: "de" },
  { name: "Français", value: "fr" },
];

const MangeSummaries = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      language: session?.user?.summaryLanguage,
    },
  });

  const fetchMessages = useCallback(async (page: number) => {
    try {
      const response = await Api.getWithParams(URL_SUMMARIZE, { page: page }); // Replace with your API endpoint
      const data = response.data;
      setMessages([...data.data]);
      setTotalMessages(data.total);
      setCurrentPage(page);
    } catch (error) {
      message.error("Error fetching messages");
    }
  }, []);

  const reSummarize = useCallback(
    async (messageId: string, threadId: string, language?: string) => {
      setLoading(true);
      try {
        const response = await Api.post(URL_RE_SUMMARIZE, {
          messageId: messageId,
          threadId: threadId,
          language: language,
        });
        const data = response.data;
        console.log("🚀 ~ selectedMessage:", selectedMessage);
        setSelectedMessage((prev: any) => ({
          ...prev,
          summary: data.summary,
          language: data.language,
        }));
      } catch (error) {
        message.error("Error re-summarizing message");
      }
      setLoading(false);
      fetchMessages(currentPage); // Refresh the list after re-summarizing
    },
    [],
  );

  const onSubmit = async (data: any) => {
    setConfirmLoading(true);
    try {
      await Api.patch(`${URL_SUMMARIZE_LANGUAGE}/${data.language}`, {});
      message.success("Settings saved successfully");
    } catch (error) {
      message.error("Error saving settings");
    }
    setConfirmLoading(false);
  };

  useEffect(() => {
    fetchMessages(currentPage);
  }, []);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Summaries" />
      <div className=" mx-auto h-full">
        <div className="grid h-full grid-cols-5 gap-8">
          <div className="col-span-5">
            <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              <div>
                <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                  Configure Summaries
                </h4>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="name"
                    >
                      Language
                    </label>
                    <div className=" z-20 flex items-end gap-4 bg-transparent dark:bg-form-input md:w-2/5">
                      <div className="relative w-full ">
                        <select
                          {...register("language")}
                          className={
                            "font-google relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-3 py-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary "
                          }
                          value={watch("language")}
                        >
                          {languages.map((item, index) => {
                            return (
                              <option
                                key={index}
                                value={item.value}
                                className="text-body dark:text-bodydark"
                              >
                                {item.name}
                              </option>
                            );
                          })}
                        </select>
                        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill=""
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                      <Button
                        loading={confirmLoading}
                        size="middle"
                        htmlType="submit"
                        className="flex-1 justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                      >
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
              <div>
                <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                  Summary Emails
                </h4>
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                          FROM
                        </th>
                        <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                          SUBJECT
                        </th>
                        <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                          SUMMARY
                        </th>
                        <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                          SENT AT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-google">
                      {messages.length > 0 &&
                        messages.map((item, key) => (
                          <tr
                            key={key}
                            className="cursor-pointer hover:bg-gray-2 dark:hover:bg-meta-4"
                            onClick={() => {
                              setOpen(true);
                              setSelectedMessage(item);
                            }}
                          >
                            <td className="border-b border-[#eee] px-4 py-5 pl-9 font-medium dark:border-strokedark xl:pl-11">
                              <h5 className="text-black dark:text-white">
                                {item.from &&
                                  (item.from.match(/"(.+)"\s+<.+>/)?.[1] ||
                                    item.from)}
                              </h5>
                            </td>
                            <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                              <p className="text-black dark:text-white">
                                {item?.subject}
                              </p>
                            </td>
                            <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                              <p className="max-w-[200px] truncate text-black dark:text-white ">
                                {item?.summary}
                              </p>
                            </td>
                            <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                              <p className="text-nowrap text-sm text-black dark:text-white">
                                {item?.sentAt &&
                                  (() => {
                                    const date = new Date(item.sentAt);
                                    const time = date.toLocaleTimeString(
                                      "en-CA",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      },
                                    );
                                    const day = date.getDate();
                                    const month = date.getMonth() + 1;
                                    const year = date.getFullYear();
                                    return `${time} ${day}/${month}, ${year}`;
                                  })()}
                              </p>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  pageSize={50}
                  defaultCurrent={currentPage}
                  total={totalMessages}
                  showTotal={(total) => `Total ${total} email`}
                  className="my-6 justify-end"
                />
              </div>
            </div>
            <Modal
              className="max-w-[450px]"
              title={`Summary of ${selectedMessage?.subject}`}
              open={open}
              okButtonProps={{ className: "!bg-red-600 !hover:bg-opacity-90" }}
              footer={[]}
              onCancel={() => setOpen(false)}
            >
              <div className="max-h-100 overflow-auto">
                {loading ? (
                  <Skeleton active={loading} />
                ) : (
                  <MarkdownPreview markdown={selectedMessage?.summary} />
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <select
                  disabled={loading}
                  className={
                    "font-google relative z-20 appearance-none rounded border border-stroke bg-transparent px-3 py-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary "
                  }
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    reSummarize(
                      selectedMessage?.messageId,
                      selectedMessage?.threadId,
                      e.target.value,
                    );
                  }}
                  value={selectedMessage?.language}
                >
                  {languages.map((item, index) => {
                    return (
                      <option
                        key={index}
                        value={item.value}
                        className="text-body dark:text-bodydark"
                      >
                        {item.name}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => {
                    reSummarize(
                      selectedMessage?.messageId,
                      selectedMessage?.threadId,
                    );
                  }}
                >
                  <img
                    width="24"
                    height="24"
                    src="https://img.icons8.com/pulsar-line/48/rotate-right.png"
                    alt="rotate-left"
                    className={`${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MangeSummaries;
