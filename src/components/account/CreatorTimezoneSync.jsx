"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

function isValidTimeZone(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return false;
  }

  try {
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: value,
      }
    );

    return true;
  } catch {
    return false;
  }
}

export default function CreatorTimezoneSync({
  userId,
}) {
  useEffect(() => {
    let isCancelled = false;

    async function syncTimezone() {
      if (!userId) {
        return;
      }

      const detectedTimeZone =
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone;

      if (
        !isValidTimeZone(
          detectedTimeZone
        )
      ) {
        return;
      }

      const {
        data: creator,
        error: creatorError,
      } =
        await supabase
          .from("creators")
          .select(
            "time_zone"
          )
          .eq(
            "user_id",
            userId
          )
          .maybeSingle();

      if (
        creatorError ||
        !creator ||
        isCancelled
      ) {
        return;
      }

      if (
        creator.time_zone ===
        detectedTimeZone
      ) {
        return;
      }

      const {
        error: updateError,
      } =
        await supabase
          .from("creators")
          .update({
            time_zone:
              detectedTimeZone,
          })
          .eq(
            "user_id",
            userId
          );

      if (updateError) {
        console.error(
          "Failed to sync creator timezone:",
          updateError
        );
      }
    }

    syncTimezone();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  return null;
}