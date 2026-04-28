import { Key, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ApiKeysEmpty({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Key />
        </EmptyMedia>
        <EmptyTitle>No API keys</EmptyTitle>
        <EmptyDescription>
          Create a key to access the Developer REST API programmatically.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreateClick}>
          <Plus className="size-3.5" />
          Create API key
        </Button>
      </EmptyContent>
    </Empty>
  );
}
