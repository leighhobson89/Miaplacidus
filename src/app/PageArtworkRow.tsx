import type { ReactNode } from "react";

export function PageArtworkRow({ children }: { readonly children: ReactNode }) {
  return (
    <div className="page-artwork-row" aria-hidden="true">
      {children}
    </div>
  );
}
