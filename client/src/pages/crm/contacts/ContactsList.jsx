import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  UserCheck,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import { contactsAPI } from "@/api/contacts.api";
import { accountsAPI } from "@/api/accounts.api";
import { settingsAPI } from "@/api/settings.api";
import { contactSchema } from "@/lib/validations";
import Avatar from "@/components/ui/Avatar";

// Small icon-prefixed input so every field in this form looks and
// behaves the same, on any screen size.
function IconField({ icon: Icon, label, required, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        {children}
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

const fieldClass = "input pl-9";

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--primary-bg, #e0e7ff)" }}
        >
          <Icon size={15} style={{ color: "var(--primary)" }} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ContactEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      accountId: "",
      assignedToId: "",
      notes: "",
    },
  });

  const { data: contact, isLoading } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => contactsAPI.getById(id).then((res) => res.data),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts-dropdown"],
    queryFn: () =>
      accountsAPI.getAll({ page: 1, limit: 1000 }).then((res) => res.data),
  });

  const accounts = accountsData?.accounts || [];

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      settingsAPI.getUsers({ page: 1, limit: 1000 }).then((res) => res.data),
  });

  const users = usersData?.users || usersData || [];

  useEffect(() => {
    if (!contact) return;
    reset({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      jobTitle: contact.jobTitle || "",
      department: contact.department || "",
      accountId: contact.accountId || "",
      assignedToId: contact.assignedToId || "",
      notes: contact.notes || "",
    });
  }, [contact, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => contactsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
      toast.success("Contact updated successfully");
      navigate("/crm/contacts");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update contact");
    },
  });

  const liveFirst = watch("firstName");
  const liveLast = watch("lastName");
  const liveJob = watch("jobTitle");
  const liveDept = watch("department");
  const previewName = `${liveFirst || contact?.firstName || ""} ${liveLast || contact?.lastName || ""}`.trim();
  const accountName = accounts.find((a) => a.id === watch("accountId"))?.name;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 w-40 rounded-lg mb-6" style={{ background: "var(--border)" }} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="h-56 rounded-2xl lg:col-span-1" style={{ background: "var(--border)" }} />
          <div className="h-96 rounded-2xl lg:col-span-2" style={{ background: "var(--border)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className="btn btn-secondary btn-icon shrink-0"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: "var(--text-primary)" }}>
            Edit Contact
          </h1>
          <p className="text-[12px] truncate" style={{ color: "var(--text-muted)" }}>
            Update {previewName || "contact"}&rsquo;s information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Live preview card */}
          <div className="lg:col-span-1">
            <div className="card p-5 sm:p-6 lg:sticky lg:top-6 flex flex-col items-center text-center">
              <Avatar name={previewName || "?"} size="xl" className="mb-3 text-2xl" />
              <p className="text-[15px] font-semibold truncate max-w-full" style={{ color: "var(--text-primary)" }}>
                {previewName || "Unnamed contact"}
              </p>
              <p className="text-[12px] mb-4 truncate max-w-full" style={{ color: "var(--text-muted)" }}>
                {liveJob || "No job title"}
              </p>

              <div className="w-full flex flex-col gap-2.5 text-left">
                {liveDept && (
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    <Building2 size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="truncate">{liveDept}</span>
                  </div>
                )}
                {accountName && (
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    <Briefcase size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="truncate">{accountName}</span>
                  </div>
                )}
                {watch("email") && (
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    <Mail size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="truncate">{watch("email")}</span>
                  </div>
                )}
                {watch("phone") && (
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    <Phone size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="truncate">{watch("phone")}</span>
                  </div>
                )}
              </div>

              {isDirty && (
                <span
                  className="mt-4 text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "var(--warning-bg, #fef3c7)", color: "var(--warning, #b45309)" }}
                >
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          {/* Form sections */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            <SectionCard icon={User} title="Personal Information" subtitle="Name and contact details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IconField icon={User} label="First Name" required error={errors.firstName?.message}>
                  <input className={fieldClass} placeholder="John" {...register("firstName")} />
                </IconField>

                <IconField icon={User} label="Last Name" required error={errors.lastName?.message}>
                  <input className={fieldClass} placeholder="Doe" {...register("lastName")} />
                </IconField>

                <IconField icon={Mail} label="Email" error={errors.email?.message}>
                  <input type="email" className={fieldClass} placeholder="john@example.com" {...register("email")} />
                </IconField>

                <IconField icon={Phone} label="Phone">
                  <input className={fieldClass} placeholder="+977 98XXXXXXXX" {...register("phone")} />
                </IconField>
              </div>
            </SectionCard>

            <SectionCard icon={Briefcase} title="Work Details" subtitle="Role, department and ownership">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IconField icon={Briefcase} label="Job Title">
                  <input className={fieldClass} placeholder="e.g. Sales Manager" {...register("jobTitle")} />
                </IconField>

                <IconField icon={Building2} label="Department">
                  <select className={fieldClass} {...register("department")}>
                    <option value="">Select Department</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Technology">Technology</option>
                    <option value="Operations">Operations</option>
                    <option value="Support">Support</option>
                    <option value="Management">Management</option>
                    <option value="Other">Other</option>
                  </select>
                </IconField>

                <div className="sm:col-span-2">
                  <IconField icon={Briefcase} label="Account">
                    <select className={fieldClass} {...register("accountId")}>
                      <option value="">Select Account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </IconField>
                </div>

                <div className="sm:col-span-2">
                  <IconField icon={UserCheck} label="Assigned To">
                    <select className={fieldClass} {...register("assignedToId")}>
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </IconField>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={FileText} title="Notes" subtitle="Anything else worth remembering">
              <textarea
                rows={4}
                className="input"
                placeholder="Add a note about this contact..."
                {...register("notes")}
              />
            </SectionCard>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary w-full sm:w-auto justify-center"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto justify-center"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}