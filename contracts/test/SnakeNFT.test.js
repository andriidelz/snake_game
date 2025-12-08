const { expect } = require("chai");

describe("SnakeNFT", function () {
  it("Should mint skin", async function () {
    const SnakeNFT = await ethers.getContractFactory("SnakeNFT");
    const snake = await SnakeNFT.deploy();
    await snake.waitForDeployment();

    await snake.mintSkin("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "golden");
    expect(await snake.ownerOf(0)).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  });
});