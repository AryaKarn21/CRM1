import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Building2,
  UserCheck,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EmployeeSummary({ user }) {
  const employee = user?.employee;

  const items = [
    {
      icon: BadgeCheck,
      label: "Employee ID",
      value: employee?.employeeId || "Not Assigned",
    },
    {
      icon: Building2,
      label: "Department",
      value: employee?.department || "-",
    },
    {
      icon: Briefcase,
      label: "Designation",
      value: employee?.designation || "-",
    },
    {
      icon: Calendar,
      label: "Joining Date",
      value: employee?.joinDate
        ? new Date(employee.joinDate).toLocaleDateString()
        : "-",
    },
    {
      icon: UserCheck,
      label: "Reporting Manager",
      value: employee?.reportingManager?.name || "-",
    },
  ];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Briefcase
            size={18}
            style={{ color: "var(--primary)" }}
          />

          <h2
            className="text-[16px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Employee Summary
          </h2>
        </div>

        <p
          className="mt-1 text-[13px]"
          style={{ color: "var(--text-muted)" }}
        >
          Overview of your employee information.
        </p>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="space-y-4">
          {items.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--surface-2)",
                }}
              >
                <Icon
                  size={18}
                  style={{ color: "var(--text-secondary)" }}
                />
              </div>

              <div className="min-w-0">
                <p
                  className="text-[12px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </p>

                <p
                  className="text-[14px] font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-6 pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
          >
            <span>View Full Employee Profile</span>

            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}