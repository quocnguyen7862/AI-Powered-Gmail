"use client";
import Api from "@/axios.config";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SwitcherThree from "@/components/Switchers/SwitcherThree";
import {
  ACTIVE_MODEL,
  CHECK_MODEL,
  MODEL,
  MODEL_MY_KEYS,
} from "@/constants/endpoints";
import { ModelKey } from "@/types/model-key";
import { Package } from "@/types/package";
import { Button, message, Modal } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function maskApiKey(apiKey: string, visibleStart = 4, visibleEnd = 4): string {
  // if (!apiKey || apiKey.length <= visibleStart + visibleEnd) return "*****";
  const start = apiKey.slice(0, visibleStart);
  const end = apiKey.slice(-visibleEnd);
  const masked = "*****";
  return `${start}${masked}${end}`;
}

const models = [
  {
    name: "OpenAI",
    provider: "openai",
    apiKeyType: "OPENAI_API_KEY",
    models: ["gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"],
  },
  {
    name: "Anthropic",
    provider: "anthropic",
    apiKeyType: "ANTHROPIC_API_KEY",
    models: [
      "claude-3-7-sonnet-latest",
      "claude-3-5-haiku-latest",
      "claude-3-5-sonnet-latest",
      "claude-3-opus-latest",
    ],
  },
  {
    name: "Google Gemini",
    provider: "google_genai",
    apiKeyType: "GOOGLE_API_KEY",
    models: [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ],
  },
  {
    name: "Grod",
    provider: "grod",
    apiKeyType: "GROQ_API_KEY",
    models: ["grok-3-latest", "grok-3-fast-latest", "grok-3-mini-fast-latest"],
  },
];

