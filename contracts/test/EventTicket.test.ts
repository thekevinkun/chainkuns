// ============================================
// EventTicket.test.ts
// Tests every core function of the contract
// Run with: npx hardhat test
// ============================================

import { expect } from "chai"; // assertion library
import hre from "hardhat"; // hardhat runtime environment gives us access to ethers, etc.

// ethers is the library for interacting with Ethereum, provided by hardhat
const ethers = hre.ethers;

// CONSTANTS — reused across all tests
const EVENT_NAME = "Chainkuns Launch Party";
const EVENT_SYMBOL = "CKNFT";
const TICKET_PRICE = ethers.parseEther("0.05"); // 0.05 ETH in wei
const MAX_SUPPLY = 100n; // 100 tickets max
const ROYALTY_PERCENT = 5n; // 5% royalty on resales
const SAMPLE_URI = "ipfs://QmSampleHash123"; // fake IPFS URI for testing

// DEPLOY HELPER — reused in every test
async function deployContract() {
  // get test wallets — hardhat gives us fake funded wallets
  const [organizer, buyer, secondBuyer, stranger] = await ethers.getSigners();

  // get the contract factory — blueprint for deploying
  const EventTicketFactory = await ethers.getContractFactory("EventTicket");

  // deploy with organizer as owner
  const contract = await EventTicketFactory.deploy(
    EVENT_NAME,
    EVENT_SYMBOL,
    TICKET_PRICE,
    MAX_SUPPLY,
    ROYALTY_PERCENT,
    organizer.address, // organizer wallet becomes owner
  );

  // wait for deployment to finish
  await contract.waitForDeployment();

  return { contract, organizer, buyer, secondBuyer, stranger };
}

