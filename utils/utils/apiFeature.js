export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

export const shortenAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;