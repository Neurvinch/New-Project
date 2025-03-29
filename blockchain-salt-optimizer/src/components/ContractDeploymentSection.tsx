import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info, Check, X, Loader2 } from "lucide-react";
import { deployContract } from "@/lib/blockchain-utils";

export interface ContractDeploymentSectionProps {
  isEnabled: boolean;
  deployerAddress: string;
  salt: string;
  bytecode: string;
  contractAddress: string;
  onDeploymentComplete: (txHash: string) => void;
}

const ContractDeploymentSection: React.FC<ContractDeploymentSectionProps> = ({
  isEnabled,
  deployerAddress,
  salt,
  bytecode,
  contractAddress,
  onDeploymentComplete,
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deploymentHash, setDeploymentHash] = useState<string | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentError(null);

    try {
      const { txHash } = await deployContract(deployerAddress, salt, bytecode);
      setDeploymentHash(txHash);
      onDeploymentComplete(txHash);
    } catch (error) {
      setDeploymentError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Contract Deployment
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={16} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[350px]">
                <p>
                  Deploy your contract to the blockchain using the optimized
                  salt value to achieve your desired address pattern.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Deploy your smart contract with the optimized salt value
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4 bg-muted/50">
          <h3 className="text-sm font-medium mb-2">Deployment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Salt Value:</span>
              <span className="font-mono text-sm">{salt ? salt.substring(0, 16) + "..." : "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Deterministic Address:</span>
              <span className="font-mono text-sm">{contractAddress || "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Deployer Address:</span>
              <span className="font-mono text-sm">{deployerAddress ? `${deployerAddress.substring(0, 10)}...` : "-"}</span>
            </div>
          </div>
        </div>

        {deploymentHash && (
          <div className="rounded-md border p-4 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100">
            <div className="flex items-center gap-2">
              <Check size={16} />
              <span className="text-sm font-medium">Deployment successful!</span>
            </div>
            <div className="mt-2 text-xs">
              <span className="font-medium">Transaction Hash: </span>
              <span className="font-mono">{deploymentHash.substring(0, 16)}...</span>
            </div>
          </div>
        )}

        {deploymentError && (
          <div className="rounded-md border p-4 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100">
            <div className="flex items-center gap-2">
              <X size={16} />
              <span className="text-sm font-medium">Deployment failed</span>
            </div>
            <div className="mt-2 text-xs">
              <span>{deploymentError}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              disabled={!isEnabled || isDeploying}
              variant={deploymentHash ? "secondary" : "default"}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : deploymentHash ? (
                "Deployed Successfully"
              ) : (
                "Deploy Contract"
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deployment</DialogTitle>
              <DialogDescription>
                You are about to deploy a contract with the following parameters:
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Deployer Address:</span>
                <code className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {deployerAddress}
                </code>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Salt Value:</span>
                <code className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {salt}
                </code>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Expected Contract Address:</span>
                <code className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {contractAddress}
                </code>
              </div>

              <div className="mt-2 text-sm">
                <p>
                  This will deploy your contract to the blockchain using CREATE2 with the
                  optimized salt value. The contract will have the address shown above.
                </p>
                <p className="mt-2">
                  Please ensure you have sufficient funds to cover the gas costs.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                handleDeploy();
                setIsDialogOpen(false);
              }}>
                Confirm Deployment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ContractDeploymentSection;
