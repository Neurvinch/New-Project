import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress } from "@/lib/blockchain-utils";
import { SaltRecommendation } from "@/lib/grok-api";

export interface AiRecommendationsProps {
  isLoading: boolean;
  recommendations: SaltRecommendation[];
  onSelectRecommendation: (salt: string) => void;
  selectedSalt?: string;
}

const AiRecommendations: React.FC<AiRecommendationsProps> = ({
  isLoading,
  recommendations,
  onSelectRecommendation,
  selectedSalt,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Grok AI Recommendations
          </CardTitle>
          <CardDescription>Getting intelligent salt recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-[76px] w-full rounded-md" />
              <Skeleton className="h-[76px] w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Grok AI Recommendations
          </CardTitle>
          <CardDescription>No recommendations available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p>Enter an address pattern and click 'Find Optimal Salt' to get AI recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to render the confidence indicator
  const renderConfidence = (confidence: number) => {
    let color;
    if (confidence >= 0.9) color = "text-green-500 dark:text-green-400";
    else if (confidence >= 0.7) color = "text-amber-500 dark:text-amber-400";
    else color = "text-red-500 dark:text-red-400";

    return (
      <div className="flex items-center gap-1">
        <span className={`text-xs font-medium ${color}`}>
          {(confidence * 100).toFixed(0)}% confidence
        </span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i < Math.floor(confidence * 5) ? color : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Grok AI Recommendations
        </CardTitle>
        <CardDescription>
          Intelligent salt suggestions for optimal address generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`rounded-md border p-3 ${
                selectedSalt === rec.salt ? "border-primary bg-primary/5" : ""
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Recommendation {index + 1}</span>
                  {renderConfidence(rec.confidence)}
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Salt:</span>
                  <span className="font-mono">{rec.salt.substring(0, 18)}...</span>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Address:</span>
                  <span className="font-mono">{formatAddress(rec.predictedAddress)}</span>
                </div>

                {rec.gasEstimate && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Est. Gas:</span>
                    <span>{rec.gasEstimate.toLocaleString()}</span>
                  </div>
                )}

                {rec.reasoning && (
                  <p className="mt-1 text-xs text-muted-foreground">{rec.reasoning}</p>
                )}

                <div className="mt-1 flex justify-end">
                  <Button
                    size="sm"
                    variant={selectedSalt === rec.salt ? "secondary" : "outline"}
                    className="h-8 gap-1"
                    onClick={() => onSelectRecommendation(rec.salt)}
                  >
                    {selectedSalt === rec.salt ? (
                      <>
                        <CheckCircle2 size={14} />
                        Selected
                      </>
                    ) : (
                      <>
                        Use this salt
                        <ArrowRight size={14} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiRecommendations;
