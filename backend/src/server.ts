import app from './app';
import dotenv from 'dotenv';
import connectToMongo from './config/mongo';

dotenv.config();



const PORT: number = parseInt(process.env.PORT || '5050', 10);

const startServer = async () => {
  try {
    await connectToMongo();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
