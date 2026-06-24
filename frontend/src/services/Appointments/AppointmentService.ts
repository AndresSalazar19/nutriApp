import { API_URL } from "../../config/api";
import { AuthUser } from "../../hooks/useAuth";
import { tokenStorage } from "../../utils/tokenStorage";

export interface AppointmentRequest {
    patient_id: string;
    nutritionist_id: string;
    scheduled_at: string;
    duration_min?: number;
    modality?: "virtual" | "presencial";
    notes?: string | null;
}

export interface AppointmentResponse {
    id: string;
    patient_id: string;
    nutritionist_id: string;
    scheduled_at: string;
    duration_min: number;
    status: string;
    modality: string;
    meeting_url?: string | null;
    notes?: string | null;
    cancelled_by?: string | null;
    cancelled_at?: string | null;
    patient: any;
    nutritionist: any;
}

function authHeaders() {
    const token = tokenStorage.get() ?? "";
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const msg =
            data?.errors?.[0] ??
            data?.detail ??
            `Error ${response.status}`;
        throw new Error(msg);
    }

    return data;
}

export const AppointmentService = {
    async create(payload: AppointmentRequest): Promise<AppointmentResponse> {
        const res = await fetch(`${API_URL}/appointment`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });

        return handleResponse<AppointmentResponse>(res);
    },

    async list(params: {
        user_id: string;
        role: "patient" | "nutritionist";
    }): Promise<AppointmentResponse[]> {
        const query = new URLSearchParams();
        query.append("user_id", params.user_id);
        query.append("role", params.role);

        const res = await fetch(
            `${API_URL}/appointment?${query.toString()}`,
            {
                method: "GET",
                headers: authHeaders(),
            }
        );

        return handleResponse<AppointmentResponse[]>(res);
    },

    async update(
        appointment_id: string,
        payload: Partial<AppointmentRequest>
    ): Promise<AppointmentResponse> {
        const res = await fetch(
            `${API_URL}/appointment/${appointment_id}`,
            {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify(payload),
            }
        );

        return handleResponse<AppointmentResponse>(res);
    },

    async cancel(
        appointment_id: string,
        params: {
            user_id?: string;
            reason?: string;
        }
    ): Promise<{ messages: string[] }> {
        const query = new URLSearchParams();
        if (params.user_id) query.append("user_id", params.user_id);
        if (params.reason) query.append("reason", params.reason);

        const res = await fetch(
            `${API_URL}/appointment/${appointment_id}?${query.toString()}`,
            {
                method: "DELETE",
                headers: authHeaders(),
            }
        );

        return handleResponse<{ messages: string[] }>(res);
    },

    async getAvailableSlots(params: {
        nutritionist_id: string;
        date: string; // YYYY-MM-DD
    }): Promise<string[]> {
        const query = new URLSearchParams();
        query.append("date", params.date);

        const res = await fetch(
            `${API_URL}/appointment/slots/${params.nutritionist_id}?${query.toString()}`,
            {
                method: "GET",
                headers: authHeaders(),
            }
        );

        return handleResponse<string[]>(res);
    },

};