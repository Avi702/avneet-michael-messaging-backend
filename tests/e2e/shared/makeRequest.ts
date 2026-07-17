
export const API_BASE = `/api/v1/`;

export async function makeRequest(baseUrl: string, endpoint: string, body: any = {}, accessToken: string | undefined = undefined): Promise<Response> {
    const headers: any = {
        "Content-Type": "application/json"
    };
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return await fetch(`${baseUrl}${API_BASE}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    });
}
