// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SnakeNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    string public baseURI = "ipfs://Qm.../";

    mapping(uint256 => string) public skinType;

    constructor() ERC721("Snake Skin NFT", "SSKIN") Ownable(msg.sender) {}

    function mintSkin(address to, string memory _skinType) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        skinType[tokenId] = _skinType;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory uri) external onlyOwner {
        baseURI = uri;
    }
}