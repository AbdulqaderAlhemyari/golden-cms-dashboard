import { EmptyState } from "@/components/feedback/EmptyState";
import { PlaceholderScreen } from "@/components/shell/PlaceholderScreen";
import { copy } from "@/lib/copy/ar";

export default function ServicesPage() {
  return (
    <PlaceholderScreen>
      <EmptyState message={copy.noServicesYet} />
    </PlaceholderScreen>
  );
}
