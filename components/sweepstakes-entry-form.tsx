import { useState } from "react";
import { Button } from "@/components/Button";
import { CheckCircle, Gift, Shield, Users } from "lucide-react";

interface SweepstakesEntryFormProps {
  sweepstakesId: string;
  title: string;
  description: string;
  prizeDescription: string;
  prizeValue: number;
  endDate: string;
  totalEntries: number;
  winnersCount: number;
}

export function SweepstakesEntryForm({
  sweepstakesId,
  title,
  description,
  prizeDescription,
  prizeValue,
  endDate,
  totalEntries,
  winnersCount,
}: SweepstakesEntryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [entryId, setEntryId] = useState("");

  // Handle form submission - abstracts all blockchain complexity
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would call our API that handles:
      // 1. Minting Entry NFT with treasury wallet
      // 2. Storing participant data off-chain
      // 3. Linking NFT to participant via unique ID
      // 4. Paying all gas fees from treasury
      const response = await fetch("/api/sweepstakes/enter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sweepstakesId,
          name: formData.name,
          email: formData.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEntryId(result.entryId); // e.g., "SWP-2024-001-7832"
        setIsSubmitted(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Entry submission failed:", error);
      alert("Failed to submit entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Success state - participant entered successfully
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            You're Entered! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Your entry has been recorded on the blockchain for complete
            transparency.
          </p>

          {/* Entry ID - unique identifier */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-600 font-medium">Your Entry ID:</p>
            <p className="text-lg font-bold text-blue-800">{entryId}</p>
            <p className="text-xs text-blue-500 mt-1">
              Save this ID to verify your entry on the blockchain
            </p>
          </div>

          {/* Verification Link */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <Shield className="w-5 h-5 text-gray-600 inline mr-2" />
            <span className="text-sm text-gray-600">
              <strong>Provably Fair:</strong> When winners are selected, you can
              verify the randomness was genuine using blockchain proof.
            </span>
          </div>

          {/* Social Sharing for Bonus Entries */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Get Bonus Entries!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this sweepstakes to get additional entries and increase your
              chances of winning.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="sm">
                Share on Twitter
              </Button>
              <Button variant="secondary" size="sm">
                Share on Facebook
              </Button>
              <Button variant="secondary" size="sm">
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Entry form - clean, simple, no crypto complexity
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-blue-100">{description}</p>
      </div>

      {/* Prize Info */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4 mb-4">
          <Gift className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-semibold text-lg">Prize</h3>
            <p className="text-gray-600">{prizeDescription}</p>
            <p className="text-sm text-gray-500">
              Value: ${prizeValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Entries</p>
            <p className="font-semibold">{totalEntries.toLocaleString()}</p>
          </div>
          <div>
            <CheckCircle className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Winners</p>
            <p className="font-semibold">{winnersCount}</p>
          </div>
          <div>
            <Shield className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Ends</p>
            <p className="font-semibold">
              {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              Provably Fair Guarantee
            </span>
          </div>
          <p className="text-sm text-green-700">
            Winner selection is verified on the blockchain - no rigging
            possible. You'll receive a unique entry ID that proves your
            participation.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Entering..." : "Enter Sweepstakes"}
        </Button>

        {/* Legal */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          By entering, you agree to the official rules and privacy policy. No
          purchase necessary. Void where prohibited.
        </p>
      </form>
    </div>
  );
}
