import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Building2 } from "lucide-react";
import toast from "react-hot-toast";

import { inventoryAPI } from "@/api/inventory.api";

import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import FormModal from "@/components/shared/FormModal";
import Badge from "@/components/ui/Badge";
import { Pencil, Trash2 } from "lucide-react";

export default function Warehouses() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
      phone: "",
      email: "",
      capacity: 0,
      description: "",
      isActive: true,
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => inventoryAPI.getWarehouses().then((res) => res.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (selectedWarehouse) {
        return inventoryAPI.updateWarehouse(selectedWarehouse.id, data);
      }

      return inventoryAPI.createWarehouse(data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });

      toast.success(
        selectedWarehouse
          ? "Warehouse updated successfully"
          : "Warehouse created successfully",
      );

      reset();

      setSelectedWarehouse(null);

      setModalOpen(false);
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Operation failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryAPI.deleteWarehouse,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["warehouses"],
      });

      toast.success("Warehouse deleted");
    },

    onError: () => {
      toast.error("Delete failed");
    },
  });

  const columns = [
    {
      key: "name",
      label: "Warehouse",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary-bg)" }}
          >
            <Building2 size={15} style={{ color: "var(--primary)" }} />
          </div>

          <span>{value}</span>
        </div>
      ),
    },

    {
      key: "code",
      label: "Code",
    },

    {
      key: "location",
      label: "Location",
    },

    {
      key: "capacity",
      label: "Capacity",
    },

    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "success" : "gray"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Warehouses
          </h1>

          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {data?.length || 0} Warehouses
          </p>
        </div>

        <button className="btn btn-primary w-full sm:w-auto justify-center" onClick={() => setModalOpen(true)}>
          <Plus size={14} />
          Add Warehouse
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search Warehouse..."
        values={params}
        onChange={(key, value) =>
          setParams((prev) => ({
            ...prev,
            [key]: value,
          }))
        }
      />

      <div className="mx-3 sm:mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data || []}
          loading={isLoading}
          error={error}
          page={1}
          pageSize={20}
          total={data?.length || 0}
          onPageChange={() => {}}
          mobileCard={(warehouse) => (
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--primary-bg)" }}
              >
                <Building2 size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {warehouse.name}
                  </p>
                  <Badge variant={warehouse.isActive ? "success" : "gray"}>
                    {warehouse.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {warehouse.code || "—"} · {warehouse.location || "No location"}
                </p>
                {warehouse.capacity != null && (
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Capacity: {warehouse.capacity}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setSelectedWarehouse(warehouse);
                      reset(warehouse);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={13} className="mr-1" /> Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-red-500"
                    onClick={() => {
                      if (window.confirm("Delete this warehouse?")) {
                        deleteMutation.mutate(warehouse.id);
                      }
                    }}
                  >
                    <Trash2 size={13} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          actions={(warehouse) => (
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-icon"
                onClick={() => {
                  setSelectedWarehouse(warehouse);
                  reset(warehouse);
                  setModalOpen(true);
                }}
              >
                <Pencil size={15} />
              </button>

              <button
                className="btn btn-icon text-red-500"
                onClick={() => {
                  if (window.confirm("Delete this warehouse?")) {
                    deleteMutation.mutate(warehouse.id);
                  }
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedWarehouse(null);
          reset();
        }}
        title={selectedWarehouse ? "Edit Warehouse" : "Add Warehouse"}
        submitLabel={
          selectedWarehouse ? "Update Warehouse" : "Create Warehouse"
        }
        loading={saveMutation.isPending}
        onSubmit={handleSubmit((formData) => saveMutation.mutate(formData))}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group col-span-2">
            <label className="form-label">Warehouse Name *</label>

            <input
              className="input"
              placeholder="Main Warehouse"
              {...register("name", {
                required: "Warehouse name is required",
              })}
            />

            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>

            <input
              className="input"
              placeholder="Kathmandu"
              {...register("location")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>

            <input className="input" {...register("phone")} />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>

            <input type="email" className="input" {...register("email")} />
          </div>

          <div className="form-group">
            <label className="form-label">Capacity</label>

            <input type="number" className="input" {...register("capacity")} />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>

            <select className="input" {...register("isActive")}>
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Description</label>

            <textarea rows={3} className="input" {...register("description")} />
          </div>
        </div>
      </FormModal>
    </div>
  );
}