import { useEffect, useRef } from "react";
import { useAddHistoryEntryMutation } from "../../core/api/apiSlice";

/** Records a history entry once per mount for the given property or tourist spot. */
export function useRecordHistory(args: { propertyId?: number; touristSpotId?: number }) {
  const [addHistoryEntry] = useAddHistoryEntryMutation();
  const recordedRef = useRef(false);

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;

    if (args.propertyId) {
      addHistoryEntry({ entryType: "property", propertyId: args.propertyId }).catch(() => {});
    } else if (args.touristSpotId) {
      addHistoryEntry({ entryType: "tourist_spot", touristSpotId: args.touristSpotId }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.propertyId, args.touristSpotId]);
}