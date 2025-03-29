import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress } from "@/lib/blockchain-utils";

export interface SaltCandidate {
  iteration: number;
  salt: string;
  address: string;
}

export interface SaltOptimizationDisplayProps {
  isProcessing: boolean;
  progress: number;
  candidates: SaltCandidate[];
  optimalSalt?: string;
  optimalAddress?: string;
}

const SaltOptimizationDisplay: React.FC<SaltOptimizationDisplayProps> = ({
  isProcessing,
  progress,
  candidates,
  optimalSalt,
  optimalAddress,
}) => {
  // Display the latest candidates, with the most recent first
  const recentCandidates = [...candidates].reverse().slice(0, 5);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Optimization Progress</CardTitle>
        <CardDescription>
          {isProcessing
            ? "AI is searching for the optimal salt value..."
            : optimalSalt
            ? "Optimal salt found!"
            : "Enter parameters to start optimization"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Search Progress</span>
            <span>{isProcessing ? `${progress.toFixed(2)}%` : optimalSalt ? "100%" : "0%"}</span>
          </div>
          <Progress value={isProcessing ? progress : optimalSalt ? 100 : 0} />
        </div>

        {/* Animation for processing - subtle pulse effect */}
        {isProcessing && (
          <div className="py-3">
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}

        {/* Candidate Results */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Recent Candidate Addresses:</h3>
          <div className="rounded-md border">
            {recentCandidates.length > 0 ? (
              <div className="divide-y">
                {recentCandidates.map((candidate, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between px-4 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Salt:</span>
                      <span className="font-mono">{candidate.salt.substring(0, 10)}...</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Address:</span>
                      <span className="font-mono">{formatAddress(candidate.address)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : isProcessing ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="p-4 text-sm text-center text-muted-foreground">
                No candidates generated yet.
              </div>
            )}
          </div>
        </div>

        {/* Optimal Result */}
        {optimalSalt && optimalAddress && (
          <div className="rounded-md border p-4 bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Optimal Result:</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Optimal Salt:</span>
                <span className="font-mono text-sm">{optimalSalt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Resulting Address:</span>
                <span className="font-mono text-sm">{optimalAddress}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SaltOptimizationDisplay;
