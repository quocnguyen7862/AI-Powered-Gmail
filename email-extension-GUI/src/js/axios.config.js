import axios from 'axios'
import { serverConfig } from './config';

const API_URL = serverConfig.api

const defaultOptions = {
    baseURL: API_URL,
    withCredentials: true
};

function getNotAuthApi(path, options = {}) {
    return axios.get(`${path.replace(/ ^\//, '')}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers
        }
    });
}

function getApi(path, options = {}, token) {
    return axios.get(`${path.replace(/^\//, '')}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers,
        }
    });
}

function getApiWithParams(path, params, options = {}, token) {

    return axios.get(`${path.replace(/^\//, '')}`, {
        ...defaultOptions,
        ...options,
        params: params,
        headers: {
            ...options.headers,

        }
    });
}

function postApi(path, data, options = {}, token) {
    return axios.post(`${path.replace(/^\//, '')}`, data, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers,

        }
    });
}

function postApiNonAuth(path, data, options = {}) {
    return axios.post(`${path.replace(/^\//, '')}`, data, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers
        }
    });
}

function putApiWithData(path, data, options = {}, token) {

    return axios.put(`${path.replace(/^\//, '')}`, data, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers,

        }
    });
}

function putApi(path, options = {}, token) {

    return axios.put(`${path.replace(/^\//, '')}`, null, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers,

        }
    });
}

function putApiWithParams(path, data, options = {}, token) {

    return axios.put(`${path.replace(/^\//, '')}`, data, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers,

        }
    });
}

function patchApi(path, data, options = {}, token) {

    return axios.patch(`${path.replace(/^\//, '')}`, data, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers,

        }
    });
}

function deleteApi(path, options = {}, token) {

    return axios.delete(`${path.replace(/^\//, '')}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...options.headers,

        }
    });
}

function deleteApiWithData(path, data, options = {}, token) {

    return axios.delete(`${path.replace(/^\//, '')}`, {
        ...defaultOptions,
        ...options,
        data: {
            ...data
        },
        headers: {
            ...options.headers,

        }
    });
}

function deleteWithParams(path, data, options = {}, token) {

    return axios.delete(`${path.replace(/^\//, '')}`, {
        ...defaultOptions,
        ...options,
        params: {
            ...data
        },
        headers: {
            ...options.headers,

        }
    });
}

function handleErrorStatus(error) {
    const status = error?.status || error?.response?.status || error?.data?.messages || null;
    switch (status) {
        case 401:
            return error;
        case 403: {
            // Router.push('/forbidden');
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
        if (response.status === 401) return (window.location.href = serverConfig.signin_url);
        return handleErrorStatus({ ...response, data });
    },
    (error) => {
        const errorResponse = error.response;

        return Promise.reject(handleErrorStatus(errorResponse));
    }
);

axios.interceptors.request.use(
    (config) => {
        const newConfig = { ...config };
        if (newConfig.headers && newConfig.headers['Content-Type'] === 'multipart/form-data') return newConfig;
        return newConfig;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const Api = {
    get: getApi,
    post: postApi,
    postApiNonAuth: postApiNonAuth,
    putData: putApiWithData,
    put: putApi,
    delete: deleteApi,
    patch: patchApi,
    getNotAuth: getNotAuthApi,
    getWithParams: getApiWithParams,
    putWithParams: putApiWithParams,
    deleteWithParams: deleteWithParams,
    deleteWithDatas: deleteApiWithData
};

export default Api;