import CandidateForm from "../../../../components/forms/candidate-form";

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandidateForm candidateId={id} />;
}