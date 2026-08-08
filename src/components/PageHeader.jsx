import React from "react";

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:px-8 sm:py-6">
    <div>
      <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
