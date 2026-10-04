import type { ReactElement } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { OwnerLayout } from "@/app/layouts/OwnerLayout"
import { RequireAuth } from "@/app/router/RequireAuth"
import { routeAccess } from "@/app/router/routeAccess"
import { LoginSection } from "@/modules/owner/auth/section/LoginSection"
import { BillingSection } from "@/modules/owner/billing/section/BillingSection"
import { BusinessSettingsSection } from "@/modules/owner/business-settings/section/BusinessSettingsSection"
import { CashReportSection } from "@/modules/owner/cash-report/section/CashReportSection"
import { ChangePasswordSection } from "@/modules/owner/change-password/section/ChangePasswordSection"
import { UsersSection } from "@/modules/owner/cashier/section/UsersSection"
import { DashboardSection } from "@/modules/owner/dashboard/section/DashboardSection"
import { FinancialReportSection } from "@/modules/owner/financial-report/section/FinancialReportSection"
import { IngredientSection } from "@/modules/owner/ingredient/section/IngredientSection"
import { MenuCatalogSection } from "@/modules/owner/menu/section/MenuCatalogSection"
import { OrderTypeSection } from "@/modules/owner/order-type/section/OrderTypeSection"
import { PaymentMethodSection } from "@/modules/owner/payment-method/section/PaymentMethodSection"
import { ProductDiscountSection } from "@/modules/owner/product-discount/section/ProductDiscountSection"
import { ProfileSection } from "@/modules/owner/profile/section/ProfileSection"
import { StockHistorySection } from "@/modules/owner/stock-history/section/StockHistorySection"
import { StockReconciliationSection } from "@/modules/owner/stock-reconciliation/section/StockReconciliationSection"
import { VoucherSection } from "@/modules/owner/voucher/section/VoucherSection"
import { LandingPage } from "@/modules/public/landing/presentation/LandingPage"
import { REGISTER_PATH, REGISTRATION_STATUS_PATH } from "@/modules/public/shared/contact"
import { RegistrationStatusPage } from "@/modules/public/store-registration/presentation/RegistrationStatusPage"
import { StoreRegistrationPage } from "@/modules/public/store-registration/presentation/StoreRegistrationPage"
import { RequireAccess } from "@/shared/access/RequireAccess"

// Two trees: the public pages ("/" landing, "/daftar" store registration,
// "/status-pendaftaran" approval status — modules/public) and the owner console ("/login" + "/app/*", modules/owner).
// Cashier flows live in a separate mobile app.
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page — the first thing any visitor sees. The owner
            console (/app) only opens after logging in as owner. */}
        <Route path="/" element={<LandingPage />} />
        <Route path={REGISTER_PATH} element={<StoreRegistrationPage />} />
        <Route path={REGISTRATION_STATUS_PATH} element={<RegistrationStatusPage />} />
        <Route path="/login" element={<LoginSection />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <OwnerLayout />
            </RequireAuth>
          }
        >
          <Route index element={guarded("", <DashboardSection />)} />
          <Route path="billing" element={guarded("billing", <BillingSection />)} />
          {/* Categories + menus share one page with tabs; the old
              category URL lands on its tab. */}
          <Route path="menu" element={guarded("menu", <MenuCatalogSection />)} />
          <Route path="menu-category" element={<Navigate to="/app/menu" replace />} />
          <Route path="ingredient" element={guarded("ingredient", <IngredientSection />)} />
          <Route
            path="payment-method"
            element={guarded("payment-method", <PaymentMethodSection />)}
          />
          <Route path="order-type" element={guarded("order-type", <OrderTypeSection />)} />
          <Route path="table" element={guarded("table", <PlaceholderScreen title="Table" />)} />
          {/* Accounts (Akun Kasir) + devices (Perangkat Kasir) share one page
              with tabs — same pattern as /app/menu. */}
          <Route path="users" element={guarded("users", <UsersSection />)} />
          <Route path="voucher" element={guarded("voucher", <VoucherSection />)} />
          <Route
            path="discount-auto"
            element={guarded("discount-auto", <ProductDiscountSection />)}
          />
          <Route
            path="financial-report"
            element={guarded("financial-report", <FinancialReportSection />)}
          />
          <Route path="sales-report" element={<Navigate to="/app/financial-report" replace />} />
          <Route path="cash-report" element={guarded("cash-report", <CashReportSection />)} />
          <Route
            path="stock-history"
            element={guarded("stock-history", <StockHistorySection />)}
          />
          <Route
            path="stock-reconciliation"
            element={guarded("stock-reconciliation", <StockReconciliationSection />)}
          />
          <Route path="profile" element={guarded("profile", <ProfileSection />)} />
          <Route
            path="change-password"
            element={guarded("change-password", <ChangePasswordSection />)}
          />
          <Route
            path="business-settings"
            element={guarded("business-settings", <BusinessSettingsSection />)}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Wraps a route's element with the RequireAccess rule from routeAccess,
// keyed by the same path string passed to <Route path="...">.
function guarded(path: keyof typeof routeAccess, element: ReactElement) {
  return <RequireAccess {...routeAccess[path]}>{element}</RequireAccess>
}

// Temporary stand-in for screens whose `section/*.tsx` isn't built yet
// (everything except modules/owner/auth) — replace route-by-route as each
// feature's CrudSection wiring lands.
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        Not built yet — see this feature's README for the plan.
      </p>
    </div>
  )
}
