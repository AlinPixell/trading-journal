import EditBacktestTradeClient from "@/components/backtesting/EditBacktestTradeClient";

interface EditBacktestTradePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBacktestTradePage({ params }: EditBacktestTradePageProps) {
  const { id } = await params;
  return <EditBacktestTradeClient id={decodeURIComponent(id)} />;
}
