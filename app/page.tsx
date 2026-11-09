import { Suspense } from "react";
import CandidateList, { CandidateListSkeleton } from "../components/candidates/candidate-list";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:px-10">
      <Suspense fallback={<CandidateListSkeleton />}>
        <CandidateList />
      </Suspense>
    </main>
  );
}