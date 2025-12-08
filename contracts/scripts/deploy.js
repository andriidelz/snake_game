async function main() {
  const SnakeNFT = await ethers.getContractFactory("SnakeNFT");
  const snake = await SnakeNFT.deploy();
  await snake.waitForDeployment();
  console.log("SnakeNFT deployed to:", await snake.getAddress());
}

main();