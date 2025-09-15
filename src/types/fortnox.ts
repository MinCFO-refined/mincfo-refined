export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  organisation_number?: string;
  fiscal_years?: DatabaseFiscalYear[];
}
export type FortnoxVoucherDetail = {
  Voucher: {
    VoucherSeries: string;
    VoucherNumber: number;
    Year: number;
    TransactionDate: string;
    Description?: string | null;
    Comments?: string | null;
    ApprovalState?: number | null;
    CostCenter?: string | null;
    Project?: string | null;
    ReferenceNumber?: string | null;
    ReferenceType?: string | null;
    VoucherRows?: Array<{
      Account: number;
      Debit?: number | null;
      Credit?: number | null;
      Description?: string | null;
      TransactionInformation?: string | null;
      Quantity?: number | null;
      CostCenter?: string | null;
      Project?: string | null;
      Removed?: boolean | null;
    }>;
  };
};

export interface FortnoxVoucherRow {
  voucher_id: string;
  company_id: string;
  voucher_series: string;
  voucher_number: number;
  year: number;
  transaction_date: string;
  description: string | null;
  comments: string | null;
  approval_state: string | null;
  cost_center: string | null;
  project: string | null;
  reference_number: string | null;
  reference_type: string | null;
  created_at: string | null;
  updated_at: string | null;
  fortnox_voucher_transactions: FortnoxVoucherTransactionRow[];
}

export interface FortnoxVoucherTransactionRow {
  id: string;
  voucher_id: string;
  account: number;
  debit: number | null;
  credit: number | null;
  description: string | null;
  transaction_information: string | null;
  quantity: number | null;
  cost_center: string | null;
  project: string | null;
  removed: boolean | null;
  created_at: string | null;
}

export interface FortnoxFiscalYear {
  "@url"?: string; // API URL to this resource
  Id?: number; // Year id (integer)
  FromDate: string; // yyyy-MM-dd
  ToDate: string; // yyyy-MM-dd
  AccountChartType?: string; // e.g. "Bas 2025"
  AccountingMethod?: "ACCRUAL" | "CASH";
  Active?: boolean; // Only present if multiple years
}

export interface FortnoxFiscalYearList {
  FinancialYears: FortnoxFiscalYear[];
}
// Database type
export interface DatabaseFiscalYear {
  id: string;
  company_id: string;
  fortnox_id: number;
  from_date: string; // ISO
  to_date: string; // ISO
  is_active: boolean;
  account_chart_type: string | null;
  accounting_method: string | null;
  inserted_at: string | null;
  updated_at: string | null;
}

export type FortnoxMonth =
  | {
      month: string;
      revenue: number;
      profit?: never;
      costs?: never;
      grossMargin?: never;
    }
  | {
      month: string;
      profit: number;
      revenue?: never;
      costs?: never;
      grossMargin?: never;
    }
  | {
      month: string;
      costs: number;
      revenue?: never;
      profit?: never;
      grossMargin?: never;
    }
  | {
      month: string;
      grossMargin: number;
      revenue?: never;
      profit?: never;
      costs?: never;
    };

export interface FortnoxMetric {
  fiscal_year_total?: number | null;
  last12_total?: number | null;
  last12_monthly?: FortnoxMonth[];
  fiscal_monthly?: FortnoxMonth[];
}

export interface FortnoxKPI {
  revenue?: FortnoxMetric;
  profit?: FortnoxMetric;
  costs?: FortnoxMetric;
  grossMargin?: FortnoxMetric;
}
