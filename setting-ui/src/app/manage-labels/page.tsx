"use client";
import Api from "@/axios.config";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { LABEL } from "@/constants/endpoints";
import { EmailLabel } from "@/types/email-label";
import { ColorPicker, message, Modal } from "antd";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
const ChartThree = dynamic(() => import("@/components/Charts/ChartThree"), {
  ssr: false,
});

function getRandomColor() {
  // Random HEX color
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

const ManageLabels: React.FC = () => {
  const randomColor = useMemo(() => getRandomColor(), []);
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      color: randomColor,
    },
  });
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteLabel, setDeleteLabel] = useState("");
  const [labelId, setLabelId] = useState("");
  const [labels, setLabels] = useState<EmailLabel[]>([]);

  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      const response = await Api.delete(`${LABEL}/${deleteLabel}`);
      message.success("Label deleted successfully");
      fetchLabels();
    } catch (err: any) {
      message.error("Failed to delete label");
    } finally {
      setConfirmLoading(false);
      setOpen(false);
      setDeleteLabel("");
      setLabelId("");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await Api.post(LABEL, { ...data });
      message.success("Label created successfully");
      fetchLabels();
      reset({
        name: "",
        description: "",
        color: randomColor,
      });
    } catch (err: any) {
      message.error("Failed to create label");
    }
  };

  const fetchLabels = useCallback(async () => {
    try {
      const response = await Api.get(LABEL);

      setLabels([
        ...response.data.map((item: any): EmailLabel => {
          return {
            id: item.id,
            name: item.name,
            description: item.description,
            color: item.color,
          };
        }),
      ]);
    } catch (err: any) {}
  }, []);

  useEffect(() => {
    fetchLabels();
  }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <Breadcrumb pageName="Manage Labels" />
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5">
            <div className="grid grid-cols-5 grid-rows-5 gap-8">
              <div className="col-span-3 row-span-5">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="p-7">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="name"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          {...register("name", { required: true })}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="name"
                        >
                          Color
                        </label>
                        <ColorPicker
                          format="hex"
                          value={watch("color")}
                          onChange={(color) => {
                            const hex =
                              typeof color === "string"
                                ? color
                                : color.toHexString();
                            setValue("color", hex);
                          }}
                          size="large"
                        />
                      </div>
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="apiKey"
                        >
                          Description
                        </label>
                        <textarea
                          {...register("description", { required: true })}
                          rows={6}
                          placeholder="Default textarea"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        ></textarea>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-span-2 row-span-5">
                <ChartThree />
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                        NAME
                      </th>
                      <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                        DESCRIPTION
                      </th>
                      <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                        COLOR
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {modelKeys.map((item, key) => (
                      <tr key={key}>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
                            {item.name}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.provider}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.model}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-ellipsis text-nowrap text-black dark:text-white">
                            {maskApiKey(item.key)}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p
                            className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                              item.isSelected
                                ? "bg-success text-success"
                                : "bg-warning text-warning"
                            }`}
                          >
                            {item.isSelected ? "In use" : "Unused"}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              className="hover:text-red-600"
                              onClick={() => {
                                setDeleteKey(item.key);
                              }}
                            >
                              <svg
                                className="fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M10.556 4a1 1 0 0 0-.97.751l-.292 1.14h5.421l-.293-1.14A1 1 0 0 0 13.453 4h-2.897Zm6.224 1.892-.421-1.639A3 3 0 0 0 13.453 2h-2.897A3 3 0 0 0 7.65 4.253l-.421 1.639H4a1 1 0 1 0 0 2h.1l1.215 11.425A3 3 0 0 0 8.3 22h7.4a3 3 0 0 0 2.984-2.683l1.214-11.425H20a1 1 0 1 0 0-2h-3.22Zm1.108 2H6.112l1.192 11.214A1 1 0 0 0 8.3 20h7.4a1 1 0 0 0 .995-.894l1.192-11.214ZM10 10a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))} */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Modal
            className="max-w-[450px]"
            title="Revoke Label"
            open={open}
            onOk={handleDelete}
            confirmLoading={confirmLoading}
            okButtonProps={{ className: "!bg-red-600 !hover:bg-opacity-90" }}
            okText="Revoke label"
            onCancel={() => setOpen(false)}
          >
            <p>
              This Email label will immediately be disabled. Emails made using
              this label will be rejected, which could cause any systems still
              depending on it to break. Once revoked, you'll no longer be able
              to view or modify this label.
            </p>
            <input
              type="text"
              value={deleteLabel}
              readOnly
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white"
            />
          </Modal>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ManageLabels;
