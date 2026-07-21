import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package } from "lucide-react";
import { inventoryAPI } from "@/api/inventory.api";
import DataTable from "@/components/shared/DataTable";
import FilterBar from "@/components/shared/FilterBar";
import FormModal from "@/components/shared/FormModal";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Supplies",
  "Equipment",
  "Raw Materials",
  "Finished Goods",
  "Other",
];
const UNITS = ["pcs", "kg", "litre", "box", "set", "pair", "metre"];
const METHODS = ["FIFO", "LIFO", "Weighted Average"];

export default function ItemsList() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: "",
    category: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["inventory-items", params],
    queryFn: () => inventoryAPI.getItems(params).then((r) => r.data),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => inventoryAPI.getWarehouses().then((r) => r.data),
  });
  const warehouses = Array.isArray(warehousesData) ? warehousesData : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      unit: "pcs",
      quantity: 0,
      unitPrice: 0,
      reorderPoint: 0,
      valuationMethod: "FIFO",
      warehouseId: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: inventoryAPI.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      setModalOpen(false);
      reset();
      toast.success("Item added to inventory");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to add item"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryAPI.updateItem(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["inventory-items"],
      });

      toast.success("Item updated successfully");

      setModalOpen(false);
      setEditingItem(null);
      reset();
    },

    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update item"),
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryAPI.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item deleted");
    },
  });

  const columns = [
    {
      key: "name",
      label: "Item",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--warning-bg)" }}
          >
            <Package size={14} style={{ color: "var(--warning)" }} />
          </div>
          <div>
            <p
              className="text-[13px] font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {val}
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {row.sku || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      label: "Item Code",
      render: (value) => (
        <span className="font-mono font-semibold text-blue-500">{value}</span>
      ), 
    },

    { key: "category", label: "Category", render: (val) => val || "—" },
    {
      key: "quantity",
      label: "In Stock",
      sortable: true,
      render: (val, row) => (
        <span
          className={
            val <= (row.reorderPoint || 0) ? "text-red-500 font-semibold" : ""
          }
        >
          {val ?? 0} {row.unit || "pcs"}
          {val <= (row.reorderPoint || 0) && (
            <span className="ml-1 text-[10px]">⚠ Low</span>
          )}
        </span>
      ),
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      sortable: true,
      render: (val) => formatCurrency(val),
    },
    {
      key: "valuationMethod",
      label: "Method",
      render: (val) => <Badge variant="gray">{val || "FIFO"}</Badge>,
    },
    { key: "warehouse", label: "Warehouse", render: (val) => val?.name || "—" },
    {
      key: "id",
      label: "",
      render: (id, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setEditingItem(row);

              reset({
                name: row.name,
                sku: row.sku,
                category: row.category,
                quantity: row.quantity,
                unit: row.unit,
                unitPrice: row.unitPrice,
                reorderPoint: row.reorderPoint,
                valuationMethod: row.valuationMethod,
                warehouseId: row.warehouseId || "",
                description: row.description,
              });

              setModalOpen(true);
            }}
          >
            Edit
          </button>

          <button
            className="btn btn-ghost btn-sm text-red-500"
            onClick={() => {
              if (confirm("Delete item?")) {
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
            style={{ color: "var(--text-primary)" }}
          >
            Inventory
          </h1>
          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {data?.total ?? 0} items
          </p>
        </div>
        <button
          className="btn btn-primary w-full sm:w-auto justify-center"
          onClick={() => {
            setEditingItem(null);
            reset();
            setModalOpen(true);
          }}
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Search by name, SKU..."
        filters={[
          {
            key: "category",
            label: "Category",
            options: CATEGORIES.map((v) => ({ label: v, value: v })),
          },
        ]}
        values={params}
        onChange={(k, v) => setParams((p) => ({ ...p, [k]: v, page: 1 }))}
      />

      <div className="mx-3 sm:mx-6 mb-6 card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.items || []}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          loading={isLoading}
          error={error}
          onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          emptyTitle="No inventory items"
          emptyDescription="Add your first item to start tracking inventory"
          mobileCard={(row) => (
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--warning-bg)" }}
              >
                <Package size={15} style={{ color: "var(--warning)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {row.name}
                  </p>
                  <Badge variant="gray">{row.valuationMethod || "FIFO"}</Badge>
                </div>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {row.sku || "—"} · {row.category || "Uncategorized"}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span
                    className={`text-[12px] font-semibold ${row.quantity <= (row.reorderPoint || 0) ? "text-red-500" : ""}`}
                    style={row.quantity > (row.reorderPoint || 0) ? { color: "var(--text-primary)" } : undefined}
                  >
                    {row.quantity ?? 0} {row.unit || "pcs"}
                    {row.quantity <= (row.reorderPoint || 0) && " ⚠ Low"}
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(row.unitPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setEditingItem(row);
                      reset({
                        name: row.name,
                        sku: row.sku,
                        category: row.category,
                        quantity: row.quantity,
                        unit: row.unit,
                        unitPrice: row.unitPrice,
                        reorderPoint: row.reorderPoint,
                        valuationMethod: row.valuationMethod,
                        warehouseId: row.warehouseId || "",
                        description: row.description,
                      });
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-red-500"
                    onClick={() => {
                      if (confirm("Delete item?")) deleteMutation.mutate(row.id);
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
          reset();
        }}
        title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
        onSubmit={handleSubmit((d) => {
          if (editingItem) {
            updateMutation.mutate({
              id: editingItem.id,
              data: d,
            });
          } else {
            createMutation.mutate(d);
          }
        })}
        loading={createMutation.isPending || updateMutation.isPending}
        submitLabel={editingItem ? "Update Item" : "Add Item"}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="form-label">Item Name *</label>
              <input
                className="input"
                placeholder="e.g. Office Chair"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input
                className="input"
                placeholder="e.g. CHR-001"
                {...register("sku")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input" {...register("category")}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                className="input"
                type="number"
                min="0"
                {...register("quantity")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="input" {...register("unit")}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (NPR)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                {...register("unitPrice")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Point</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="Alert when stock falls below"
                {...register("reorderPoint")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valuation Method</label>
              <select className="input" {...register("valuationMethod")}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Warehouse</label>
              <select className="input" {...register("warehouseId")}>
                <option value="">No warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Optional notes about this item..."
              {...register("description")}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}