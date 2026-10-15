// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title LandParcelNFT
/// @notice A green land title for one forest plot in the LaoGreen Pool.
/// @dev Personal data and raw KML must stay off-chain. Store only an IPFS URI
///      and the hash of a normalized KML boundary in this contract.
contract LandParcelNFT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    enum ParcelStatus {
        Pending,
        Verified,
        Rejected
    }

    struct Parcel {
        uint256 tokenId;
        bytes32 boundaryHash;
        uint256 areaSqMeters;
        bytes32 poolId;
        ParcelStatus status;
        uint64 submittedAt;
        uint64 verifiedAt;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => Parcel) private _parcels;
    mapping(bytes32 => bool) public boundaryRegistered;

    event ParcelSubmitted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed boundaryHash,
        uint256 areaSqMeters,
        string metadataURI
    );
    event ParcelVerified(uint256 indexed tokenId, bytes32 indexed poolId, address indexed verifier);
    event ParcelRejected(uint256 indexed tokenId, address indexed verifier, string reason);

    error InvalidBoundary();
    error InvalidArea();
    error DuplicateBoundary();
    error ParcelNotPending();

    constructor(address admin) ERC721("LaoGreen Land Parcel", "LGLAND") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
    }

    /// @notice Registers a forest plot and creates its pending green land title.
    /// @param boundaryHash keccak256 hash of normalized KML/GeoJSON polygon.
    /// @param metadataURI IPFS URI for non-sensitive plot metadata and evidence.
    /// @param areaSqMeters Measured plot area in square metres.
    function registerParcel(
        bytes32 boundaryHash,
        string calldata metadataURI,
        uint256 areaSqMeters
    ) external returns (uint256 tokenId) {
        if (boundaryHash == bytes32(0)) revert InvalidBoundary();
        if (areaSqMeters == 0) revert InvalidArea();
        if (boundaryRegistered[boundaryHash]) revert DuplicateBoundary();

        tokenId = _nextTokenId++;
        boundaryRegistered[boundaryHash] = true;
        _parcels[tokenId] = Parcel({
            tokenId: tokenId,
            boundaryHash: boundaryHash,
            areaSqMeters: areaSqMeters,
            poolId: bytes32(0),
            status: ParcelStatus.Pending,
            submittedAt: uint64(block.timestamp),
            verifiedAt: 0
        });

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        emit ParcelSubmitted(tokenId, msg.sender, boundaryHash, areaSqMeters, metadataURI);
    }

    /// @notice Approves a pending plot and assigns it to a Carbon Pool.
    function verifyParcel(uint256 tokenId, bytes32 poolId) external onlyRole(VERIFIER_ROLE) {
        Parcel storage parcel = _parcelFor(tokenId);
        if (parcel.status != ParcelStatus.Pending) revert ParcelNotPending();
        if (poolId == bytes32(0)) revert InvalidBoundary();

        parcel.status = ParcelStatus.Verified;
        parcel.poolId = poolId;
        parcel.verifiedAt = uint64(block.timestamp);
        emit ParcelVerified(tokenId, poolId, msg.sender);
    }

    /// @notice Rejects a pending plot while preserving a transparent audit trail.
    function rejectParcel(uint256 tokenId, string calldata reason) external onlyRole(VERIFIER_ROLE) {
        Parcel storage parcel = _parcelFor(tokenId);
        if (parcel.status != ParcelStatus.Pending) revert ParcelNotPending();
        parcel.status = ParcelStatus.Rejected;
        emit ParcelRejected(tokenId, msg.sender, reason);
    }

    function getParcel(uint256 tokenId) external view returns (Parcel memory) {
        _requireOwned(tokenId);
        return _parcels[tokenId];
    }

    function _parcelFor(uint256 tokenId) private view returns (Parcel storage parcel) {
        _requireOwned(tokenId);
        parcel = _parcels[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
