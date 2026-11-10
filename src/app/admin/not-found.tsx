import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";
import { adminMetadata } from "@/lib/admin/format";

export const metadata = adminMetadata("Page not found");

export default function AdminNotFound() {
  return (
    <AdminPage
      eyebrow="404"
      title="That page does not exist"
      lead="Check the address, or go back to the admin home."
    >
      <div>
        <Button href={"/admin"}>Go to the admin home</Button>
      </div>
    </AdminPage>
  );
}
