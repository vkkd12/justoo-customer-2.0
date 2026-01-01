import { API_BASE_URL } from "../config";

async function readJsonSafely(response) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    try {
        return await response.json();
    } catch {
        return null;
    }
}

export class ApiError extends Error {
    constructor(message, { status, code } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

function buildUrl(path, query) {
    if (!query || typeof query !== "object") return `${API_BASE_URL}${path}`;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        params.set(String(key), String(value));
    }
    const qs = params.toString();
    return qs ? `${API_BASE_URL}${path}?${qs}` : `${API_BASE_URL}${path}`;
}

async function apiRequest(method, path, { token, body, query } = {}) {
    const url = buildUrl(path, query);

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const init = {
        method,
        headers,
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body ?? {});
    }

    let response;
    try {
        response = await fetch(url, init);
    } catch {
        throw new ApiError("NETWORK_ERROR");
    }

    if (response.ok) {
        // Many routes return JSON; some return 204.
        const data = await readJsonSafely(response);
        return data;
    }

    const data = await readJsonSafely(response);
    const code = data?.error || "REQUEST_FAILED";
    throw new ApiError(code, { status: response.status, code });
}

export async function apiGet(path, { token, query } = {}) {
    return apiRequest("GET", path, { token, query });
}

export async function apiPatch(path, { token, body } = {}) {
    return apiRequest("PATCH", path, { token, body });
}

export async function apiPost(path, { token, body } = {}) {
    return apiRequest("POST", path, { token, body });
}

export async function apiDelete(path, { token } = {}) {
    return apiRequest("DELETE", path, { token });
}
