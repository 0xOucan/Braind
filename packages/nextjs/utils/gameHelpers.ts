import { cairo } from 'starknet';

/**
 * Extracts game_id from a GameStarted event in a transaction receipt
 */
export function extractGameIdFromReceipt(receipt: any): bigint | null {
  const gameStartedEvent = receipt.events?.find((e: any) =>
    e.keys && e.keys[0] === cairo.getSelectorFromName('GameStarted')
  );

  if (gameStartedEvent && gameStartedEvent.data && gameStartedEvent.data.length > 0) {
    return BigInt(gameStartedEvent.data[0]);
  }

  return null;
}

/**
 * Creates a multicall transaction for approve + start_game
 */
export function createApproveAndStartGameCalls(
  strkTokenAddress: string,
  gameContractAddress: string,
  approvalAmount: ReturnType<typeof cairo.uint256>,
  startGameArgs: any[]
) {
  return [
    {
      contractAddress: strkTokenAddress,
      entrypoint: 'approve',
      calldata: [gameContractAddress, approvalAmount.low, approvalAmount.high]
    },
    {
      contractAddress: gameContractAddress,
      entrypoint: 'start_game',
      calldata: startGameArgs
    }
  ];
}
