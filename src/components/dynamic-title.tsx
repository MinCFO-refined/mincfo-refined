// "use client";
// import { useEffect } from "react";
// import { usePathname } from "next/navigation";
// import {
//   IconDashboard,
//   IconChartBar,
//   IconWallet,
//   type Icon as TablerIcon,
// } from "@tabler/icons-react";

// // Define mapping for routes → title (+ optional icon)
// const titleConfig: Record<string, { title: string; icon?: TablerIcon }> = {
//   "/admin/dashboard": {
//     title: "Adminpanel – Portal",
//     icon: IconDashboard,
//   },
//   "/admin/revenue": {
//     title: "Omsättning – Portal",
//     icon: IconChartBar,
//   },
//   "/admin/profit": {
//     title: "Vinst – Portal",
//     icon: IconWallet,
//   },
//   // add more routes here...
// };

// export function DynamicTitle() {
//   const pathname = usePathname();

//   useEffect(() => {
//     // Find exact match
//     const config = titleConfig[pathname];

//     if (config) {
//       document.title = config.title;
//     } else {
//       // fallback
//       document.title = "Portal";
//     }
//   }, [pathname]);

//   return null;
// }
