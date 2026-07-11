import { PublicQrPage } from "@/features/move/public-qr/PublicQrPage";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function QrRoute({ params }: Props) {
  const { code } = await params;

  return <PublicQrPage code={code} />;
}
