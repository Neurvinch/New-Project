import React, { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import AddressPatternInput, { AddressPatternFormData } from "@/components/AddressPatternInput";
import SaltOptimizationDisplay, { SaltCandidate } from "@/components/SaltOptimizationDisplay";
import ContractDeploymentSection from "@/components/ContractDeploymentSection";
import Create2Explanation from "@/components/Create2Explanation";
import DashboardHeader from "@/components/DashboardHeader";
import { findOptimalSalt, getSampleBytecode } from "@/lib/blockchain-utils";

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<SaltCandidate[]>([]);
  const [optimalSalt, setOptimalSalt] = useState<string | undefined>(undefined);
  const [optimalAddress, setOptimalAddress] = useState<string | undefined>(undefined);
  const [deployerAddress, setDeployerAddress] = useState<string>("");
  const [bytecode, setBytecode] = useState<string>("");

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
          setCandidates(prev => {
            const newCandidates = [...prev, { iteration, salt, address }];
            // Keep only the last 20 candidates to avoid excessive memory usage
            return newCandidates.slice(-20);
          });
        }
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

  const handleDeploymentComplete = useCallback((txHash: string) => {
    toast({
      title: "Contract deployed successfully",
      description: `Transaction hash: ${txHash.substring(0, 10)}...`,
    });
  }, [toast]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1">
        <div className="container py-6 space-y-8">
          <h2 className="text-3xl font-bold tracking-tight">Blockchain Deployment Dashboard</h2>
          <p className="text-muted-foreground max-w-3xl">
            This dashboard helps you find the optimal salt values for deterministic smart contract
            deployment using CREATE2, letting you customize your contract addresses with specific patterns.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <AddressPatternInput
                onSubmit={handleAddressPatternSubmit}
                isProcessing={isProcessing}
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
          <p className="text-sm text-muted-foreground text-center md:text-left">
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
