import { ActivationPage } from "@/features/move/activation/ActivationPage";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function ActivateRoute({ params }: Props) {
  const { code } = await params;

  return <ActivationPage code={code} />;
}
