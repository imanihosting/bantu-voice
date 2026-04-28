import { useState } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { voicesSearchParams } from "@/features/voices/lib/params";
import { VoiceCreateDialog } from "./voice-create-dialog";

export function VoicesToolbar() {
  const [query, setQuery] = useQueryState(
    "query",
    voicesSearchParams.query
  );
  const [localQuery, setLocalQuery] = useState(query);

  const debouncedSetQuery = useDebouncedCallback(
    (value: string) => setQuery(value),
    300,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold tracking-tight">
            Voice Library
          </h2>
          <p className="text-sm text-muted-foreground">
            Discover voices or create your own custom voice.
          </p>
        </div>
        <VoiceCreateDialog>
          <Button size="sm" className="shrink-0">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Custom Voice</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </VoiceCreateDialog>
      </div>

      <InputGroup>
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search voices..."
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
            debouncedSetQuery(e.target.value);
          }}
        />
      </InputGroup>
    </div>
  );
}
