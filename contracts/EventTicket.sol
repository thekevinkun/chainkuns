// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// ============================================
// EventTicket.sol
// One contract is deployed per event.
// Handles minting, resale, royalties, and validation.
// ============================================

// OpenZeppelin battle-tested base contracts
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // standard NFT
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // store metadata URI per token
import "@openzeppelin/contracts/access/Ownable.sol"; // onlyOwner modifier
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // prevents reentrancy attacks
import "@openzeppelin/contracts/utils/Pausable.sol"; // emergency pause

contract EventTicket is
    ERC721,
    ERC721URIStorage,
    Ownable,
    ReentrancyGuard,
    Pausable
{
    // STATE VARIABLES
    uint256 public ticketPrice; // price to mint one ticket (in wei)
    uint256 public royaltyPercent; // % organizer earns on every resale (max 10)
    uint256 public maxSupply; // total tickets available for this event
    uint256 private _tokenIdCounter; // auto-increments — each ticket gets a unique number

    // tracks resale listings: tokenId → listing price (in wei)
    mapping(uint256 => uint256) public listingPrice;

    // tracks whether a ticket is currently listed for resale
    mapping(uint256 => bool) public isListed;

    // tracks who originally listed the ticket (the seller)
    mapping(uint256 => address) public originalSeller;

    // tracks whether a ticket has been used at the door
    mapping(uint256 => bool) public isUsed;

    // EVENTS — frontend listens for these
    event TicketMinted(address indexed to, uint256 indexed tokenId, string uri);
    event TicketListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event TicketSold(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );
    event TicketUsed(uint256 indexed tokenId);
    event TicketSoldBack(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 refund
    );

    // CONSTRUCTOR — called once when contract is deployed
    constructor(
        string memory eventName, // e.g. "Chainkuns Launch Party"
        string memory eventSymbol, // e.g. "CKNFT"
        uint256 _ticketPrice, // price in wei (e.g. 0.05 ETH = 50000000000000000)
        uint256 _maxSupply, // e.g. 500 tickets
        uint256 _royaltyPercent, // e.g. 5 (means 5%) — max 10
        address _organizer // organizer wallet — becomes the owner
    ) ERC721(eventName, eventSymbol) Ownable(_organizer) {
        require(_royaltyPercent <= 10, "Royalty cannot exceed 10%"); // hard cap from the doc
        ticketPrice = _ticketPrice;
        maxSupply = _maxSupply;
        royaltyPercent = _royaltyPercent;
    }

    // MINT — user pays ticketPrice, gets an NFT ticket
    function mintTicket(
        address to,
        string memory uri
    )
        public
        payable
        nonReentrant // prevents calling this twice in one transaction (drain attack)
        whenNotPaused // organizer can pause minting in an emergency
    {
        require(msg.value >= ticketPrice, "Not enough ETH sent"); // check payment
        require(_tokenIdCounter < maxSupply, "Event is sold out"); // check supply

        uint256 tokenId = _tokenIdCounter; // grab current counter as this ticket's ID
        _tokenIdCounter++; // increment for next ticket

        _safeMint(to, tokenId); // mint the NFT to buyer's wallet
        _setTokenURI(tokenId, uri); // attach metadata URI (stored on IPFS)

        emit TicketMinted(to, tokenId, uri); // notify frontend
    }

    // LIST — ticket owner puts their ticket up for resale
    function listTicket(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own this ticket"); // must own it
        require(!isUsed[tokenId], "Used tickets cannot be resold"); // can't resell used ticket
        require(price > 0, "Price must be greater than zero"); // sanity check

        isListed[tokenId] = true; // mark as listed
        listingPrice[tokenId] = price; // set resale price
        originalSeller[tokenId] = msg.sender; // remember who is selling

        emit TicketListed(tokenId, msg.sender, price); // notify frontend
    }

    // BUY — buyer pays, ETH splits between seller and organizer
    // Follows Check-Effects-Interactions pattern (critical for security)
    function buyTicket(
        uint256 tokenId
    )
        public
        payable
        nonReentrant // prevents reentrancy drain attack
        whenNotPaused
    {
        // 1. CHECK — validate everything first
        require(isListed[tokenId], "Ticket is not listed for sale");
        require(msg.value >= listingPrice[tokenId], "Not enough ETH sent");

        // 2. EFFECTS — update state BEFORE sending any ETH
        isListed[tokenId] = false; // remove from listings
        address seller = originalSeller[tokenId]; // grab seller address
        uint256 price = listingPrice[tokenId]; // grab agreed price
        listingPrice[tokenId] = 0; // clear listing price
        originalSeller[tokenId] = address(0); // clear seller record

        // 3. INTERACTIONS — send ETH and transfer NFT last
        uint256 royalty = (price * royaltyPercent) / 100; // calculate organizer cut
        uint256 sellerAmount = price - royalty; // what seller actually gets

        payable(seller).transfer(sellerAmount); // pay the seller
        payable(owner()).transfer(royalty); // pay the organizer (royalty)

        _transfer(seller, msg.sender, tokenId); // transfer NFT to buyer

        emit TicketSold(tokenId, msg.sender, price); // notify frontend
    }

    // SELL BACK — owner returns ticket to platform for partial refund
    function sellBack(uint256 tokenId) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You don't own this ticket"); // must own it
        require(!isUsed[tokenId], "Used tickets cannot be sold back"); // can't return used ticket
        require(
            address(this).balance >= ticketPrice / 2,
            "Platform has insufficient funds"
        ); // contract must have enough ETH

        uint256 refundAmount = ticketPrice / 2; // refund is 50% of original price

        // EFFECTS first — transfer NFT back to organizer before sending ETH
        _transfer(msg.sender, owner(), tokenId); // return NFT to organizer

        // INTERACTIONS last — send the refund
        payable(msg.sender).transfer(refundAmount); // send 50% refund to seller

        emit TicketSoldBack(tokenId, msg.sender, refundAmount); // notify frontend
    }

    // USE TICKET — event staff scans QR and marks ticket as used at the door
    function useTicket(uint256 tokenId) public onlyOwner {
        require(_tokenIdCounter > tokenId, "Ticket does not exist"); // token must exist
        require(!isUsed[tokenId], "Ticket already used"); // can't scan twice

        isUsed[tokenId] = true; // mark as used

        emit TicketUsed(tokenId); // notify frontend
    }

    // EMERGENCY — organizer can pause/unpause contract
    function pause() public onlyOwner {
        _pause(); // from OpenZeppelin Pausable
    }

    function unpause() public onlyOwner {
        _unpause(); // from OpenZeppelin Pausable
    }

    // HELPERS — required overrides when using multiple OpenZeppelin contracts

    // returns the metadata URI for a given token
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // checks which interfaces this contract supports (required by ERC721)
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // allows the contract itself to receive ETH (needed for sell back refunds)
    receive() external payable {}
}