// TESTS
describe("EventTicket", function () {
  // TEST 1 — Deployment
  describe("Deployment", function () {
    it("should deploy with the correct name and symbol", async function () {
      const { contract } = await deployContract();

      const name = await contract.name();
      const symbol = await contract.symbol();

      expect(name).to.equal(EVENT_NAME);
      expect(symbol).to.equal(EVENT_SYMBOL);
    });

    it("should set the correct ticket price", async function () {
      const { contract } = await deployContract();

      const price = await contract.ticketPrice();
      expect(price).to.equal(TICKET_PRICE);
    });

    it("should set the correct max supply", async function () {
      const { contract } = await deployContract();

      const supply = await contract.maxSupply();
      expect(supply).to.equal(MAX_SUPPLY);
    });

    it("should set the correct royalty percent", async function () {
      const { contract } = await deployContract();

      const royalty = await contract.royaltyPercent();
      expect(royalty).to.equal(ROYALTY_PERCENT);
    });

    it("should reject royalty percent above 10", async function () {
      const [organizer] = await ethers.getSigners();
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");

      // this deploy should fail — royalty 15% exceeds hard cap
      await expect(
        EventTicketFactory.deploy(
          EVENT_NAME,
          EVENT_SYMBOL,
          TICKET_PRICE,
          MAX_SUPPLY,
          15n, // invalid — over 10%
          organizer.address,
        ),
      ).to.be.revertedWith("Royalty cannot exceed 10%");
    });
  });

  // TEST 2 — Minting
  describe("Minting", function () {
    it("should mint a ticket to the buyer", async function () {
      const { contract, buyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      const owner = await contract.ownerOf(0n);
      expect(owner).to.equal(buyer.address);
    });

    it("should set the correct token URI after minting", async function () {
      const { contract, buyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      const uri = await contract.tokenURI(0n);
      expect(uri).to.equal(SAMPLE_URI);
    });

    it("should fail if not enough ETH is sent", async function () {
      const { contract, buyer } = await deployContract();

      await expect(
        contract
          .connect(buyer)
          .mintTicket(buyer.address, SAMPLE_URI, {
            value: ethers.parseEther("0.01"),
          }),
      ).to.be.revertedWith("Not enough ETH sent");
    });

    it("should not mint beyond max supply", async function () {
      const [organizer, buyer] = await ethers.getSigners();
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");

      const contract = await EventTicketFactory.deploy(
        EVENT_NAME,
        EVENT_SYMBOL,
        TICKET_PRICE,
        1n, // max supply of just 1
        ROYALTY_PERCENT,
        organizer.address,
      );

      await contract.waitForDeployment();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      await expect(
        contract
          .connect(buyer)
          .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE }),
      ).to.be.revertedWith("Event is sold out");
    });
  });

  // TEST 3 — Resale Listing
  describe("Listing for Resale", function () {
    it("should allow owner to list their ticket", async function () {
      const { contract, buyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      const resalePrice = ethers.parseEther("0.1");

      await contract.connect(buyer).listTicket(0n, resalePrice);

      const listed = await contract.isListed(0n);
      const price = await contract.listingPrice(0n);
      const seller = await contract.originalSeller(0n);

      expect(listed).to.equal(true);
      expect(price).to.equal(resalePrice);
      expect(seller).to.equal(buyer.address);
    });

    it("should not allow non-owner to list a ticket", async function () {
      const { contract, buyer, secondBuyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      await expect(
        contract.connect(secondBuyer).listTicket(0n, ethers.parseEther("0.1")),
      ).to.be.revertedWith("You don't own this ticket");
    });
  });

  // TEST 4 — Cancelling a Listing
  describe("Cancelling a Listing", function () {
    it("should allow owner to cancel their listing", async function () {
      const { contract, buyer } = await deployContract();

      // mint and list first
      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });
      await contract.connect(buyer).listTicket(0n, ethers.parseEther("0.1"));

      // confirm it's listed
      expect(await contract.isListed(0n)).to.equal(true);

      // cancel the listing
      await contract.connect(buyer).cancelListing(0n);

      // all listing state should be cleared
      expect(await contract.isListed(0n)).to.equal(false);
      expect(await contract.listingPrice(0n)).to.equal(0n);
    });

    it("should not allow non-owner to cancel a listing", async function () {
      const { contract, buyer, stranger } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });
      await contract.connect(buyer).listTicket(0n, ethers.parseEther("0.1"));

      // stranger tries to cancel — should fail
      await expect(
        contract.connect(stranger).cancelListing(0n),
      ).to.be.revertedWith("Not the token owner");
    });

    it("should not allow cancelling a ticket that is not listed", async function () {
      const { contract, buyer } = await deployContract();

      // mint but do NOT list
      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      // cancelling an unlisted ticket should fail
      await expect(
        contract.connect(buyer).cancelListing(0n),
      ).to.be.revertedWith("Not listed for sale");
    });

    it("should emit ListingCancelled event", async function () {
      const { contract, buyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });
      await contract.connect(buyer).listTicket(0n, ethers.parseEther("0.1"));

      // cancel should emit the event with correct args
      await expect(contract.connect(buyer).cancelListing(0n))
        .to.emit(contract, "ListingCancelled")
        .withArgs(0n, buyer.address);
    });
  });

  // TEST 5 — Buying Listed Ticket
  describe("Buying a Listed Ticket", function () {
    it("should transfer NFT to buyer and split ETH correctly", async function () {
      const { contract, organizer, buyer, secondBuyer } =
        await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      const resalePrice = ethers.parseEther("0.1");
      await contract.connect(buyer).listTicket(0n, resalePrice);

      const buyerBalanceBefore = await ethers.provider.getBalance(
        buyer.address,
      );
      const organizerBalanceBefore = await ethers.provider.getBalance(
        organizer.address,
      );

      await contract.connect(secondBuyer).buyTicket(0n, { value: resalePrice });

      const newOwner = await contract.ownerOf(0n);
      expect(newOwner).to.equal(secondBuyer.address);

      const organizerBalanceAfter = await ethers.provider.getBalance(
        organizer.address,
      );
      const expectedRoyalty = (resalePrice * 5n) / 100n; // 5%
      expect(organizerBalanceAfter - organizerBalanceBefore).to.equal(
        expectedRoyalty,
      );

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      const expectedSellerAmount = resalePrice - expectedRoyalty;
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(
        expectedSellerAmount,
      );
    });

    it("should fail if not enough ETH sent to buy", async function () {
      const { contract, buyer, secondBuyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });
      await contract.connect(buyer).listTicket(0n, ethers.parseEther("0.1"));

      await expect(
        contract
          .connect(secondBuyer)
          .buyTicket(0n, { value: ethers.parseEther("0.01") }),
      ).to.be.revertedWith("Not enough ETH sent");
    });
  });

  // TEST 6 — Sell Back
  describe("Sell Back", function () {
    it("should return 50% refund and transfer NFT back to organizer", async function () {
      const { contract, organizer, buyer } = await deployContract();

      // fund the contract so it can pay refunds
      await organizer.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("1"),
      });

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      const buyerBalanceBefore = await ethers.provider.getBalance(
        buyer.address,
      );

      const tx = await contract.connect(buyer).sellBack(0n);
      const receipt = await tx.wait();

      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const newOwner = await contract.ownerOf(0n);
      expect(newOwner).to.equal(organizer.address);

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      const expectedRefund = TICKET_PRICE / 2n;
      expect(buyerBalanceAfter).to.equal(
        buyerBalanceBefore + expectedRefund - gasUsed,
      );
    });
  });

  // TEST 7 — Use Ticket at Door
  describe("Using a Ticket", function () {
    it("should mark ticket as used", async function () {
      const { contract, organizer, buyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      await contract.connect(organizer).useTicket(0n);

      const used = await contract.isUsed(0n);
      expect(used).to.equal(true);
    });

    it("should not allow scanning a ticket twice", async function () {
      const { contract, organizer, buyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      await contract.connect(organizer).useTicket(0n);

      await expect(
        contract.connect(organizer).useTicket(0n),
      ).to.be.revertedWith("Ticket already used");
    });

    it("should not allow non-owner to use a ticket", async function () {
      const { contract, buyer } = await deployContract();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      await expect(
        contract.connect(buyer).useTicket(0n),
      ).revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  // TEST 8 — Pause / Unpause
  describe("Pause and Unpause", function () {
    it("should prevent minting when paused", async function () {
      const { contract, organizer, buyer } = await deployContract();

      await contract.connect(organizer).pause();

      await expect(
        contract
          .connect(buyer)
          .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE }),
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    });

    it("should allow minting again after unpause", async function () {
      const { contract, organizer, buyer } = await deployContract();

      await contract.connect(organizer).pause();
      await contract.connect(organizer).unpause();

      await contract
        .connect(buyer)
        .mintTicket(buyer.address, SAMPLE_URI, { value: TICKET_PRICE });

      const owner = await contract.ownerOf(0n);
      expect(owner).to.equal(buyer.address);
    });
  });
});
