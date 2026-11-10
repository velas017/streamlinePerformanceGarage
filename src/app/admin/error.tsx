"use client";

import { useEffect } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";

interface AdminErrorProps {
  readonly error: Error & { digest?: string };
  /** Next 16: re-fetches and re-renders the segment. */
  readonly retry: () => void;
}

export default function AdminError({ error, retry }: AdminErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AdminPage
      eyebrow="Something went wrong"
      title="We could not load this page"
      lead="Nothing was changed. Try again in a minute."
    >
      <div>
        <Button onClick={retry}>Try again</Button>
      </div>
    </AdminPage>
  );
}
