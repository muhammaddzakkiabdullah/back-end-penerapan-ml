const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
    try {
        // Validasi ukuran file
        const maxFileSize = 1000000; // 1 MB
        if (image.length > maxFileSize) {
            const error = new Error("Payload content length greater than maximum allowed: 1000000");
            error.statusCode = 413;
            throw error;
        }

        // Proses gambar menjadi tensor
        const tensor = tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat();

        // Prediksi menggunakan model
        const prediction = model.predict(tensor);
        const score = await prediction.data();
        const confidenceScore = Math.max(...score) * 100;

        // Tentukan label dan saran berdasarkan confidence score
        const label = confidenceScore <= 50 ? 'Non-cancer' : 'Cancer';
        let suggestion = label === 'Cancer'
            ? "Segera periksa ke dokter!"
            : "Penyakit kanker tidak terdeteksi.";

        return { label, suggestion };
    } catch (error) {
        // Tangani error input dan prediksi
        if (error.statusCode === 413) {
            throw { status: "fail", message: error.message, statusCode: 413 };
        }
        throw { status: "fail", message: "Terjadi kesalahan dalam melakukan prediksi", statusCode: 400 };
    }
}

module.exports = predictClassification;
