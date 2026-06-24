import { useEffect, useState } from "react";
import { AppointmentService, AppointmentResponse } from "../services/Appointments/AppointmentService";
import { useAuth } from "./useAuth";

export function useAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchAppointments() {
        if (!user?.userId) return;

        try {
            setLoading(true);
            const data = await AppointmentService.list({
                user_id: user.userId,
                role: "nutritionist", // o "patient" según contexto
            });

            setAppointments(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAppointments();
    }, [user?.userId]);


    return { appointments, setAppointments, loading, error, refetch: fetchAppointments };
}