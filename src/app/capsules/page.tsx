import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { joinCapsule } from "@/actions/join-capsule";

export default async function CapsulesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: capsules } = await supabase
    .from("capsules")
    .select("*")
    .order("duration_days");

  const { data: membership } = await supabase
    .from("capsule_members")
    .select("capsule_id")
    .eq("user_id", user?.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-4xl p-10">
      <h1 className="mb-8 text-4xl font-bold">
        Capsules
      </h1>

      <div className="grid gap-4">
        {capsules?.map((capsule) => (
          <div
            key={capsule.id}
            className="rounded-xl border p-6"
          >
            <h2 className="text-2xl font-bold">
              {capsule.name}
            </h2>

            <p className="mt-2 text-gray-500">
              {capsule.duration_days} Days
            </p>

            <div className="mt-4 flex gap-4">
            {membership?.capsule_id === capsule.id ? (
  <span className="text-green-600 font-semibold">
    ✓ Joined
  </span>
) : membership ? (
  <span className="text-gray-500">
    Already in another capsule
  </span>
) : (
  <form
    action={async () => {
      "use server";
      await joinCapsule(capsule.id);
    }}
  >
    <button
      type="submit"
      className="rounded bg-black px-4 py-2 text-white"
    >
      Join
    </button>
  </form>
)}

              <Link
                href={`/capsules/${capsule.id}`}
                className="rounded border px-4 py-2"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}