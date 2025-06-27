import mongo from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const connectToMongo = async () => {
    try {
        const mongoUri = `${process.env.DB_CONN_STRING}/${process.env.DB_NAME}`;
        console.log('Connecting to MongoDB at:', mongoUri);
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }
        await mongo.connect(mongoUri);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectToMongo;
