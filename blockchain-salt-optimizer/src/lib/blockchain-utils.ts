import { ethers } from "ethers";

/**
 * Calculates a deterministic contract address using CREATE2 operation
 * @param deployer The address of the deployer
 * @param salt The salt value to use in the CREATE2 operation
 * @param bytecode The bytecode of the contract to be deployed
 * @returns The deterministic contract address
 */
export const calculateCreate2Address = (
  deployer: string,
  salt: string,
  bytecode: string
): string => {
  // Ensure the salt is a proper hex string
  const saltHex = ethers.zeroPadValue(
    ethers.isHexString(salt) ? salt : ethers.toBeHex(salt),
    32
  );

  // Calculate the CREATE2 address using ethers
  const addressBytes = ethers.getCreate2Address(
    deployer,
    saltHex,
    ethers.keccak256(bytecode)
  );

  return addressBytes;
};

/**
 * Finds a salt value that produces an address matching the specified pattern
 * @param deployer The address of the deployer
 * @param bytecode The bytecode of the contract to be deployed
 * @param pattern The pattern to match in the resulting address
 * @param startValue The value to start searching from
 * @param callback Optional callback to report progress
 * @returns Promise resolving to the found salt and corresponding address
 */
export const findOptimalSalt = async (
  deployer: string,
  bytecode: string,
  pattern: string,
  startValue = 0,
  callback?: (iteration: number, salt: string, address: string) => void
): Promise<{ salt: string; address: string }> => {
  // Convert the pattern to lowercase for case-insensitive comparison
  const targetPattern = pattern.toLowerCase();

  let iteration = 0;
  let currentValue = BigInt(startValue);

  // Continue searching until we find a match
  while (true) {
    // Convert the current value to a hex string to use as salt
    const salt = ethers.toBeHex(currentValue);

    // Calculate the address using the current salt
    const address = calculateCreate2Address(deployer, salt, bytecode);

    // Report progress if callback provided
    if (callback) {
      callback(iteration, salt, address);
    }

    // Check if the address matches the pattern
    if (address.toLowerCase().includes(targetPattern)) {
      return { salt, address };
    }

    // Increment counters
    currentValue += BigInt(1);
    iteration += 1;

    // Allow UI updates by yielding control
    if (iteration % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
};

/**
 * Simulates the deployment of a contract
 * This would typically be replaced with actual blockchain interactions
 */
export const deployContract = async (
  deployer: string,
  salt: string,
  bytecode: string
): Promise<{ txHash: string; address: string }> => {
  // This is a simulation - in reality, you would send a transaction
  const address = calculateCreate2Address(deployer, salt, bytecode);

  // Simulate a delay for the transaction to be processed
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return simulated transaction hash and the deterministic address
  return {
    txHash: "0x" + Math.random().toString(16).substring(2, 66),
    address
  };
};

/**
 * Generates a sample contract bytecode for demonstration
 * In a real app, this would be compiled from Solidity
 */
export const getSampleBytecode = (): string => {
  return "0x608060405234801561001057600080fd5b506101de806100206000396000f3fe608060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063a41368621461004657";
};

/**
 * Formats an address with ellipsis in the middle
 * @param address The address to format
 * @returns Formatted address with ellipsis
 */
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Validates if a string is a valid Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};
