import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { Plus } from "lucide-react";

import { inventoryAPI } from "@/api/inventory.api";

import FormModal from "@/components/shared/FormModal";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import Badge from "@/components/ui/Badge";

export default function StockAdjustments() {
  const [params, setParams] = useState({
    search: "",
    type: "",
  });

  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      itemId: "",
      warehouseId: "",
      type: "Increase",
      quantity: 1,
      reason: "Manual Correction",
      remarks: "",
    },
  });

  const {
    data: adjustments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stock-adjustments", params],
    queryFn: () =>
      inventoryAPI.getAdjustments(params).then((res) => res.data),
  });

  const { data: items = [] } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: () =>
      inventoryAPI.getItems().then((res) => res.data.items || []),
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () =>
      inventoryAPI.getWarehouses().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: inventoryAPI.createAdjustment,

    onSuccess: () => {
      toast.success("Stock adjustment created successfully");

      queryClient.invalidateQueries({
        queryKey: ["stock-adjustments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["inventory-items"],
      });

      reset();

      setModalOpen(false);
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to create stock adjustment"
      );
    },
  });

    const columns = [
    {
      key: "adjustmentNo",
      label: "Adjustment No",
    },

    {
      key: "item",
      label: "Item",
      render: (_, row) => row.item?.name || "—",
    },

    {
      key: "warehouse",
      label: "Warehouse",
      render: (_, row) => row.warehouse?.name || "—",
    },

    {
      key: "type",
      label: "Type",
      render: (value) => (
        <Badge
          variant={value === "Increase" ? "success" : "danger"}
        >
          {value}
        </Badge>
      ),
    },

    {
      key: "quantity",
      label: "Quantity",
    },

    {
      key: "reason",
      label: "Reason",
    },

    {
      key: "createdAt",
      label: "Date",
      render: (value) =>
        value
          ? new Date(value).toLocaleDateString()
          : "—",
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
            Stock Adjustments
          </h1>

          <p
            className="text-[12px]"
            style={{ color: "var(--text-muted)" }}
          >
            {adjustments.length} Adjustments
          </p>
        </div>

        <button
          className="btn btn-primary w-full sm:w-auto justify-center"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={15} />
          New Adjustment
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search Adjustment..."
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
          data={adjustments}
          loading={isLoading}
          error={error}
          page={1}
          total={adjustments.length}
          pageSize={20}
          onPageChange={() => {}}
          emptyTitle="No Adjustments"
          emptyDescription="Create your first stock adjustment."
          mobileCard={(row) => (
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {row.adjustmentNo}
                </p>
                <Badge variant={row.type === "Increase" ? "success" : "danger"}>{row.type}</Badge>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {row.item?.name || "—"} · {row.warehouse?.name || "—"}
              </p>
              <div className="flex items-center justify-between mt-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span>{row.reason || "—"} · Qty {row.quantity}</span>
                <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          )}
        />
      </div>

            <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          reset();
        }}
        title="New Stock Adjustment"
        submitLabel="Save Adjustment"
        loading={createMutation.isPending}
        onSubmit={handleSubmit((formData) =>
          createMutation.mutate(formData)
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group col-span-2">
            <label className="form-label">Inventory Item *</label>

            <select
              className="input"
              {...register("itemId", {
                required: "Please select an item",
              })}
            >
              <option value="">Select Item</option>

              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse *</label>

            <select
              className="input"
              {...register("warehouseId", {
                required: "Please select a warehouse",
              })}
            >
              <option value="">Select Warehouse</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code} - {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Adjustment Type</label>

            <select
              className="input"
              {...register("type")}
            >
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>

            <input
              type="number"
              min="1"
              className="input"
              {...register("quantity", {
                required: true,
                valueAsNumber: true,
                min: 1,
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>

            <select
              className="input"
              {...register("reason")}
            >
              <option value="Manual Correction">Manual Correction</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
              <option value="Expired">Expired</option>
              <option value="Returned">Returned</option>
              <option value="Initial Stock">Initial Stock</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Remarks</label>

            <textarea
              rows={3}
              className="input"
              {...register("remarks")}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}