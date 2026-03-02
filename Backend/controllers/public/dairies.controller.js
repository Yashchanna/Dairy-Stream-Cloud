import {
  listPublicDairies,
  getPublicDairyById,
} from "../../services/public/dairies.service.js";

export const getPublicDairies = async (req, res) => {
  try {
    const { search = "", lat, lng, radius = 10, city, pincode } = req.query;

    const filters = {
      search,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      radius: parseFloat(radius),
      city: city || null,
      pincode: pincode || null,
    };

    const dairies = await listPublicDairies(filters);

    res.json({ dairies });
  } catch (err) {
    console.error("PUBLIC DAIRIES ERROR:", err.message);

    res.status(500).json({
      message: "Failed to fetch dairies",
    });
  }
};

export const getPublicDairy = async (req, res) => {
  try {
    const { id } = req.params;

    const dairy = await getPublicDairyById(id);

    res.json({ dairy });
  } catch (err) {
    console.error("PUBLIC DAIRY ERROR:", err.message);

    res.status(500).json({
      message: "Failed to fetch dairy",
    });
  }
};