const MagageModels: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      provider: "",
      apiKey: "",
      model: "",
      apiKeyType: "",
      name: "",
    },
  });
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  // const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isChecked, setIsChecked] = useState(false);
  const [modelKeys, setModelKeys] = useState<ModelKey[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [modelId, setModelId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string>("");
  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  const onSubmit = async (data: any) => {
    setConfirmLoading(true);
    if (!isChecked) {
      try {
        const response = await Api.post(CHECK_MODEL, { ...data });
        message.success("Connection tested successfully");
        setIsChecked(true);
      } catch (err: any) {
        console.log("🚀 ~ onSubmit ~ err:", err.data.message);
        message.error(err.data.message);
      } finally {
        setConfirmLoading(false);
      }
    } else {
      if (isUpdate) {
        try {
          const response = await Api.put(MODEL + "/" + modelId, { ...data });
          message.success("Model saved successfully");
        } catch (err: any) {
          message.error("Couldn’t save model");
        } finally {
          setConfirmLoading(false);
        }
      } else {
        try {
          const response = await Api.post(MODEL, { ...data });
          message.success("Model created successfully");
          reset();
        } catch (err: any) {
          message.error("Couldn’t create model");
        } finally {
          setConfirmLoading(false);
        }
      }

      fetchModelKeys();
    }
  };

  const handleEdit = (data: ModelKey) => {
    setValue("name", data.name);
    setValue("provider", data.provider);
    setValue("model", data.model);
    setValue("apiKey", data.key);
    setValue("apiKeyType", data.apiKeyType);
    setModelId(data.id);
    setIsUpdate(true);
  };

  const handleCancelEdit = () => {
    reset();
    setIsUpdate(false);
    setIsChecked(false);
    setModelId("");
  };

  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      const response = await Api.delete(MODEL + "/" + modelId);
      message.success("Model deleted successfully");
      fetchModelKeys();
    } catch (err: any) {
      message.error("Couldn’t delete model");
    } finally {
      setConfirmLoading(false);
      setDeleteKey("");
      setModelId("");
      setOpen(false);
    }
  };

  const handleActiveModel = async (
    modelId: string,
    key: string,
    isActive: boolean,
  ) => {
    try {
      const response = await Api.patch(ACTIVE_MODEL + "/" + modelId, {
        isActive,
      });
      if (isActive) message.success(`Model ${maskApiKey(key)} is now active`);
      else message.success(`Model ${maskApiKey(key)} is now inactive`);
    } catch (err: any) {
      message.error(`Couldn’t change activation model ${maskApiKey(key)}`);
      return false;
    } finally {
      fetchModelKeys();
    }
    return true;
  };

  const fetchModelKeys = useCallback(async () => {
    try {
      const response = await Api.get(MODEL);

      setModelKeys([
        ...response.data.map((item: any): ModelKey => {
          return {
            id: item.id,
            name: item.name,
            provider: item.modelProvider,
            isSelected: item.isSelected,
            key: item.apiKey,
            model: item.model,
            apiKeyType: item.apiKeyType,
          };
        }),
      ]);
    } catch (err: any) {}
  }, []);

  useEffect(() => {
    fetchModelKeys();
  }, []);

  return (
    <div className="mx-auto">
      <Breadcrumb pageName="Manage Models" />
      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5">
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
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Provider
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      {...register("provider", { required: true })}
                      className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                        isOptionSelected ? "text-black dark:text-white" : ""
                      }`}
                      value={watch("provider") || ""}
                      onChange={(e) => {
                        setIsChecked(false);
                        setIsOptionSelected(true);
                        setValue("provider", e.target.value);
                        setValue(
                          "apiKeyType",
                          models.find((m) => m.provider === e.target.value)
                            ?.apiKeyType || "",
                        );
                        setValue("model", ""); // reset model khi provider đổi
                      }}
                    >
                      <option
                        value=""
                        disabled
                        className="text-body dark:text-bodydark"
                      >
                        Select your provider
                      </option>
                      {models.map((item, index) => {
                        return (
                          <option
                            key={index}
                            value={item.provider}
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
                </div>
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Model
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      {...register("model", { required: true })}
                      className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                        isOptionSelected ? "text-black dark:text-white" : ""
                      }`}
                      value={watch("model") || ""}
                      onChange={(e) => {
                        setIsChecked(false);
                        setValue("model", e.target.value);
                      }}
                      disabled={watch("provider") === ""}
                    >
                      <option
                        value=""
                        disabled
                        className="text-body dark:text-bodydark"
                      >
                        {watch("provider") !== ""
                          ? "Select your model"
                          : "Select provider first"}
                      </option>
                      {watch("provider") !== "" &&
                        models
                          .find((m) => m.provider === watch("provider"))
                          ?.models.map((model, idx) => (
                            <option
                              key={idx}
                              value={model}
                              className="text-body dark:text-bodydark"
                            >
                              {model}
                            </option>
                          ))}
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
                </div>
                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="apiKey"
                  >
                    API Key
                  </label>
                  <input
                    type="text"
                    {...register("apiKey", { required: true })}
                    onChange={() => {
                      setIsChecked(false);
                    }}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    size="large"
                    loading={confirmLoading}
                    htmlType="submit"
                    className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  >
                    {!isChecked
                      ? "Check API Key"
                      : isUpdate
                        ? "Save"
                        : "Create"}
                  </Button>
                  {isUpdate && (
                    <Button
                      size="large"
                      htmlType="button"
                      onClick={handleCancelEdit}
                      className="flex w-full justify-center rounded bg-neutral-400 p-3 font-medium text-gray hover:bg-opacity-90"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-span-5">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      NAME
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      PROVIDER
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      MODEL
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      API KEY
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      STATUS
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modelKeys.map((item, key) => (
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
                            className="hover:text-primary"
                            onClick={() => handleEdit(item)}
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
                                fillRule="evenodd"
                                d="M16.793 2.793a3.121 3.121 0 1 1 4.414 4.414l-8.5 8.5A1 1 0 0 1 12 16H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 .293-.707l8.5-8.5Zm3 1.414a1.121 1.121 0 0 0-1.586 0L10 12.414V14h1.586l8.207-8.207a1.121 1.121 0 0 0 0-1.586ZM6 5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4a1 1 0 1 1 2 0v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h4a1 1 0 1 1 0 2H6Z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </button>
                          <button
                            className="hover:text-red-600"
                            onClick={() => {
                              setModelId(item.id);
                              setOpen(true);
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
                                fillRule="evenodd"
                                d="M10.556 4a1 1 0 0 0-.97.751l-.292 1.14h5.421l-.293-1.14A1 1 0 0 0 13.453 4h-2.897Zm6.224 1.892-.421-1.639A3 3 0 0 0 13.453 2h-2.897A3 3 0 0 0 7.65 4.253l-.421 1.639H4a1 1 0 1 0 0 2h.1l1.215 11.425A3 3 0 0 0 8.3 22h7.4a3 3 0 0 0 2.984-2.683l1.214-11.425H20a1 1 0 1 0 0-2h-3.22Zm1.108 2H6.112l1.192 11.214A1 1 0 0 0 8.3 20h7.4a1 1 0 0 0 .995-.894l1.192-11.214ZM10 10a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </button>
                          <SwitcherThree
                            onChange={() =>
                              handleActiveModel(
                                item.id,
                                item.key,
                                !item.isSelected,
                              )
                            }
                            checked={item.isSelected}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Modal
          className="max-w-[450px]"
          title="Revoke API Key"
          open={open}
          onOk={handleDelete}
          confirmLoading={confirmLoading}
          okButtonProps={{ className: "!bg-red-600 !hover:bg-opacity-90" }}
          okText="Revoke key"
          onCancel={() => setOpen(false)}
        >
          <p>
            This API key will immediately be disabled. API requests made using
            this key will be rejected, which could cause any systems still
            depending on it to break. Once revoked, you'll no longer be able to
            view or modify this API key.
          </p>
          <input
            type="text"
            value={maskApiKey(deleteKey)}
            readOnly
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white"
          />
        </Modal>
      </div>
    </div>
  );
};

export default MagageModels;
