import React, { useState, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import AddressPatternInput, { AddressPatternFormData } from "@/components/AddressPatternInput";
import SaltOptimizationDisplay, { SaltCandidate } from "@/components/SaltOptimizationDisplay";
import ContractDeploymentSection from "@/components/ContractDeploymentSection";
import Create2Explanation from "@/components/Create2Explanation";
import AiRecommendations from "@/components/AiRecommendations";
import DashboardHeader from "@/components/DashboardHeader";
import {
  findOptimalSalt,
  getSampleBytecode,
  calculateCreate2Address,
} from "@/lib/blockchain-utils";
import { GrokApiService, SaltRecommendation } from "@/lib/grok-api";

// Initialize Grok API service
const grokApiService = new GrokApiService();

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<SaltCandidate[]>([]);
  const [optimalSalt, setOptimalSalt] = useState<string | undefined>(undefined);
  const [optimalAddress, setOptimalAddress] = useState<string | undefined>(undefined);
  const [deployerAddress, setDeployerAddress] = useState<string>("");
  const [bytecode, setBytecode] = useState<string>("");

  // AI recommendations state
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<SaltRecommendation[]>([]);
  const [currentPattern, setCurrentPattern] = useState<string>("");

  // Load AI recommendations when pattern changes
  useEffect(() => {
    if (!currentPattern || currentPattern.length < 2 || !deployerAddress) return;

    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const recommendations = await grokApiService.getSaltRecommendations({
          pattern: currentPattern,
          deployerAddress,
          bytecode: bytecode || getSampleBytecode(),
        });

        setAiRecommendations(recommendations);
      } catch (error) {
        console.error("Error fetching AI recommendations:", error);
        toast({
          variant: "destructive",
          title: "Failed to get AI recommendations",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [currentPattern, deployerAddress, bytecode, toast]);

  const handleAddressPatternSubmit = async (data: AddressPatternFormData) => {
    // Reset state
    setIsProcessing(true);
    setProgress(0);
    setCandidates([]);
    setOptimalSalt(undefined);
    setOptimalAddress(undefined);

    try {
      // Save parameters
      setDeployerAddress(data.deployerAddress);
      const contractBytecode = data.customBytecode?.trim() || getSampleBytecode();
      setBytecode(contractBytecode);

      // Save the current pattern for AI recommendations
      setCurrentPattern(data.pattern);

      // Start the salt optimization process
      const result = await findOptimalSalt(
        data.deployerAddress,
        contractBytecode,
        data.pattern,
        0,
        (iteration, salt, address) => {
          // Update progress (simulated progress percentage)
          const newProgress = Math.min(99, iteration / 10);
          setProgress(newProgress);

          // Add to candidates list
          setCandidates((prev) => {
            const newCandidates = [...prev, { iteration, salt, address }];
            // Keep only the last 20 candidates to avoid excessive memory usage
            return newCandidates.slice(-20);
          });
        },
      );

      // Update with the optimal result
      setOptimalSalt(result.salt);
      setOptimalAddress(result.address);
      setProgress(100);

      toast({
        title: "Optimal salt found!",
        description: `Found a salt value that produces an address containing the pattern '${data.pattern}'.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectRecommendation = useCallback(
    (salt: string) => {
      if (!deployerAddress || !bytecode) {
        toast({
          variant: "destructive",
          title: "Cannot select recommendation",
          description: "Missing deployer address or bytecode information",
        });
        return;
      }

      try {
        // Calculate the address from the recommended salt
        const address = calculateCreate2Address(deployerAddress, salt, bytecode);

        // Update state with the selected salt and address
        setOptimalSalt(salt);
        setOptimalAddress(address);

        toast({
          title: "AI recommendation selected",
          description: "The recommended salt value has been applied",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error applying recommendation",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    },
    [deployerAddress, bytecode, toast],
  );

  const handleDeploymentComplete = useCallback(
    (txHash: string) => {
      toast({
        title: "Contract deployed successfully",
        description: `Transaction hash: ${txHash.substring(0, 10)}...`,
      });
    },
    [toast],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1">
        <div className="container space-y-8 py-6">
          <h2 className="text-3xl font-bold tracking-tight">Blockchain Deployment Dashboard</h2>
          <p className="max-w-3xl text-muted-foreground">
            This dashboard helps you find the optimal salt values for deterministic smart contract
            deployment using CREATE2, letting you customize your contract addresses with specific
            patterns.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <AddressPatternInput
                onSubmit={handleAddressPatternSubmit}
                isProcessing={isProcessing || isLoadingRecommendations}
              />

              <AiRecommendations
                isLoading={isLoadingRecommendations}
                recommendations={aiRecommendations}
                onSelectRecommendation={handleSelectRecommendation}
                selectedSalt={optimalSalt}
              />

              <Create2Explanation />
            </div>

            <div className="space-y-6">
              <SaltOptimizationDisplay
                isProcessing={isProcessing}
                progress={progress}
                candidates={candidates}
                optimalSalt={optimalSalt}
                optimalAddress={optimalAddress}
              />

              <ContractDeploymentSection
                isEnabled={!!optimalSalt}
                deployerAddress={deployerAddress}
                salt={optimalSalt || ""}
                bytecode={bytecode}
                contractAddress={optimalAddress || ""}
                onDeploymentComplete={handleDeploymentComplete}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            AI Salt Optimizer - Blockchain Deployment Platform
          </p>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Salt Optimizer. All rights reserved.
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};

export default Dashboard;
