import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const Create2Explanation: React.FC = () => {
  return (
    <Card className="w-full bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Info size={18} className="text-primary" />
          How CREATE2 Works
        </CardTitle>
        <CardDescription>
          Understanding deterministic contract deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">What is CREATE2?</h3>
            <p className="text-muted-foreground">
              CREATE2 is an Ethereum opcode that allows you to deploy contracts to a
              predetermined address. Unlike regular contract deployment (CREATE opcode),
              the resulting address is independent of the sender's nonce.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-1">How it's calculated</h3>
            <p className="text-muted-foreground">
              The contract address is calculated using:
            </p>
            <code className="block bg-background p-2 rounded-md my-2 text-xs">
              keccak256(0xff + deployer_address + salt + keccak256(bytecode))
            </code>
            <p className="text-muted-foreground">
              By changing the salt value, you can generate different addresses for the same contract bytecode.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Security considerations</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                The salt value must be kept secure if you intend to deploy at a later time
              </li>
              <li>
                The contract bytecode must remain exactly the same for the address to match
              </li>
              <li>
                Anyone with knowledge of the salt, deployer address, and bytecode can predict the address
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-1">Use cases</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                Vanity addresses with recognizable patterns
              </li>
              <li>
                Cross-chain deployments to identical addresses
              </li>
              <li>
                Gas-optimized counterfactual deployments for L2 solutions
              </li>
              <li>
                Predictable addresses for multi-step contract interactions
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Create2Explanation;
