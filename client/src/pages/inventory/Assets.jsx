import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Laptop } from "lucide-react";


import { inventoryAPI } from "@/api/inventory.api";
import { employeesAPI } from "@/api/employees.api";

import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import FormModal from "@/components/shared/FormModal";
import Badge from "@/components/ui/Badge";

const STATUS = [
  "available",
  "assigned",
  "maintenance",
  "lost",
  "damaged",
  "retired",
];

const CATEGORIES = [
  "Laptop",
  "Desktop",
  "Printer",
  "Furniture",
  "Vehicle",
  "Networking",
  "Mobile",
  "Monitor",
  "Server",
  "Other",
];

export default function Assets() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    status: "",
  });

  const [modalOpen, setModalOpen] = useState(false);

  const [editingAsset, setEditingAsset] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      assetCode: "",
      name: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
      warehouseId: "",
      purchaseDate: "",
      purchasePrice: 0,
      warrantyExpiry: "",
      status: "available",
      description: "",
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["assets", params],
    queryFn: () => inventoryAPI.getAssets(params).then((r) => r.data),
  });
  const { data: employeesResponse } = useQuery({
    queryKey: ["employees-dropdown"],
    queryFn: () =>
      employeesAPI
        .getAll({
          page: 1,
          limit: 500,
        })
        .then((res) => res.data),
  });

  const employees = employeesResponse?.employees || [];

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => inventoryAPI.getWarehouses().then((r) => r.data),
  });

  const warehouses = Array.isArray(warehousesData) ? warehousesData : [];

  const createMutation = useMutation({
    mutationFn: inventoryAPI.createAsset,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assets"],
      });

      toast.success("Asset created successfully");

      reset();

      setModalOpen(false);
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create asset");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryAPI.updateAsset(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assets"],
      });

      toast.success("Asset updated successfully");

      setModalOpen(false);

      setEditingAsset(null);

      reset();
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update asset");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryAPI.deleteAsset,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assets"],
      });

      toast.success("Asset deleted successfully");
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete asset");
    },
  });

  const columns = [
    {
      key: "name",
      label: "Asset",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary-bg)" }}
          >
            <Laptop size={15} style={{ color: "var(--primary)" }} />
          </div>

          <div>
            <p
              className="text-[13px] font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {value}
            </p>

            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {row.assetCode || "—"}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "category",
      label: "Category",
      render: (value) => value || "—",
    },

    {
      key: "brand",
      label: "Brand",
      render: (value) => value || "—",
    },

    {
      key: "model",
      label: "Model",
      render: (value) => value || "—",
    },

    {
      key: "purchasePrice",
      label: "Price",
      render: (value) => (value ? `NPR ${value}` : "—"),
    },

    {
      key: "warehouse",
      label: "Warehouse",
      render: (value) => value?.name || "—",
    },

    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "available"
              ? "success"
              : value === "maintenance"
                ? "warning"
                : value === "retired"
                  ? "gray"
                  : "primary"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "assignedTo",
      label: "Assigned To",

      render: (_, row) => {
        if (!row.assignedTo) {
          return <span className="text-gray-400">Not Assigned</span>;
        }

        return (
          <div>
            <p className="font-medium">
              {row.assignedTo.firstName} {row.assignedTo.lastName}
            </p>

            <p className="text-xs text-gray-500">{row.assignedTo.employeeId}</p>
          </div>
        );
      },
    },

    {
      key: "id",
      label: "Actions",
      render: (id, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setEditingAsset(row);

              reset({
                assetCode: row.assetCode || "",
                name: row.name || "",
                category: row.category || "",
                brand: row.brand || "",
                model: row.model || "",
                serialNumber: row.serialNumber || "",
                warehouseId: row.warehouseId || "",
                purchaseDate: row.purchaseDate || "",
                purchasePrice: row.purchasePrice || 0,
                warrantyExpiry: row.warrantyExpiry || "",
                status: row.status || "available",
                description: row.description || "",
              });

              setModalOpen(true);
            }}
          >
            Edit
          </button>

          <button
            className="btn btn-ghost btn-sm text-red-500"
            onClick={() => {
              if (window.confirm("Delete this asset?")) {
                deleteMutation.mutate(id);
              }
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Assets
          </h1>

          <p
            className="text-[12px] mt-1"
            style={{
              color: "var(--text-muted)",
            }}
          >
            {data?.length || 0} Assets
          </p>
        </div>

        <button
          className="btn btn-primary w-full sm:w-auto justify-center"
          onClick={() => {
            setEditingAsset(null);
            reset();
            setModalOpen(true);
          }}
        >
          <Plus size={14} />
          Add Asset
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search Assets..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: STATUS.map((s) => ({
              label: s,
              value: s,
            })),
          },
        ]}
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
          page={params.page}
          pageSize={params.limit}
          total={data?.length || 0}
          onPageChange={(page) =>
            setParams((prev) => ({
              ...prev,
              page,
            }))
          }
          emptyTitle="No Assets"
          emptyDescription="Create your first asset."
          mobileCard={(row) => (
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--primary-bg)" }}
              >
                <Laptop size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {row.name}
                  </p>
                  <Badge
                    variant={
                      row.status === "available"
                        ? "success"
                        : row.status === "maintenance"
                          ? "warning"
                          : row.status === "retired"
                            ? "gray"
                            : "primary"
                    }
                  >
                    {row.status}
                  </Badge>
                </div>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {row.assetCode || "—"} · {row.category || "Uncategorized"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {row.brand || "—"} {row.model ? `· ${row.model}` : ""}
                  {row.purchasePrice ? ` · NPR ${row.purchasePrice}` : ""}
                </p>
                {row.assignedTo && (
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    Assigned to {row.assignedTo.firstName} {row.assignedTo.lastName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setEditingAsset(row);
                      reset({
                        assetCode: row.assetCode || "",
                        name: row.name || "",
                        category: row.category || "",
                        brand: row.brand || "",
                        model: row.model || "",
                        serialNumber: row.serialNumber || "",
                        warehouseId: row.warehouseId || "",
                        purchaseDate: row.purchaseDate || "",
                        purchasePrice: row.purchasePrice || 0,
                        warrantyExpiry: row.warrantyExpiry || "",
                        status: row.status || "available",
                        description: row.description || "",
                      });
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-red-500"
                    onClick={() => {
                      if (window.confirm("Delete this asset?")) {
                        deleteMutation.mutate(row.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAsset(null);
          reset();
        }}
        title={editingAsset ? "Edit Asset" : "Add Asset"}
        submitLabel={editingAsset ? "Update Asset" : "Create Asset"}
        loading={createMutation.isPending || updateMutation.isPending}
        size="lg"
        onSubmit={handleSubmit((formData) => {
          if (editingAsset) {
            updateMutation.mutate({
              id: editingAsset.id,
              data: formData,
            });
          } else {
            createMutation.mutate(formData);
          }
        })}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group col-span-2">
            <label className="form-label">Asset Name *</label>

            <input
              className="input"
              placeholder="Dell Latitude 5440"
              {...register("name", {
                required: "Asset Name is required",
              })}
            />

            {errors.name && (
              <p className="text-[11px] text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Asset Code</label>

            <input
              className="input"
              placeholder="AST-001"
              {...register("assetCode")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>

            <select className="input" {...register("category")}>
              <option value="">Select Category</option>

              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Brand</label>

            <input
              className="input"
              placeholder="Dell"
              {...register("brand")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Warehouse */}
            <div className="form-group">
              <label className="form-label">Warehouse</label>

              <select className="input" {...register("warehouseId")}>
                <option value="">Select Warehouse</option>

                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Employee */}
            <div className="form-group">
              <label className="form-label">Assigned Employee</label>

              <select className="input" {...register("assignedToId")}>
                <option value="">Not Assigned</option>

                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Model</label>

            <input
              className="input"
              placeholder="Latitude 5440"
              {...register("model")}
            />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Serial Number</label>

            <input
              className="input"
              placeholder="SN-123456789"
              {...register("serialNumber")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse</label>

            <select className="input" {...register("warehouseId")}>
              <option value="">Select Warehouse</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Date</label>

            <input
              type="date"
              className="input"
              {...register("purchaseDate")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Price</label>

            <input
              type="number"
              className="input"
              placeholder="50000"
              {...register("purchasePrice")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty Expiry</label>

            <input
              type="date"
              className="input"
              {...register("warrantyExpiry")}
            />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Status</label>

            <select className="input" {...register("status")}>
              {STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Description</label>

            <textarea
              rows={4}
              className="input"
              placeholder="Additional information..."
              {...register("description")}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}