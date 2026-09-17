import { EmptyState } from "@/components/feedback/EmptyState";
import { copy } from "@/lib/copy/ar";

type PlaceholderScreenProps = {
  description?: string;
  children?: React.ReactNode;
};

export function PlaceholderScreen({
  description = copy.placeholderHint,
  children,
}: PlaceholderScreenProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <p className="text-base text-muted">{description}</p>
      {children}
    </div>
  );
}

export function PlaceholderEmpty({ message }: { message?: string }) {
  return (
    <PlaceholderScreen>
      <EmptyState message={message} />
    </PlaceholderScreen>
  );
}
