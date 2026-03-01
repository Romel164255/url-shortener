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
    const { url, customAlias } = req.body;

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

    const newUrl = await createShortUrl(url, customAlias);

    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${newUrl.short_id}`,
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

    res.redirect(originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shortenUrl,
  redirectUrl,
};