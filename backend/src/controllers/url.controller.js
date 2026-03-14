const {
  createShortUrl,
  getOriginalUrl,
} = require("../services/url.service");

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const shortenUrl = async (req, res, next) => {
  try {
    const { url, customAlias, expiresIn } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // 🔹 Validate custom alias (optional)
    if (customAlias && !/^[a-zA-Z0-9-]+$/.test(customAlias)) {
      return res
        .status(400)
        .json({ message: "Custom alias can only contain letters, numbers and hyphen" });
    }

    // 🔹 Validate expiresIn (optional, must be a positive integer in seconds)
    if (expiresIn !== undefined && (!Number.isInteger(expiresIn) || expiresIn <= 0)) {
      return res
        .status(400)
        .json({ message: "expiresIn must be a positive integer (seconds)" });
    }

    const newUrl = await createShortUrl(url, customAlias, expiresIn ?? null);

    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${newUrl.short_id}`,
      expiresAt: newUrl.expires_at ?? null,
    });
  } catch (error) {
    if (error.message === "Custom URL already taken") {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

const redirectUrl = async (req, res, next) => {
  try {
    const { shortId } = req.params;

    const originalUrl = await getOriginalUrl(shortId);

    if (!originalUrl) {
      return res.status(404).json({ message: "URL not found" });
    }

    // 🔹 Handle expired links with 410 Gone
    if (originalUrl === "EXPIRED") {
      return res.status(410).json({ message: "This link has expired" });
    }

    res.redirect(originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shortenUrl,
  redirectUrl,
};