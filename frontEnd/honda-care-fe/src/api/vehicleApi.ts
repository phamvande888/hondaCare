import axiosClient from "./axiosClient";

export type VehicleSystem = {
  _id: string;
  name: string;
  year?: number;
  isActive?: boolean;
  model?: { _id: string; name: string };
};

export type CustomerVehicle = {
  _id: string;
  licensePlate: string;
  color: string;
  mileage: number;
  lastMaintenanceDate?: string | null;
  VehiclesSystemId?: VehicleSystem;
};

export type CreateCustomerVehiclePayload = {
  licensePlate: string;
  VehiclesSystemId: string;
  color: string;
  mileage: number;
};

export const vehicleApi = {
  async getSystems(): Promise<VehicleSystem[]> {
    const response: any = await axiosClient.get("/api/vehicle-systems");
    return (response.listData || []).filter((item: VehicleSystem) => item.isActive !== false);
  },
  async getMine(): Promise<CustomerVehicle[]> {
    const response: any = await axiosClient.get("/api/vehicle-customers/mine");
    return response.data || [];
  },
  async createMine(payload: CreateCustomerVehiclePayload): Promise<CustomerVehicle> {
    const response: any = await axiosClient.post("/api/vehicle-customers/mine", payload);
    return response.data;
  },
};