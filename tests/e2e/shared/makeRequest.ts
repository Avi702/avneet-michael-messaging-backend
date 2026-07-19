
export const API_BASE = `/api/v1/`;

export async function makeRequest(baseUrl: string, endpoint: string, body: any = {}, accessToken: string | null = null, contentType: string | null = "application/json"): Promise<Response> {
    const headers: any = {};
    if (contentType !== null) {
        headers["Content-Type"] = contentType;
    }
    if (accessToken !== null) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return await fetch(`${baseUrl}${API_BASE}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: (body instanceof FormData) ? body : JSON.stringify(body),
    });
}
