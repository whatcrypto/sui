"use client";

export function CreateSweepstakes({
  newSweepstakes,
  setNewSweepstakes,
  creating,
  onSubmit,
}) {
  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">
        Create New Sweepstakes
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={newSweepstakes.title}
            onChange={(e) =>
              setNewSweepstakes({ ...newSweepstakes, title: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
            placeholder="Enter sweepstakes title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Description *
          </label>
          <textarea
            value={newSweepstakes.description}
            onChange={(e) =>
              setNewSweepstakes({
                ...newSweepstakes,
                description: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
            placeholder="Describe your sweepstakes and prize"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Prize Amount (SWEEP) *
            </label>
            <input
              type="number"
              value={newSweepstakes.prizeAmount}
              onChange={(e) =>
                setNewSweepstakes({
                  ...newSweepstakes,
                  prizeAmount: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
              placeholder="0.0"
              step="0.1"
              min="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              value={newSweepstakes.maxParticipants}
              onChange={(e) =>
                setNewSweepstakes({
                  ...newSweepstakes,
                  maxParticipants: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
              placeholder="100"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            value={newSweepstakes.endTimestamp}
            onChange={(e) =>
              setNewSweepstakes({
                ...newSweepstakes,
                endTimestamp: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
            min={minDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Delivery Information
          </label>
          <textarea
            value={newSweepstakes.deliveryInfo}
            onChange={(e) =>
              setNewSweepstakes({
                ...newSweepstakes,
                deliveryInfo: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-cyan-500"
            placeholder="How will the prize be delivered? (optional)"
            rows={2}
          />
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <h4 className="text-cyan-400 font-medium mb-2">💡 Important Notes</h4>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>
              • You'll need to deposit collateral (prize amount + platform fee)
            </li>
            <li>• Participants enter for free - you cover all costs</li>
            <li>• Winner selection uses blockchain randomness for fairness</li>
            <li>
              • You have 7 days to deliver the prize after winner selection
            </li>
          </ul>
        </div>

        <button
          onClick={onSubmit}
          disabled={
            creating ||
            !newSweepstakes.title ||
            !newSweepstakes.description ||
            newSweepstakes.prizeAmount <= 0 ||
            !newSweepstakes.endTimestamp
          }
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-all duration-200 font-medium"
        >
          {creating ? "Creating..." : "Create Sweepstakes"}
        </button>
      </div>
    </div>
  );
}