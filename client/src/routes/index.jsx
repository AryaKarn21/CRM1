import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";
// ── Eagerly loaded (always needed) ──────────────────────────
import Login from "@/pages/auth/Login";
import NotFound from "@/pages/errors/NotFound";
import Unauthorized from "@/pages/errors/Unauthorized";
//import Login from '@/pages/auth/Login'
import Calendar from "@/pages/calendar/Calendar";
// ── Lazy loaded (only when route is visited) ─────────────────
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const LeadsList = lazy(() => import("@/pages/crm/leads/LeadsList"));
const LeadDetail = lazy(() => import("@/pages/crm/leads/LeadDetail"));
const LeadKanban = lazy(() => import("@/pages/crm/leads/LeadKanban"));
const AccountsList = lazy(() => import("@/pages/crm/accounts/AccountsList"));
const AccountDetail = lazy(() => import("@/pages/crm/accounts/AccountDetail"));
const AccountEdit = lazy(() => import("@/pages/crm/accounts/AccountEdit"));
const LeadEdit = lazy(() => import("@/pages/crm/leads/LeadEdit"));
const ContactsList = lazy(() => import("@/pages/crm/contacts/ContactsList"));
const OpportunitiesList = lazy(
  () => import("@/pages/crm/opportunities/OpportunitiesList"),
);
const OpportunityKanban = lazy(
  () => import("@/pages/crm/opportunities/OpportunityKanban"),
);
// const OpportunityKanban    = lazy(() => import('@/pages/crm/opportunities/OpportunityKanban'))
const OpportunityDetail = lazy(
  () => import("@/pages/crm/opportunities/OpportunityDetail"),
);
const EmployeesList = lazy(() => import("@/pages/hr/employees/EmployeesList"));
const EmployeeDetail = lazy(
  () => import("@/pages/hr/employees/EmployeeDetail"),
);
const EmployeeEdit = lazy(() => import("@/pages/hr/employees/EmployeeEdit"));
const AttendanceLogs = lazy(
  () => import("@/pages/hr/attendance/AttendanceLogs"),
);
const LeaveRequests = lazy(() => import("@/pages/hr/leaves/LeaveRequests"));
const PayrollRuns = lazy(() => import("@/pages/hr/payroll/PayrollRuns"));
const FinanceOverview = lazy(
  () => import("@/pages/finance/overview/FinanceOverview"),
);
const ExpensesList = lazy(
  () => import("@/pages/finance/expenses/ExpensesList"),
);
const GeneralLedger = lazy(
  () => import("@/pages/finance/ledger/GeneralLedger"),
);
const ItemsList = lazy(() => import("@/pages/inventory/ItemsList"));
const PurchaseOrders = lazy(() => import("@/pages/procurement/PurchaseOrders"));
const PurchaseDetails = lazy(
  () => import("@/pages/procurement/PurchaseDetails"),
);
const PurchaseEdit = lazy(() => import("@/pages/procurement/PurchaseEdit"));
const ProjectsList = lazy(() => import("@/pages/projects/ProjectsList"));
const ProjectDetail = lazy(() => import("@/pages/projects/ProjectDetail"));
const ProjectEdit = lazy(() => import("@/pages/projects/ProjectEdit"));
const TicketsList = lazy(() => import("@/pages/support/TicketsList"));
const SupportEdit = lazy(() => import("@/pages/support/SupportEdit"));
const SupportDetail = lazy(() => import("@/pages/support/SupportDetail"));
const Analytics = lazy(() => import("@/pages/reports/Analytics"));
const Settings = lazy(() => import("@/pages/settings/Settings"));
const UserDetails = lazy(() => import("@/pages/settings/users/UserDetails"));
const UserEdit = lazy(() => import("@/pages/settings/users/UserEdit"));
const Register = lazy(() => import("@/pages/auth/Register"));
const VerifyOTP = lazy(() => import("@/pages/auth/VerifyOTP"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
// ── Suspense wrapper ─────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}

function S({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  {
    path: "/register",
    element: (
      <S>
        <Register />
      </S>
    ),
  },

  {
    path: "/verify-otp",
    element: (
      <S>
        <VerifyOTP />
      </S>
    ),
  },

  {
    path: "/forgot-password",
    element: (
      <S>
        <ForgotPassword />
      </S>
    ),
  },

  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/reset-password",
    element: (
      <S>
        <ResetPassword />
      </S>
    ),
  },

  { path: "/unauthorized", element: <Unauthorized /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "/",
            element: (
              <S>
                <Dashboard />
              </S>
            ),
          },

          // CRM
          {
            path: "/crm/leads",
            element: (
              <S>
                <LeadsList />
              </S>
            ),
          },
          {
            path: "/crm/leads/kanban",
            element: (
              <S>
                <LeadKanban />
              </S>
            ),
          },
          {
            path: "/crm/leads/:id",
            element: (
              <S>
                <LeadDetail />
              </S>
            ),
          },
          {
            path: "/crm/leads/:id/edit",
            element: (
              <S>
                <LeadEdit />
              </S>
            ),
          },
          {
            path: "/crm/accounts",
            element: (
              <S>
                <AccountsList />
              </S>
            ),
          },
          {
            path: "/crm/accounts/:id",
            element: (
              <S>
                <AccountDetail />
              </S>
            ),
          },
          {
            path: "/crm/accounts/:id/edit",
            element: (
              <S>
                <AccountEdit />
              </S>
            ),
          },

          {
            path: "/crm/contacts",
            element: (
              <S>
                <ContactsList />
              </S>
            ),
          },
          {
            path: "/crm/opportunities",
            element: (
              <S>
                <OpportunitiesList />
              </S>
            ),
          },
          {
            path: "/crm/opportunities/kanban",
            element: (
              <S>
                <OpportunityKanban />
              </S>
            ),
          },
          {
            path: "/crm/opportunities/:id",
            element: (
              <S>
                <OpportunityDetail />
              </S>
            ),
          },

          // HR
          {
            path: "/hr/employees",
            element: (
              <S>
                <EmployeesList />
              </S>
            ),
          },
          {
            path: "/hr/employees/:id",
            element: (
              <S>
                <EmployeeDetail />
              </S>
            ),
          },
          {
            path: "/hr/employees/:id/edit",
            element: (
              <S>
                <EmployeeEdit />
              </S>
            ),
          },
          {
            path: "/hr/attendance",
            element: (
              <S>
                <AttendanceLogs />
              </S>
            ),
          },
          {
            path: "/hr/leaves",
            element: (
              <S>
                <LeaveRequests />
              </S>
            ),
          },
          {
            path: "/hr/payroll",
            element: (
              <S>
                <PayrollRuns />
              </S>
            ),
          },

          // Finance
          {
            path: "/finance",
            element: (
              <S>
                <FinanceOverview />
              </S>
            ),
          },
          {
            path: "/finance/expenses",
            element: (
              <S>
                <ExpensesList />
              </S>
            ),
          },
          {
            path: "/finance/ledger",
            element: (
              <S>
                <GeneralLedger />
              </S>
            ),
          },

          // Other modules
          {
            path: "/inventory",
            element: (
              <S>
                <ItemsList />
              </S>
            ),
          },
          {
            path: "/procurement",
            element: (
              <S>
                <PurchaseOrders />
              </S>
            ),
          },
          // Procurement
          {
            path: "/procurement/orders/:id",
            element: (
              <S>
                <PurchaseDetails />
              </S>
            ),
          },
          {
            path: "/procurement/orders/:id/edit",
            element: (
              <S>
                <PurchaseEdit />
              </S>
            ),
          },

          {
            path: "/projects",
            element: (
              <S>
                <ProjectsList />
              </S>
            ),
          },
          {
            path: "/projects/:id",
            element: (
              <S>
                <ProjectDetail />
              </S>
            ),
          },
          {
            path: "/projects/:id/edit",
            element: (
              <S>
                <ProjectEdit />
              </S>
            ),
          },
          {
            path: "/support",
            element: (
              <S>
                <TicketsList />
              </S>
            ),
          },
          {
            path: "/support/:id",
            element: (
              <S>
                <SupportDetail />
              </S>
            ),
          },
          {
            path: "/support/:id/edit",
            element: (
              <S>
                <SupportEdit />
              </S>
            ),
          },
          {
            path: "/reports",
            element: (
              <S>
                <Analytics />
              </S>
            ),
          },
          {
            path: "/settings",
            element: (
              <S>
                <Settings />
              </S>
            ),
          },
          {
            path: "/settings/users/:id",
            element: (
              <S>
                <UserDetails />
              </S>
            ),
          },
          {
            path: "/settings/users/:id/edit",
            element: (
              <S>
                <UserEdit />
              </S>
            ),
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
