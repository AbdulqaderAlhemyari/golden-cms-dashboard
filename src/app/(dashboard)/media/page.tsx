import { EmptyState } from "@/components/feedback/EmptyState";
import { PlaceholderScreen } from "@/components/shell/PlaceholderScreen";
import { copy } from "@/lib/copy/ar";

export default function MediaPage() {
  return (
    <PlaceholderScreen>
      <EmptyState
        message={copy.noMediaYet}
        action={
          <button type="button" className="btn-primary" disabled>
            {copy.addPhoto}
          </button>
        }
      />
    </PlaceholderScreen>
  );
}
