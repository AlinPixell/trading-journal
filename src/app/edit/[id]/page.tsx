import EditTradeClient from "@/components/EditTradeClient";

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function EditTradePage({ params }: EditPageProps) {
  return <EditTradeClient id={params.id} />;
}
