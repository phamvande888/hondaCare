const Accessory = require("../models/accessoryModel");
const { checkMissingFields, parseNumberInput } = require("../utils/validators");
const { deleteFiles } = require("../utils/fileHelper");

/**
 * Create accessory
 */
const createAccessory = async (req, res) => {
  const images =
    req.files && req.files.length > 0
      ? req.files.map((file) => file.filename)
      : null;
  try {
    const { name, description, price, stock } = req.body;

    // collect uploaded files (multer upload.array puts files in req.files)

    // require at least one image
    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // check field
    const requiredFields = ["name", "description", "price", "stock"];
    const missingFields = checkMissingFields(req.body, requiredFields);

    if (missingFields.length > 0) {
      deleteFiles(images);
      return res
        .status(400)
        .json({ message: `Missing fields: ${missingFields.join(", ")}` });
    }

    const parsedPrice = parseNumberInput(price);
    const parsedStock = parseNumberInput(stock);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      deleteFiles(images);

      return res
        .status(400)
        .json({ success: false, message: "price must be a valid number >= 0" });
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      deleteFiles(images);

      return res
        .status(400)
        .json({ success: false, message: "stock must be a valid number >= 0" });
    }
    const accessory = new Accessory({
      name,
      description,
      price: parsedPrice,
      stock: Number(parsedStock),
      images: images, // either array of filenames or null
    });

    const saved = await accessory.save();
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      deleteFiles(images);
      return res
        .status(409)
        .json({ success: false, message: "Accessory name already exists" }); // name is unique
    }
    deleteFiles(images);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/**
 * Get all accessories with simple pagination & optional search/isActive filter
 * Query params: page, limit, search, isActive
 */
const getAllAccessories = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const filter = {};
    if (search) filter.name = { $regex: String(search), $options: "i" };
    if (isActive !== undefined)
      filter.isActive = isActive === "true" || isActive === "1";

    const total = await Accessory.countDocuments(filter);
    const data = await Accessory.find(filter)
      .sort({ created_at: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    return res.status(200).json({
      success: true,
      meta: { total, page: p, limit: l, pages: Math.ceil(total / l) },
      data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/**
 * Get accessory by id
 */
const getAccessoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const accessory = await Accessory.findById(id).lean();
    if (!accessory)
      return res
        .status(404)
        .json({ success: false, message: "Accessory not found" });
    return res.status(200).json({ success: true, data: accessory });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/**
 * Update accessory by id
 */
const updateAccessory = async (req, res) => {
  try {
    const { id } = req.params;

    // new uploaded files (if any)
    const newImages =
      req.files && req.files.length > 0
        ? req.files.map((f) => f.filename)
        : null;

    const update = {};
    const allowed = [
      "name",
      "description",
      "price",
      "stock",
      "images",
      "isActive",
    ];

    // collect fields except images (images handled below)
    allowed.forEach((key) => {
      if (key === "images") return;
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        update[key] = req.body[key];
      }
    });

    // handle images: prefer uploaded files, otherwise parse body.images
    if (newImages) {
      update.images = newImages;
    } else if (Object.prototype.hasOwnProperty.call(req.body, "images")) {
      const val = req.body.images;
      let parsed = null;

      if (val === "" || val === "null" || val === null) {
        parsed = null;
      } else if (Array.isArray(val)) {
        parsed = val.length ? val : null;
      } else {
        parsed = String(val)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
        parsed = parsed.length ? parsed : null;
      }

      update.images = parsed;
    }

    // ensure accessory exists before updating
    const existing = await Accessory.findById(id).lean();
    if (!existing) {
      if (newImages) deleteFiles(newImages);
      return res.status(404).json({ success: false, message: "Accessory not found" });
    }

    // không được để trống ảnh nếu đang có ảnh cũ
    if (!update.images || update.images.length === 0) {
      if (existing.images && existing.images.length > 0) {
        if (newImages) deleteFiles(newImages);
        return res.status(400).json({ success: false, message: "Images cannot be empty" });
      }
      // nếu trước đó chưa có ảnh, cho phép null
    }

    // sanitize numeric inputs if provided
    if (update.price !== undefined) {
      const p = parseNumberInput(update.price);
      if (Number.isNaN(p) || p < 0) {
        if (newImages) deleteFiles(newImages);
        return res
          .status(400)
          .json({ success: false, message: "price must be a valid number >= 0" });
      }
      update.price = p;
    }
    if (update.stock !== undefined) {
      const s = parseNumberInput(update.stock);
      if (Number.isNaN(s) || s < 0) {
        if (newImages) deleteFiles(newImages);
        return res
          .status(400)
          .json({ success: false, message: "stock must be a valid number >= 0" });
      }
      update.stock = Number(s);
    }

    if (update.name) update.name = String(update.name).trim();

    const updated = await Accessory.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    // remove old files if replaced by new uploads
    if (
      newImages &&
      existing.images &&
      Array.isArray(existing.images) &&
      existing.images.length > 0
    ) {
      deleteFiles(existing.images);
    }

    // xác định các field đã thay đổi
    const updatedFields = Object.keys(update).filter(
      (key) => JSON.stringify(update[key]) !== JSON.stringify(existing[key])
    );

    return res.status(200).json({
      success: true,
      data: updated,
      updatedFields,
      message: updatedFields.length ? `Updated fields: ${updatedFields.join(", ")}` : "No changes",
    });
  } catch (err) {
    // cleanup newly uploaded files on error
    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map((f) => f.filename);
      deleteFiles(uploaded);
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Accessory name already exists" });
    }
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};


/**
 * Update isActive status (patch)
 * Body: { isActive: true|false }
 */
const updateIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.isActive === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "isActive is required" });
    }
    const updated = await Accessory.findByIdAndUpdate(
      id,
      { isActive: !!req.body.isActive },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Accessory not found" });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/**
 * Delete accessory (hard delete)
 */
const deleteAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Accessory.findByIdAndDelete(id);
    if (!removed)
      return res
        .status(404)
        .json({ success: false, message: "Accessory not found" });
    return res
      .status(200)
      .json({ success: true, message: "Accessory deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

module.exports = {
  createAccessory,
  getAllAccessories,
  getAccessoryById,
  updateAccessory,
  updateIsActive,
  deleteAccessory,
};
