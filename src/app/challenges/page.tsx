import { createClient } from "@/lib/supabase/server";

export default async function ChallengesPage() {
  const supabase = await createClient();

  const { data: challenges } =
    await supabase
      .from("challenges")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return (
    <main className="mx-auto max-w-4xl p-10">
      <h1 className="mb-8 text-4xl font-bold">
        Challenges
      </h1>

      <div className="space-y-4">
        {challenges?.map((challenge) => (
          <div
            key={challenge.id}
            className="rounded-xl border p-6"
          >
            <h2 className="text-2xl font-bold">
              {challenge.title}
            </h2>

            <p className="mt-2">
              {challenge.description}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}