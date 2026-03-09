const mongoose = require('mongoose');
require('dotenv').config();

const localURI = 'mongodb://127.0.0.1:27017/campus-erp';
// Adding the database name 'campus-erp' to the end of your Atlas URL
const atlasURI = 'mongodb+srv://elangovanelangovan2003_db_user:aUDgrNNj5gHvP1U8@clustererp.jf3chjl.mongodb.net/campus-erp?appName=Clustererp';

async function migrateData() {
    console.log('Connecting to Local Database...');
    const localDb = await mongoose.createConnection(localURI).asPromise();
    console.log('Connected to Local DB successfully!');

    console.log('Connecting to Atlas Database...');
    const atlasDb = await mongoose.createConnection(atlasURI).asPromise();
    console.log('Connected to Atlas DB successfully!');

    // Get all collections from the local DB
    const collections = await localDb.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate.`);

    for (let collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        console.log(`\nMigrating collection: ${collectionName} ...`);

        // Fetch all documents from local collection
        const localCollection = localDb.collection(collectionName);
        const documents = await localCollection.find({}).toArray();
        console.log(` - Read ${documents.length} documents from local.`);

        if (documents.length > 0) {
            // Insert into Atlas collection
            const targetCollection = atlasDb.collection(collectionName);

            // Clear target collection first to avoid duplicate key errors if run multiple times
            await targetCollection.deleteMany({});

            await targetCollection.insertMany(documents);
            console.log(` - Successfully inserted ${documents.length} documents to Atlas!`);
        } else {
            console.log(` - Skipped empty collection.`);
        }
    }

    console.log('\nMigration fully completed!');
    await localDb.close();
    await atlasDb.close();
    process.exit(0);
}

migrateData().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
