const { Storage } = require('@google-cloud/storage');
const storage    = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;
if (!bucketName) throw new Error('Missing env var GCS_BUCKET_NAME');
const bucket     = storage.bucket(bucketName);

// Upload buffer → private GCS object path
async function uploadFile(buffer, destPath, contentType) {
  const file = bucket.file(destPath);
  await file.save(buffer, { metadata: { contentType }, resumable: false });
  return destPath;
}

// Delete GCS object
async function deleteFile(destPath) {
  try {
    await bucket.file(destPath).delete();
  } catch (err) {
    if (err.code !== 404) throw err;
  }
}

module.exports = { uploadFile, deleteFile };
