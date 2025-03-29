import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { isValidAddress } from "@/lib/blockchain-utils";

export interface AddressPatternInputProps {
  onSubmit: (data: AddressPatternFormData) => void;
  isProcessing: boolean;
}

export interface AddressPatternFormData {
  pattern: string;
  deployerAddress: string;
  customBytecode?: string;
}

const AddressPatternInput: React.FC<AddressPatternInputProps> = ({
  onSubmit,
  isProcessing,
}) => {
  const form = useForm<AddressPatternFormData>({
    defaultValues: {
      pattern: "",
      deployerAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // Default address for demo
      customBytecode: "",
    },
  });

  const handleSubmit = (data: AddressPatternFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Input Parameters
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={16} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[350px]">
                <p>
                  Enter a pattern to search for in the generated contract address.
                  The system will find a salt value that produces an address with
                  your pattern.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Define the parameters for your deterministic contract deployment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address Pattern
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={14} className="ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[350px]">
                          <p>
                            Enter a hexadecimal pattern you want in your contract address,
                            like "d0d0" or "cafe". The optimizer will find a salt that
                            generates an address containing this pattern.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. d0d0, cafe, etc."
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    A hex pattern that you want in your contract address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deployerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deployer Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The Ethereum address that will deploy the contract
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customBytecode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Custom Bytecode (Optional)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={14} className="ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[350px]">
                          <p>
                            You can provide custom EVM bytecode for the contract.
                            Leave empty to use a sample contract bytecode.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional bytecode for your contract (leave empty to use default)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isProcessing || !form.getValues().pattern}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Find Optimal Salt"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddressPatternInput;
