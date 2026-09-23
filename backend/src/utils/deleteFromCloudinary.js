const cloudinary = require("../config/cloudinary");

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        return;
    }

    try {
        const result = await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: "image"
            }
        );

        console.log(
            "Cloudinary delete result:",
            result
        );

        return result;

    } catch (error) {
        console.error(
            "Cloudinary delete failed:",
            error.message
        );

        throw error;
    }
};

module.exports = deleteFromCloudinary;