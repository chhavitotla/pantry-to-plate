import { ChefMateWorkspace } from "@/components/app/chefmate-workspace";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function ProductPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <ChefMateWorkspace />
      </main>
      <SiteFooter />
    </div>
  );
}
