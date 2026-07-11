import { ActivationPage } from "@/features/move/activation/ActivationPage";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ActivateRoute({ params, searchParams }: Props) {
  const { code } = await params;
  const { token } = await searchParams;

  return <ActivationPage code={code} token={token} />;
}

