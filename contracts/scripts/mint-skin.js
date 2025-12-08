async function main() {
  const [owner] = await ethers.getSigners();
  const SnakeNFT = await ethers.getContractFactory("SnakeNFT");
  const snake = await SnakeNFT.attach("0xYourDeployedAddress");

  await snake.mintSkin("0xRecipientAddress", "legendary-golden");
  console.log("Minted legendary-golden skin!");
}

main();