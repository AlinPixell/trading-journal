import EditTradeClient from "@/components/EditTradeClient";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTradePage({ params }: EditPageProps) {
  const { id } = await params;
  return <EditTradeClient id={decodeURIComponent(id)} />;
}
