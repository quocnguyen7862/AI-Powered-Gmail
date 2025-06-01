import axios from "axios";
import { getSession } from "next-auth/react";
import { serverConfig } from "./config";

const API_URL = serverConfig.api;

const defaultOptions = {};

axios.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session?.accessToken}`;
  }
  return config;
});

function getNotAuthApi(path: string, options: any = {}, apiURL?: string) {
  return axios.get(`${apiURL || API_URL}/${path.replace(/ ^\//, "")}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...options.headers,
    },
  });
}

function getApi(path: string, options: any = {}, apiURL?: string) {
  return axios.get(`${apiURL || API_URL}/${path.replace(/^\//, "")}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...options.headers,
    },
  });
}

function getApiWithParams(
  path: string,
  params: object,
  options: any = {},
  apiURL?: string,
) {
  return axios.get(`${apiURL || API_URL}/${path.replace(/^\//, "")}`, {
    ...defaultOptions,
    ...options,
    params: params,
    headers: {
      ...options.headers,
    },
  });
}

function postApi(path: string, data: any, options: any = {}) {
  return axios.post(`${API_URL}/${path.replace(/^\//, "")}`, data, {
    ...defaultOptions,
    ...options,
    headers: {
      ...options.headers,
    },
  });
}

function putApi(path: string, data: any, options: any = {}) {
  return axios.put(`${API_URL}/${path.replace(/^\//, "")}`, data, {
    ...defaultOptions,
    ...options,
    headers: {
      ...options.headers,
    },
  });
}

function putApiWithParams(
  path: string,
  params: object,
  data: any,
  options: any = {},
) {
  return axios.put(`${API_URL}/${path.replace(/^\//, "")}`, data, {
    ...defaultOptions,
    ...options,
    params: params,
    headers: {
      ...options.headers,
    },
  });
}

function patchApi(path: string, data: any, options: any = {}) {
  return axios.patch(`${API_URL}/${path.replace(/^\//, "")}`, data, {
    ...defaultOptions,
    ...options,
    headers: {
      ...options.headers,
    },
  });
}

function deleteApi(path: string, options: any = {}) {
  return axios.delete(`${API_URL}/${path.replace(/^\//, "")}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...options.headers,
    },
  });
}

function deleteWithParams(path: string, data: any, options: any = {}) {
  return axios.delete(`${API_URL}/${path.replace(/^\//, "")}`, {
    ...defaultOptions,
    ...options,
    params: {
      ...data,
    },
    headers: {
      ...options.headers,
    },
  });
}

function handleErrorStatus(error: any) {
  const status =
    error?.status || error?.response?.status || error?.data?.messages || null;
  switch (status) {
    case 401:
      return error;
    case 403: {
      return error;
    }
    case 404:
      return error;
    case 200:
    case 201:
    case 204:
    case 400:
    case 422:
      return error;
    case 500:
      return error;
    default:
      return error;
  }
}

axios.interceptors.response.use(
  (response) => {
    let data = response?.data;
    return handleErrorStatus({ ...response, data });
  },
  (error) => {
    const errorResponse = error.response;

    return Promise.reject(handleErrorStatus(errorResponse));
  },
);

axios.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };
    if (
      newConfig.headers &&
      newConfig.headers["Content-Type"] === "multipart/form-data"
    )
      return newConfig;
    return newConfig;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const Api = {
  get: getApi,
  post: postApi,
  put: putApi,
  delete: deleteApi,
  patch: patchApi,
  getNotAuth: getNotAuthApi,
  getWithParams: getApiWithParams,
  putWithParams: putApiWithParams,
  deleteWithParams: deleteWithParams,
};

export default Api;
