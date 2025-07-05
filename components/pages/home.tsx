"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Users,
  Trophy,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-20" />

        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="pt-32 pb-20 text-center">
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 fade-in">
              <span className="block text-white">Build Beyond</span>
              <span className="block gradient-text">Fair & Transparent</span>
              <span className="block text-white">Sweepstakes</span>
            </h1>

            <p
              className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              SweepChain delivers the benefits of blockchain transparency with
              the ease of traditional sweepstakes
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <Link
                href="/sweepstakes"
                className="sui-button sui-button-primary inline-flex items-center gap-2"
              >
                Start a Campaign
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/discover"
                className="sui-button sui-button-secondary inline-flex items-center gap-2"
              >
                Explore Sweepstakes
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
            <div
              className="metric-card fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="metric-value">$2.5M+</div>
              <div className="metric-label">Total Prize Value</div>
            </div>
            <div
              className="metric-card fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="metric-value">50K+</div>
              <div className="metric-label">Active Participants</div>
            </div>
            <div
              className="metric-card fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="metric-value">99.9%</div>
              <div className="metric-label">Uptime</div>
            </div>
            <div
              className="metric-card fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="metric-value">&lt;1s</div>
              <div className="metric-label">Transaction Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Uniquely achievable</span> on
              SweepChain
            </h2>
            <p className="text-gray-400 text-lg">
              Designed to deliver on the promise of transparent and fair
              sweepstakes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Provably Fair</h3>
              <p className="text-gray-400">
                Every entry and winner selection is recorded on-chain, ensuring
                complete transparency and fairness
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Company Control</h3>
              <p className="text-gray-400">
                Full control over distribution - send Entry NFTs via email,
                social media, or direct transfer
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Settlement</h3>
              <p className="text-gray-400">
                Winners are selected automatically with near-instant finality
                and transparent results
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Built on Sui blockchain for sub-second transactions and minimal
                fees
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-400">
                Run campaigns worldwide with no geographical restrictions or
                payment barriers
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">NFT Innovation</h3>
              <p className="text-gray-400">
                Entry NFTs can be customized with branding, metadata, and unique
                experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How <span className="gradient-text">SweepChain</span> Works
            </h2>
            <p className="text-gray-400 text-lg">
              Simple, transparent, and secure sweepstakes in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="gradient-border-card p-8 mb-4">
                <div className="text-5xl font-bold gradient-text mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Create Campaign</h3>
                <p className="text-gray-400">
                  Deposit SWEEP tokens as collateral and receive Entry NFTs for
                  distribution
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="gradient-border-card p-8 mb-4">
                <div className="text-5xl font-bold gradient-text mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">
                  Distribute Entries
                </h3>
                <p className="text-gray-400">
                  Send NFTs to participants via your preferred method - email,
                  social, or direct
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="gradient-border-card p-8 mb-4">
                <div className="text-5xl font-bold gradient-text mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Select Winner</h3>
                <p className="text-gray-400">
                  Blockchain randomly selects winner with complete transparency
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="gradient-border-card p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to run a{" "}
              <span className="gradient-text">transparent sweepstakes</span>?
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of companies using SweepChain to build trust with
              their customers
            </p>
            <Link
              href="/sweepstakes"
              className="sui-button sui-button-primary inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
