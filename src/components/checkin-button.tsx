"use client";

import { useTransition } from "react";
import { checkInToday } from "@/actions/checkin";

export default function CheckInButton() {
  const [pending, startTransition] =
    useTransition();

  return (
    <button
      disabled={pending}
      className="rounded-lg bg-black px-4 py-2 text-white"
      onClick={() =>
        startTransition(async () => {
          try {
            await checkInToday();
            window.location.reload();
          } catch {
            alert(
              "Already checked in today."
            );
          }
        })
      }
    >
      {pending
        ? "Checking In..."
        : "Check In Today"}
    </button>
  );
}