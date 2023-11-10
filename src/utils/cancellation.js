import axios from "axios";

const cancelMessage = 'Cancelled';
var CancelToken = axios.CancelToken;

let cancelTokens = {};

function getCancelSource() {
    let source = CancelToken.source();
    let id = Math.random().toString(36)
    cancelTokens[id] = source
    return id
}
export function getCancellable(api, url, params) {
    let id = getCancelSource();
    params.cancelToken = cancelTokens[id].token;
    return api.get(url, params)
        .then(res => { return res })
        .catch((err) => {
            if (axios.isCancel(err)) {
                return false;
            } else {
                throw err;
            }
        })
        .finally(() => {
            delete cancelTokens[id];
        })
}
export function postCancellable(api, url, params) {
    let id = getCancelSource();
    params.cancelToken = cancelTokens[id].token;
    return api.post(url, params)
        .then(res => {
            return res
        })
        .catch((err) => {
            if (axios.isCancel(err)) {
                return false;
            } else {
                throw err;
            }
        })
        .finally(() => {
            delete cancelTokens[id];
        })
}

export function cancelRequests() {
    if (cancelTokens) {
        for (const id in cancelTokens) {
            cancelTokens[id].cancel(cancelMessage)
        }
    }
    cancelTokens = {};
}