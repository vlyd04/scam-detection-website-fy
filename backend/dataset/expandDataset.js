/**
 * SAFE Dataset Expansion Script
 * ------------------------------
 * 1. Backs up existing dataset
 * 2. Merges new URLs with existing URLs
 * 3. Regenerates full dataset
 * 4. Preserves old model (you retrain separately)
 */

const fs = require("fs");
const path = require("path");

console.log("=".repeat(80));
console.log("DATASET EXPANSION - SAFE MODE");
console.log("=".repeat(80));

// ========== PATHS ==========
const datasetDir = __dirname;
const dataDir = path.join(__dirname, "../data");

const scamFile = path.join(datasetDir, "scam_urls.txt");
const legitFile = path.join(datasetDir, "legit_urls.txt");
const newScamFile = path.join(datasetDir, "new_scam_urls.txt");
const newLegitFile = path.join(datasetDir, "new_legit_urls.txt");

const existingDataset = path.join(dataDir, "scam_dataset.csv");
const backupDataset = path.join(dataDir, `scam_dataset_backup_${Date.now()}.csv`);

// ========== STEP 1: BACKUP ==========
console.log("\n📦 STEP 1: Backing up existing dataset...");

if (fs.existsSync(existingDataset)) {
    fs.copyFileSync(existingDataset, backupDataset);
    console.log(`✅ Backup created: ${path.basename(backupDataset)}`);
} else {
    console.log("⚠️ No existing dataset found (fresh start)");
}

// ========== STEP 2: READ FILES ==========
console.log("\n📥 STEP 2: Reading URL files...");

function readUrls(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return [];
    }
    return fs.readFileSync(filePath, "utf-8")
        .split("\n")
        .map(u => u.trim())
        .filter(Boolean);
}

const existingScam = readUrls(scamFile);
const existingLegit = readUrls(legitFile);
const newScam = readUrls(newScamFile);
const newLegit = readUrls(newLegitFile);

console.log(`  Existing scam URLs:  ${existingScam.length}`);
console.log(`  Existing legit URLs: ${existingLegit.length}`);
console.log(`  New scam URLs:       ${newScam.length}`);
console.log(`  New legit URLs:      ${newLegit.length}`);

// ========== STEP 3: MERGE & DEDUPLICATE ==========
console.log("\n🔀 STEP 3: Merging and deduplicating...");

function mergeAndDedupe(existing, newUrls) {
    const combined = [...existing, ...newUrls];
    const unique = [...new Set(combined)];  // Remove duplicates
    return unique;
}

const finalScam = mergeAndDedupe(existingScam, newScam);
const finalLegit = mergeAndDedupe(existingLegit, newLegit);

console.log(`  Final scam URLs:  ${finalScam.length} (removed ${existingScam.length + newScam.length - finalScam.length} duplicates)`);
console.log(`  Final legit URLs: ${finalLegit.length} (removed ${existingLegit.length + newLegit.length - finalLegit.length} duplicates)`);

// ========== STEP 4: WRITE MERGED FILES ==========
console.log("\n💾 STEP 4: Writing merged URL files...");

fs.writeFileSync(scamFile, finalScam.join("\n"));
fs.writeFileSync(legitFile, finalLegit.join("\n"));

console.log(`✅ Updated: ${path.basename(scamFile)}`);
console.log(`✅ Updated: ${path.basename(legitFile)}`);

// ========== STEP 5: ARCHIVE NEW FILES ==========
console.log("\n📁 STEP 5: Archiving new URL files...");

if (fs.existsSync(newScamFile)) {
    const archiveName = `new_scam_urls_archived_${Date.now()}.txt`;
    fs.renameSync(newScamFile, path.join(datasetDir, archiveName));
    console.log(`✅ Archived: ${archiveName}`);
}

if (fs.existsSync(newLegitFile)) {
    const archiveName = `new_legit_urls_archived_${Date.now()}.txt`;
    fs.renameSync(newLegitFile, path.join(datasetDir, archiveName));
    console.log(`✅ Archived: ${archiveName}`);
}

// ========== SUMMARY ==========
console.log("\n" + "=".repeat(80));
console.log("✅ DATASET EXPANSION COMPLETE");
console.log("=".repeat(80));
console.log(`
📊 Summary:
   - Total scam URLs:  ${finalScam.length} (was ${existingScam.length})
   - Total legit URLs: ${finalLegit.length} (was ${existingLegit.length})
   - Total URLs:       ${finalScam.length + finalLegit.length}
   - Backup saved:     ${path.basename(backupDataset)}

📝 Next Steps:
   1. Regenerate dataset: cd backend/dataset && node generateDataset.js
   2. Retrain model:     cd ml-service && python train.py
   3. Test new model:    cd backend && node testPredictionAccuracy.js

⚠️ Important:
   - Old model is preserved in ml-service/scam_model.pkl
   - Old dataset backed up as ${path.basename(backupDataset)}
   - If something goes wrong, restore from backup
`);

console.log("=".repeat(80));
