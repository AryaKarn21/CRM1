import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { employeesAPI } from "@/api/employees.api";
import { shiftsAPI } from "@/api/shifts.api";

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
    empid: "",
    shiftId: "",
  });

  const { data: employee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeesAPI.getById(id).then((res) => res.data),
  });

  const { data: shiftData } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => shiftsAPI.getAll().then((res) => res.data),
  });
  const shifts = shiftData?.shifts || shiftData || [];

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.designation || "",
        salary: employee.salary || "",
        empid: employee.employeeId || "",
        shiftId: employee.shiftId || employee.shift?.id || "",
      });
    }
  }, [employee]);

  const updateMutation = useMutation({
    mutationFn: (data) => employeesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      alert("Employee Updated Successfully");
      navigate(`/hr/employees/${id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8 text-slate-800">
      {/* Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-150 rounded-full text-slate-500 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          {/* Avatar Initial */}
          <div className="w-12 h-12 rounded-full bg-[#fef3c7] text-[#d97706] font-semibold flex items-center justify-center text-lg shadow-sm border border-amber-100 shrink-0">
            {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : "E"}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 break-words">
                {formData.firstName || "Edit"} {formData.lastName || "Employee"}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                active
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5 font-medium truncate">
              {formData.designation || "Designation"} — {formData.department || "Department"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all w-full sm:w-auto"
        >
          Cancel
        </button>
      </div>

      {/* Main Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        
        {/* Form Card */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab Mock-line mimicking the screenshot view */}
          <div className="border-b border-slate-100 px-4 sm:px-6 pt-4 flex gap-8 overflow-x-auto">
            <span className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-3 cursor-pointer whitespace-nowrap">
              Edit Details
            </span>
          </div>

          <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-medium"
                placeholder="e.g. Arya"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-medium"
                placeholder="e.g. Karn"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-medium"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-medium"
                placeholder="+977 XXXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-medium"
                placeholder="e.g. Engineering"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Designation</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-medium"
                placeholder="e.g. Software Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Shift</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-medium"
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
              >
                <option value="">No shift assigned</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.startTime && s.endTime ? ` (${s.startTime}–${s.endTime})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Salary Amount</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 transition-all text-sm font-semibold text-blue-600"
                placeholder="e.g. NPR 190,000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full md:w-auto px-6 py-3 bg-[#2563eb] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] shadow-md shadow-blue-200 transition-all disabled:opacity-70"
              >
                {updateMutation.isPending ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Info Sidebar Block */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm w-full">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Info Summary</h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Employee ID</span>
              <span className="text-sm font-bold text-slate-800">{formData.empid || "not available"}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Gross Salary Info</span>
              <span className="text-sm font-bold text-blue-600">{formData.salary || "NPR 0.00"}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block">Shift</span>
              <span className="text-sm font-bold text-slate-800">
                {shifts.find((s) => s.id === formData.shiftId)?.name || "Not assigned"}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-50 text-[11px] text-slate-400 italic">
              Fields modified here will update across CRM modules dynamically.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}