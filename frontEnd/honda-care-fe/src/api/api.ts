import axiosClient from "./axiosClient";

export type Branch = { _id: string; name: string; address?: string; isActive?: boolean };
export type Service = {
  _id: string;
  name: string;
  price?: number;
  branches?: Array<{ branch: Branch; isActive?: boolean }>;
};
export type AppointmentPayload = {
  service_id: string;
  branch_id: string;
  dateTime: string;
  customer_note?: string;
};
export type Appointment = {
  _id: string;
  dateTime: string;
  status: "Pending" | "Approved" | "Progress" | "Completed" | "Cancelled";
  customer_note?: string | null;
  service_id?: { _id: string; name: string; price?: number };
  branch_id?: { _id: string; name: string; address?: string };
};

export const catalogApi = {
  async getBranches(): Promise<Branch[]> {
    const response: any = await axiosClient.get("/api/branches/get-all");
    return (response.list_branch || []).filter((branch: Branch) => branch.isActive !== false);
  },
  async getServices(): Promise<Service[]> {
    const response: any = await axiosClient.get("/api/services/list-services");
    return response.list_services || [];
  },
};

export const appointmentApi = {
  create: (payload: AppointmentPayload) =>
    axiosClient.post("/api/appointments/customer", payload),
  async getMine(customerId: string): Promise<Appointment[]> {
    const response: any = await axiosClient.get(`/api/appointments/list/${customerId}`);
    return response.appointments || [];
  },
  cancel: (appointmentId: string) =>
    axiosClient.patch(`/api/appointments/${appointmentId}`, { status: "Cancelled" }),
};