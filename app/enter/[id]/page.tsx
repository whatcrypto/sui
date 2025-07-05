import { SweepstakesEntryForm } from "@/components/sweepstakes-entry-form";
import { Metadata } from "next";

interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // In production, fetch sweepstakes data here
  return {
    title: "Enter Sweepstakes - SweepChain",
    description:
      "Enter this provably fair sweepstakes powered by blockchain technology",
    openGraph: {
      title: "Enter Sweepstakes - SweepChain",
      description:
        "Enter this provably fair sweepstakes powered by blockchain technology",
      type: "website",
    },
  };
}

export default async function EnterSweepstakesPage({ params }: PageProps) {
  const { id } = params;

  // Mock data - in production, fetch from API or database
  const sweepstakesData = {
    sweepstakesId: id,
    title: "Holiday Giveaway 2024",
    description:
      "Win amazing prizes this holiday season! Enter now for your chance to win a MacBook Pro and AirPods Pro.",
    prizeDescription: 'MacBook Pro 16" + AirPods Pro',
    prizeValue: 299900, // $2999 in cents
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalEntries: 1247,
    winnersCount: 3,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <SweepstakesEntryForm {...sweepstakesData} />
      </div>
    </div>
  );
}
