const Wishlist = require("../../models/wishlist/wishlistModal");
const Product = require("../../models/product/productModel");
const Variant = require("../../models/product/variantModel");
const SizeVariant = require("../../models/product/sizesVariantModel");
const asyncHandler = require("express-async-handler");

const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId, sizeVariantId } = req.body;

    console.log("Received IDs:", { productId, variantId, sizeVariantId });

    if (!productId || !variantId || !sizeVariantId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId);
    const variant = await Variant.findById(variantId);
    const sizeVariant = await SizeVariant.findById(sizeVariantId);

    console.log("Found Documents:", { product, variant, sizeVariant });

    if (!product || !variant || !sizeVariant) {
      return res
        .status(404)
        .json({ message: "Product, variant, or size variant not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        items: [],
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.variant && item.sizeVariant
    );

    const itemExists = wishlist.items.some(
      (item) =>
        item.product.toString() === productId &&
        item.variant.toString() === variantId &&
        item.sizeVariant.toString() === sizeVariantId
    );

    if (!itemExists) {
      wishlist.items.push({
        product: productId,
        variant: variantId,
        sizeVariant: sizeVariantId,
      });

      await wishlist.save();
      return res.status(201).json({
        message: "Product added to wishlist successfully",
        wishlist,
      });
    }

    res.status(400).json({ message: "Product already in wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "items.product",
        select:
          "name description category brand material pattern ratings gender activeOffer discountedPrice",
      })
      .populate({
        path: "items.variant",
        model: "Variant",
        select: "color mainImage",
      })
      .populate({
        path: "items.sizeVariant",
        model: "SizeVariant",
        select: "size price discountPrice stockCount",
      });

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(200).json({
        message: "Wishlist is empty",
        Wishlist: [],
      });
    }

    const validItems = wishlist.items.filter(
      (item) => item.product && item.variant && item.sizeVariant
    );

    const formattedWishlist = validItems.map((item) => {
      const itemObj = item.toObject ? item.toObject() : item;
      if (itemObj.sizeVariant) {
        if (
          itemObj.sizeVariant.discountPrice === undefined ||
          itemObj.sizeVariant.discountPrice === null
        ) {
          itemObj.sizeVariant.discountPrice = itemObj.sizeVariant.price;
        }
      }
      return itemObj;
    });

    res.status(200).json({
      message: "Wishlist retrieved successfully",
      Wishlist: formattedWishlist,
    });
  } catch (error) {
    console.error("Error fetching Wishlist:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

const deleteProductFromWhishlist = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId || req.body?.itemId || req.query?.itemId;
  const productId = req.body?.productId || req.query?.productId;
  const variantId = req.body?.variantId || req.query?.variantId;
  const sizeVariantId = req.body?.sizeVariantId || req.query?.sizeVariantId;

  if (!itemId && (!productId || !variantId || !sizeVariantId)) {
    return res.status(400).json({
      message: "Item ID or product details are required",
    });
  }

  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    let itemIndex = -1;

    if (itemId) {
      itemIndex = wishlist.items.findIndex(
        (item) => item._id && item._id.toString() === itemId.toString()
      );
    } else {
      itemIndex = wishlist.items.findIndex(
        (item) =>
          item.product &&
          item.product.toString() === productId.toString() &&
          item.variant &&
          item.variant.toString() === variantId.toString() &&
          item.sizeVariant &&
          item.sizeVariant.toString() === sizeVariantId.toString()
      );
    }

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    wishlist.items.splice(itemIndex, 1);
    wishlist.totalItems = wishlist.items.length;

    await wishlist.save();

    res.status(200).json({
      message: "Product removed from wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({
      message: "Error removing product from wishlist",
      error: error.message,
    });
  }
});
module.exports = { addToWishlist, getWishlist, deleteProductFromWhishlist };
